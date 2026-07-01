/* ============================================================
   CROWN HAIR OIL — Store logic
   Data persists in the browser via localStorage:
     crown_products  -> product catalog
     crown_cart      -> current cart
     crown_orders    -> submitted orders (visible in admin)
   No backend is required for this to work, but localStorage is
   per-browser/per-device — for a real multi-device store this
   data should eventually move to a server or a connected service.
   ============================================================ */

const ADMIN_PASSWORD = "crown2026"; // غيّري هذه الكلمة من هنا
const SHIPPING_FLAT = 20; // ريال — رسوم شحن ثابتة، عدّلي القيمة حسب الحاجة
const FREE_SHIP_OVER = 200;

const DEFAULT_PRODUCTS = [
  {
    id: "p-001",
    name: "Crown Hair Oil — زيت الشعر الأساسي",
    desc: "مزيج 100٪ طبيعي من زيت الأرغان والروزماري وزيت الزيتون، لتطويل الشعر وتكثيفه وتغذيته من الجذور حتى الأطراف.",
    price: 119,
    oldPrice: 149,
    stock: 24,
    category: "زيوت الشعر",
    image: "assets/hero-light.jpg"
  }
];

/* ---------------- storage helpers ---------------- */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getProducts() {
  let products = readJSON("crown_products", null);
  if (!products) {
    products = DEFAULT_PRODUCTS;
    writeJSON("crown_products", products);
  }
  return products;
}
function saveProducts(products) {
  writeJSON("crown_products", products);
}
function getCart() {
  return readJSON("crown_cart", []);
}
function saveCart(cart) {
  writeJSON("crown_cart", cart);
}
function getOrders() {
  return readJSON("crown_orders", []);
}
function saveOrders(orders) {
  writeJSON("crown_orders", orders);
}
function money(n) {
  return Number(n).toLocaleString("ar-SA", { minimumFractionDigits: 0 }) + " ر.س";
}
function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}
function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2400);
}

/* ---------------- cart count badge ---------------- */
function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}
function refreshCartBadge() {
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = cartCount();
}

/* ---------------- product grid (store.html) ---------------- */
function stockLabel(stock) {
  if (stock <= 0) return `<span class="stock-note out">غير متوفر حالياً</span>`;
  if (stock <= 5) return `<span class="stock-note low">باقي ${stock} قطع فقط</span>`;
  return `<span class="stock-note">متوفر</span>`;
}

function renderProductGrid(filterCategory) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const products = getProducts();
  const filtered = filterCategory && filterCategory !== "الكل"
    ? products.filter(p => p.category === filterCategory)
    : products;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">لا توجد منتجات في هذا التصنيف حالياً.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-thumb"><img src="${p.image}" alt="${p.name}"></div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p class="desc">${p.desc || ""}</p>
        <div class="product-price-row">
          <div>
            <span class="price">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ""}
          </div>
          ${stockLabel(p.stock)}
        </div>
        <button class="btn btn-primary btn-block btn-sm" ${p.stock <= 0 ? "disabled" : ""}
          onclick="addToCart('${p.id}')">${p.stock <= 0 ? "غير متوفر" : "أضف للسلة"}</button>
      </div>
    </div>
  `).join("");
}

function renderCategoryFilter() {
  const wrap = document.getElementById("tagFilter");
  if (!wrap) return;
  const products = getProducts();
  const cats = ["الكل", ...new Set(products.map(p => p.category).filter(Boolean))];
  wrap.innerHTML = cats.map((c, i) =>
    `<button class="${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");
  wrap.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      wrap.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProductGrid(btn.dataset.cat);
    });
  });
}

/* ---------------- cart actions ---------------- */
function addToCart(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product || product.stock <= 0) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  }
  saveCart(cart);
  refreshCartBadge();
  renderCartDrawer();
  toast("تمت إضافة المنتج إلى السلة");
  openCart();
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  const newCart = item.qty <= 0 ? cart.filter(i => i.id !== productId) : cart;
  saveCart(newCart);
  refreshCartBadge();
  renderCartDrawer();
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
  refreshCartBadge();
  renderCartDrawer();
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCartDrawer() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!itemsEl) return;
  const cart = getCart();
  if (!cart.length) {
    itemsEl.innerHTML = `<div class="empty-state">سلتك فارغة، تصفحي المنتجات وأضيفي ما يناسبك.</div>`;
  } else {
    itemsEl.innerHTML = cart.map(i => `
      <div class="cart-item">
        <img src="${i.image}" alt="${i.name}">
        <div class="cart-item-info">
          <h4>${i.name}</h4>
          <span>${money(i.price)}</span>
          <div class="qty-row">
            <button onclick="changeQty('${i.id}', -1)">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty('${i.id}', 1)">+</button>
          </div>
          <button class="cart-remove" onclick="removeFromCart('${i.id}')">إزالة</button>
        </div>
      </div>
    `).join("");
  }
  if (totalEl) totalEl.textContent = money(cartTotal());
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
}

/* ---------------- checkout page ---------------- */
function renderCheckoutSummary() {
  const el = document.getElementById("checkoutSummary");
  if (!el) return;
  const cart = getCart();
  const subtotal = cartTotal();
  const shipping = cart.length === 0 ? 0 : (subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FLAT);
  const total = subtotal + shipping;

  if (!cart.length) {
    el.innerHTML = `<div class="empty-state">السلة فارغة. أضيفي منتجات قبل إتمام الطلب.</div>`;
    return;
  }

  el.innerHTML = `
    ${cart.map(i => `<div class="order-line"><span>${i.name} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></div>`).join("")}
    <div class="order-line"><span>الشحن</span><span>${shipping === 0 ? "مجاني" : money(shipping)}</span></div>
    <div class="order-line total"><span>الإجمالي</span><span>${money(total)}</span></div>
  `;
}

function submitOrder(e) {
  e.preventDefault();
  const cart = getCart();
  if (!cart.length) {
    toast("السلة فارغة");
    return;
  }
  const form = e.target;
  const data = new FormData(form);
  const payMethod = data.get("payMethod");
  if (payMethod === "card") {
    toast("الدفع بالبطاقة غير مفعّل بعد");
    return;
  }

  const subtotal = cartTotal();
  const shipping = subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FLAT;

  const order = {
    id: uid("ORD"),
    date: new Date().toISOString(),
    name: data.get("name"),
    phone: data.get("phone"),
    city: data.get("city"),
    address: data.get("address"),
    notes: data.get("notes") || "",
    payMethod,
    items: cart,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: "جديد"
  };

  // reduce stock
  const products = getProducts();
  cart.forEach(ci => {
    const p = products.find(p => p.id === ci.id);
    if (p) p.stock = Math.max(0, p.stock - ci.qty);
  });
  saveProducts(products);

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  saveCart([]);
  refreshCartBadge();

  document.getElementById("checkoutForm").style.display = "none";
  document.getElementById("orderConfirm").style.display = "block";
  document.getElementById("orderNumber").textContent = order.id;
}

/* ---------------- admin: products ---------------- */
function renderAdminProductList() {
  const list = document.getElementById("adminProductList");
  if (!list) return;
  const products = getProducts();
  if (!products.length) {
    list.innerHTML = `<div class="empty-state">لا توجد منتجات بعد. أضيفي أول منتج من الأسفل.</div>`;
    return;
  }
  list.innerHTML = products.map(p => `
    <div class="admin-list-item">
      <img src="${p.image}" alt="${p.name}">
      <div class="grow">
        <b>${p.name}</b>
        <span>${money(p.price)} · ${p.category || "بدون تصنيف"} · المخزون: ${p.stock}</span>
      </div>
      <button class="icon-btn" title="حذف" onclick="deleteProduct('${p.id}')">🗑</button>
    </div>
  `).join("");
}

function deleteProduct(id) {
  if (!confirm("حذف هذا المنتج نهائياً؟")) return;
  saveProducts(getProducts().filter(p => p.id !== id));
  renderAdminProductList();
  renderProductGrid();
  renderCategoryFilter();
  toast("تم حذف المنتج");
}

function handleAdminImage(input, callback) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => callback(ev.target.result);
  reader.readAsDataURL(file);
}

function submitNewProduct(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const imageFile = form.querySelector('[name="image"]').files[0];

  const finish = (imageData) => {
    const products = getProducts();
    products.push({
      id: uid("p"),
      name: data.get("name"),
      desc: data.get("desc"),
      price: Number(data.get("price")) || 0,
      oldPrice: data.get("oldPrice") ? Number(data.get("oldPrice")) : null,
      stock: Number(data.get("stock")) || 0,
      category: data.get("category") || "عام",
      image: imageData || "assets/hero-light.jpg"
    });
    saveProducts(products);
    renderAdminProductList();
    renderProductGrid();
    renderCategoryFilter();
    form.reset();
    toast("تمت إضافة المنتج بنجاح");
  };

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = ev => finish(ev.target.result);
    reader.readAsDataURL(imageFile);
  } else {
    finish(null);
  }
}

/* ---------------- admin: orders ---------------- */
function renderAdminOrders() {
  const list = document.getElementById("adminOrderList");
  if (!list) return;
  const orders = getOrders();
  if (!orders.length) {
    list.innerHTML = `<div class="empty-state">لا توجد طلبات بعد.</div>`;
    return;
  }
  list.innerHTML = orders.map(o => `
    <div class="admin-list-item" style="align-items:flex-start;">
      <div class="grow">
        <b>${o.id} — ${o.name}</b>
        <span>${o.phone} · ${o.city} · ${money(o.total)} · ${o.payMethod === "cod" ? "دفع عند الاستلام" : "تحويل بنكي"}</span>
      </div>
    </div>
  `).join("");
}

/* ---------------- admin: gate ---------------- */
function openAdmin() {
  document.getElementById("adminPanel").classList.add("open");
}
function closeAdmin() {
  document.getElementById("adminPanel").classList.remove("open");
}
function checkAdminPassword(e) {
  e.preventDefault();
  const val = document.getElementById("adminPasswordInput").value;
  if (val === ADMIN_PASSWORD) {
    document.getElementById("adminLock").style.display = "none";
    document.getElementById("adminContent").style.display = "block";
    renderAdminProductList();
    renderAdminOrders();
  } else {
    toast("كلمة المرور غير صحيحة");
  }
}
function switchAdminTab(tab) {
  document.querySelectorAll(".admin-tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".admin-pane").forEach(p => p.classList.toggle("active", p.id === "pane-" + tab));
}

/* ---------------- init per-page ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  refreshCartBadge();
  renderCategoryFilter();
  renderProductGrid();
  renderCartDrawer();
  renderCheckoutSummary();

  document.getElementById("cartToggle")?.addEventListener("click", openCart);
  document.getElementById("cartClose")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("checkoutForm")?.addEventListener("submit", submitOrder);
  document.getElementById("adminLockForm")?.addEventListener("submit", checkAdminPassword);
  document.getElementById("newProductForm")?.addEventListener("submit", submitNewProduct);
  document.getElementById("adminToggleBtn")?.addEventListener("click", openAdmin);
  document.getElementById("adminCloseBtn")?.addEventListener("click", closeAdmin);
});
