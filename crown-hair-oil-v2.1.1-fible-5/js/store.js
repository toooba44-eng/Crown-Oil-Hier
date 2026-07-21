/* ============================================================
   CROWN HAIR OIL — Store logic (V2.1.1)

   Data persists in the browser via localStorage:
     crown_products  -> product catalog
     crown_cart      -> current cart  [{ id, qty }]
     crown_orders    -> submitted orders (visible in admin)

   The cart intentionally stores only { id, qty }: product name,
   price and image are always re-resolved from the catalog at
   render time, so admin edits/deletions can never leave stale
   or orphaned data in the cart.

   All dynamic text is escaped before being placed into HTML,
   and all UI events are bound via delegation (no inline onclick).
   ============================================================ */

"use strict";

const ADMIN_PASSWORD = "crown2026"; // غيّري هذه الكلمة من هنا
const SHIPPING_FLAT = 20;           // ريال — رسوم شحن ثابتة
const FREE_SHIP_OVER = 200;         // شحن مجاني فوق هذا المبلغ
const MAX_IMAGE_EDGE = 800;         // أقصى عرض/ارتفاع لصور المنتجات المخزنة

const PAY_METHOD_LABELS = {
  cod: "دفع عند الاستلام",
  bank: "تحويل بنكي",
  card: "بطاقة مدى / فيزا",
};

const DEFAULT_PRODUCTS = [
  {
    id: "p-001",
    name: "Crown Hair Oil — زيت الشعر الأساسي",
    desc: "مزيج 100٪ طبيعي من زيت الأرغان والروزماري وزيت الزيتون، لتطويل الشعر وتكثيفه وتغذيته من الجذور حتى الأطراف.",
    price: 119,
    oldPrice: 149,
    stock: 24,
    category: "زيوت الشعر",
    image: "assets/product-white.png",
  },
];

// V2.1.1: the retired default product photo, migrated to the new white shot.
const LEGACY_PRODUCT_IMAGE = "assets/hero-light.jpg";
const DEFAULT_PRODUCT_IMAGE = "assets/product-white.png";

/* ---------------- generic helpers ---------------- */

/** Escape a value for safe interpolation into innerHTML. */
function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Write to localStorage; returns false (with a toast) if the quota is hit. */
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    toast("مساحة التخزين ممتلئة — احذفي بعض المنتجات أو الصور الكبيرة");
    return false;
  }
}

function money(n) {
  return Number(n).toLocaleString("ar-SA", { minimumFractionDigits: 0 }) + " ر.س";
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("ar-SA", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function uid(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2400);
}

/* ---------------- data access ---------------- */

function getProducts() {
  let products = readJSON("crown_products", null);
  if (!products) {
    products = DEFAULT_PRODUCTS;
    writeJSON("crown_products", products);
  }
  // Migrate catalogs saved before the product photo swap.
  let migrated = false;
  products.forEach((p) => {
    if (p.image === LEGACY_PRODUCT_IMAGE) {
      p.image = DEFAULT_PRODUCT_IMAGE;
      migrated = true;
    }
  });
  if (migrated) writeJSON("crown_products", products);
  return products;
}
function saveProducts(products) { return writeJSON("crown_products", products); }

function getCart() { return readJSON("crown_cart", []); }
function saveCart(cart) { return writeJSON("crown_cart", cart); }

function getOrders() { return readJSON("crown_orders", []); }
function saveOrders(orders) { return writeJSON("crown_orders", orders); }

/* Real customer before/after results. DEFAULT_RESULTS holds photos
   committed to assets/results/ (public to every visitor); user results
   in localStorage are managed from the admin panel (per-device). */
const DEFAULT_RESULTS = [
  { id: "r-1", imageLight: "assets/results/result-1-light.jpg", imageDark: "assets/results/result-1-dark.jpg" },
  { id: "r-2", imageLight: "assets/results/result-2-light.jpg", imageDark: "assets/results/result-2-dark.jpg" },
  { id: "r-3", imageLight: "assets/results/result-3-light.jpg", imageDark: "assets/results/result-3-dark.jpg" },
  { id: "r-4", imageLight: "assets/results/result-4-light.jpg", imageDark: "assets/results/result-4-dark.jpg" },
  { id: "r-5", imageLight: "assets/results/result-5-light.jpg", imageDark: "assets/results/result-5-dark.jpg" },
];
function getUserResults() { return readJSON("crown_results", []); }
function saveUserResults(list) { return writeJSON("crown_results", list); }
function getResults() { return [...DEFAULT_RESULTS, ...getUserResults()]; }

/**
 * Resolve cart lines against the current catalog.
 * Deleted products are dropped; quantities are clamped to stock.
 */
function resolvedCart() {
  const products = getProducts();
  return getCart()
    .map((line) => {
      const product = products.find((p) => p.id === line.id);
      if (!product) return null;
      return { product, qty: Math.min(line.qty, Math.max(product.stock, 0)) };
    })
    .filter((line) => line && line.qty > 0);
}

function cartCount() {
  return resolvedCart().reduce((sum, l) => sum + l.qty, 0);
}
function cartSubtotal() {
  return resolvedCart().reduce((sum, l) => sum + l.product.price * l.qty, 0);
}
function shippingFor(subtotal) {
  return subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FLAT;
}

/* ---------------- rendering: shared ---------------- */

/** Re-render every piece of UI that depends on products/cart state. */
function refreshAll() {
  refreshCartBadge();
  renderProductGrid(activeCategory);
  renderCartDrawer();
  renderCheckoutSummary();
  renderResults();
}

/* ---------------- real results gallery ---------------- */
function resultSlideHTML(r, ariaHidden) {
  const hidden = ariaHidden ? ' aria-hidden="true"' : "";
  const isDark = document.documentElement.dataset.theme === "dark";
  const composite = r.imageLight ? (isDark ? r.imageDark : r.imageLight) : r.image;
  const frame = composite
    ? `<div class="result-frame"><img src="${esc(composite)}" alt="نتيجة قبل وبعد استخدام الزيت"></div>`
    : `<div class="result-frame"><div class="result-pair">
         <div class="result-img"><span class="result-tag after">بعد</span><img src="${esc(r.after)}" alt="بعد الاستخدام"></div>
         <div class="result-img"><span class="result-tag">قبل</span><img src="${esc(r.before)}" alt="قبل الاستخدام"></div>
       </div></div>`;
  const cap = (r.weeks || r.caption) ? `<figcaption class="result-cap">
      ${r.weeks ? `<span class="result-weeks">النتيجة بعد ${esc(r.weeks)} أسابيع</span>` : ""}
      ${r.caption ? `<span class="result-name">${esc(r.caption)}</span>` : ""}
    </figcaption>` : "";
  return `<figure class="result-slide"${hidden}>${frame}${cap}</figure>`;
}

function renderResults() {
  const section = document.getElementById("resultsSection");
  const track = document.getElementById("resultsTrack");
  if (!section || !track) return;
  const results = getResults();
  if (!results.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  track.innerHTML = results.map((r) => resultSlideHTML(r, false)).join("")
    + results.map((r) => resultSlideHTML(r, true)).join("");
}

function refreshCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  const n = cartCount();
  if (badge.textContent !== String(n)) {
    badge.textContent = n;
    badge.classList.remove("pop");
    void badge.offsetWidth; // restart the pop animation
    badge.classList.add("pop");
  }
}

/* ---------------- product grid ---------------- */

let activeCategory = "الكل";

function stockLabel(stock) {
  if (stock <= 0) return `<span class="stock-note out">غير متوفر حالياً</span>`;
  if (stock <= 5) return `<span class="stock-note low">باقي ${esc(stock)} قطع فقط</span>`;
  return `<span class="stock-note">متوفر</span>`;
}

function saleRibbon(p) {
  if (!p.oldPrice || p.oldPrice <= p.price) return "";
  const pct = Math.round((1 - p.price / p.oldPrice) * 100);
  return `<span class="sale-ribbon">خصم ${esc(pct)}٪</span>`;
}

function renderProductGrid(filterCategory) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const products = getProducts();
  const filtered = filterCategory && filterCategory !== "الكل"
    ? products.filter((p) => p.category === filterCategory)
    : products;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">لا توجد منتجات في هذا التصنيف حالياً.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((p) => `
    <div class="product-card">
      <div class="product-thumb">
        ${saleRibbon(p)}
        <img src="${esc(p.image)}" alt="${esc(p.name)}">
      </div>
      <div class="product-body">
        <h3>${esc(p.name)}</h3>
        <p class="desc">${esc(p.desc || "")}</p>
        <div class="product-price-row">
          <div>
            <span class="price">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ""}
          </div>
          ${stockLabel(p.stock)}
        </div>
        <button class="btn btn-primary btn-block btn-sm" data-action="add" data-id="${esc(p.id)}"
          ${p.stock <= 0 ? "disabled" : ""}>${p.stock <= 0 ? "غير متوفر" : "أضف للسلة"}</button>
      </div>
    </div>
  `).join("");
}

function renderCategoryFilter() {
  const wrap = document.getElementById("tagFilter");
  if (!wrap) return;
  const cats = ["الكل", ...new Set(getProducts().map((p) => p.category).filter(Boolean))];
  wrap.innerHTML = cats.map((c) =>
    `<button class="${c === activeCategory ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`
  ).join("");
}

/* ---------------- cart actions ---------------- */

function addToCart(productId) {
  const product = getProducts().find((p) => p.id === productId);
  if (!product || product.stock <= 0) return;

  const cart = getCart();
  const existing = cart.find((i) => i.id === productId);
  const currentQty = existing ? existing.qty : 0;
  if (currentQty + 1 > product.stock) {
    toast("لا تتوفر كمية أكبر من هذا المنتج");
    return;
  }
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, qty: 1 });

  saveCart(cart);
  refreshAll();
  toast("تمت إضافة المنتج إلى السلة");
  openCart();
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  if (delta > 0) {
    const product = getProducts().find((p) => p.id === productId);
    if (product && item.qty + delta > product.stock) {
      toast("وصلتِ للكمية المتوفرة كاملة");
      return;
    }
  }
  item.qty += delta;
  saveCart(item.qty <= 0 ? cart.filter((i) => i.id !== productId) : cart);
  refreshAll();
}

function removeFromCart(productId) {
  saveCart(getCart().filter((i) => i.id !== productId));
  refreshAll();
}

/* ---------------- cart drawer ---------------- */

function renderCartDrawer() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!itemsEl) return;
  const lines = resolvedCart();

  if (!lines.length) {
    itemsEl.innerHTML = `<div class="empty-state">سلتك فارغة، تصفحي المنتجات وأضيفي ما يناسبك.</div>`;
  } else {
    itemsEl.innerHTML = lines.map(({ product: p, qty }) => `
      <div class="cart-item">
        <img src="${esc(p.image)}" alt="${esc(p.name)}">
        <div class="cart-item-info">
          <h4>${esc(p.name)}</h4>
          <span>${money(p.price)}</span>
          <div class="qty-row">
            <button data-action="dec" data-id="${esc(p.id)}" aria-label="إنقاص الكمية">−</button>
            <span>${esc(qty)}</span>
            <button data-action="inc" data-id="${esc(p.id)}" aria-label="زيادة الكمية">+</button>
          </div>
          <button class="cart-remove" data-action="remove" data-id="${esc(p.id)}">إزالة</button>
        </div>
      </div>
    `).join("");
  }
  if (totalEl) totalEl.textContent = money(cartSubtotal());
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
}

/* ---------------- checkout ---------------- */

function renderCheckoutSummary() {
  const el = document.getElementById("checkoutSummary");
  if (!el) return;
  const lines = resolvedCart();

  if (!lines.length) {
    el.innerHTML = `<div class="empty-state">السلة فارغة. أضيفي منتجات قبل إتمام الطلب.</div>`;
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = shippingFor(subtotal);
  el.innerHTML = `
    ${lines.map(({ product: p, qty }) =>
      `<div class="order-line"><span>${esc(p.name)} × ${esc(qty)}</span><span>${money(p.price * qty)}</span></div>`
    ).join("")}
    <div class="order-line"><span>الشحن</span><span>${shipping === 0 ? "مجاني" : money(shipping)}</span></div>
    <div class="order-line total"><span>الإجمالي</span><span>${money(subtotal + shipping)}</span></div>
  `;
}

function submitOrder(e) {
  e.preventDefault();
  const lines = resolvedCart();
  if (!lines.length) {
    toast("السلة فارغة");
    return;
  }
  const data = new FormData(e.target);
  const payMethod = data.get("payMethod");
  if (payMethod === "card") {
    toast("الدفع بالبطاقة غير مفعّل بعد");
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = shippingFor(subtotal);
  const order = {
    id: uid("ORD"),
    date: new Date().toISOString(),
    name: data.get("name"),
    phone: data.get("phone"),
    city: data.get("city"),
    address: data.get("address"),
    notes: data.get("notes") || "",
    payMethod,
    items: lines.map(({ product: p, qty }) => ({ id: p.id, name: p.name, price: p.price, qty })),
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: "جديد",
  };

  // reduce stock
  const products = getProducts();
  lines.forEach(({ product, qty }) => {
    const p = products.find((x) => x.id === product.id);
    if (p) p.stock = Math.max(0, p.stock - qty);
  });
  saveProducts(products);

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  saveCart([]);
  refreshAll();
  renderCategoryFilter();

  document.getElementById("checkoutForm").hidden = true;
  document.getElementById("orderConfirm").hidden = false;
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
  list.innerHTML = products.map((p) => `
    <div class="admin-list-item">
      <img src="${esc(p.image)}" alt="${esc(p.name)}">
      <div class="grow">
        <b>${esc(p.name)}</b>
        <span>${money(p.price)} · ${esc(p.category || "بدون تصنيف")} · المخزون: ${esc(p.stock)}</span>
      </div>
      <button class="icon-btn" title="حذف" data-action="delete-product" data-id="${esc(p.id)}">🗑</button>
    </div>
  `).join("");
}

/** Two-step delete: first tap arms the button, second tap confirms. */
function handleDeleteProduct(btn, id) {
  if (btn.dataset.armed !== "1") {
    btn.dataset.armed = "1";
    btn.textContent = "تأكيد؟";
    btn.classList.add("danger");
    setTimeout(() => {
      btn.dataset.armed = "0";
      btn.textContent = "🗑";
      btn.classList.remove("danger");
    }, 2600);
    return;
  }
  saveProducts(getProducts().filter((p) => p.id !== id));
  saveCart(getCart().filter((i) => i.id !== id));
  renderAdminProductList();
  renderCategoryFilter();
  refreshAll();
  toast("تم حذف المنتج");
}

/**
 * Downscale an image file to fit MAX_IMAGE_EDGE and return a JPEG
 * data URL, keeping localStorage usage well under the quota.
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}

async function submitNewProduct(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const imageFile = form.querySelector('[name="image"]').files[0];

  let imageData = null;
  if (imageFile) {
    try {
      imageData = await compressImage(imageFile);
    } catch {
      toast("تعذّر قراءة الصورة — سيُستخدم شكل افتراضي");
    }
  }

  const products = getProducts();
  products.push({
    id: uid("p"),
    name: data.get("name"),
    desc: data.get("desc"),
    price: Number(data.get("price")) || 0,
    oldPrice: data.get("oldPrice") ? Number(data.get("oldPrice")) : null,
    stock: Number(data.get("stock")) || 0,
    category: data.get("category") || "عام",
    image: imageData || DEFAULT_PRODUCT_IMAGE,
  });
  if (!saveProducts(products)) return; // quota hit — keep form intact

  renderAdminProductList();
  renderCategoryFilter();
  refreshAll();
  form.reset();
  toast("تمت إضافة المنتج بنجاح");
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
  list.innerHTML = orders.map((o) => `
    <div class="admin-list-item" style="align-items:flex-start;">
      <div class="grow">
        <b>${esc(o.id)} — ${esc(o.name)} <span class="order-status">${esc(o.status || "جديد")}</span></b>
        <span>${esc(o.phone)} · ${esc(o.city)} · ${money(o.total)} · ${esc(PAY_METHOD_LABELS[o.payMethod] || o.payMethod)}</span>
        <span class="order-date">${esc(formatDate(o.date))}</span>
      </div>
    </div>
  `).join("");
}

/* ---------------- admin: results ---------------- */

function renderAdminResults() {
  const list = document.getElementById("adminResultList");
  if (!list) return;
  const results = getUserResults();
  if (!results.length) {
    list.innerHTML = `<div class="empty-state">لا توجد نتائج بعد. أضيفي أول نتيجة من الأسفل.</div>`;
    return;
  }
  list.innerHTML = results.map((r) => `
    <div class="admin-list-item">
      <img src="${esc(r.before)}" alt="قبل">
      <img src="${esc(r.after)}" alt="بعد">
      <div class="grow">
        <b>${esc(r.caption || "نتيجة")}</b>
        <span>${r.weeks ? `بعد ${esc(r.weeks)} أسابيع` : "—"}</span>
      </div>
      <button class="icon-btn" title="حذف" data-action="delete-result" data-id="${esc(r.id)}">🗑</button>
    </div>
  `).join("");
}

function handleDeleteResult(btn, id) {
  if (btn.dataset.armed !== "1") {
    btn.dataset.armed = "1";
    btn.textContent = "تأكيد؟";
    btn.classList.add("danger");
    setTimeout(() => {
      btn.dataset.armed = "0";
      btn.textContent = "🗑";
      btn.classList.remove("danger");
    }, 2600);
    return;
  }
  saveUserResults(getUserResults().filter((r) => r.id !== id));
  renderAdminResults();
  renderResults();
  toast("تم حذف النتيجة");
}

async function submitNewResult(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const beforeFile = form.querySelector('[name="before"]').files[0];
  const afterFile = form.querySelector('[name="after"]').files[0];
  if (!beforeFile || !afterFile) {
    toast('أضيفي صورتي "قبل" و"بعد"');
    return;
  }
  let before, after;
  try {
    [before, after] = await Promise.all([compressImage(beforeFile), compressImage(afterFile)]);
  } catch {
    toast("تعذّر قراءة الصور");
    return;
  }
  const list = getUserResults();
  list.push({
    id: uid("r"),
    before,
    after,
    caption: data.get("caption") || "",
    weeks: Number(data.get("weeks")) || 0,
  });
  if (!saveUserResults(list)) return; // quota hit
  renderAdminResults();
  renderResults();
  form.reset();
  toast("تمت إضافة النتيجة");
}

/* ---------------- admin: gate & tabs ---------------- */

function checkAdminPassword(e) {
  e.preventDefault();
  const val = document.getElementById("adminPasswordInput").value;
  if (val === ADMIN_PASSWORD) {
    document.getElementById("adminLock").style.display = "none";
    document.getElementById("adminContent").hidden = false;
    renderAdminProductList();
    renderAdminOrders();
    renderAdminResults();
  } else {
    toast("كلمة المرور غير صحيحة");
  }
}

function switchAdminTab(tab) {
  document.querySelectorAll("#adminTabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".admin-pane").forEach((p) => p.classList.toggle("active", p.id === "pane-" + tab));
}

/* ---------------- theme (dark mode) ---------------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", theme === "dark" ? "التبديل إلى الوضع العادي" : "التبديل إلى الوضع الداكن");
  }
  try { localStorage.setItem("crown_theme", theme); } catch { /* private mode */ }
  renderResults(); // re-pick the theme-matched result images
}

function initThemeToggle() {
  const current = document.documentElement.dataset.theme || "light";
  applyTheme(current);
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}

/* ---------------- nav + scroll reveal (both pages) ---------------- */

function initNavToggle() {
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
}

/* ---------------- init ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initNavToggle();
  initScrollReveal();

  refreshCartBadge();
  renderCategoryFilter();
  renderProductGrid();
  renderCartDrawer();
  renderCheckoutSummary();
  renderResults();

  // category filter (delegated)
  document.getElementById("tagFilter")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cat]");
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    renderCategoryFilter();
    renderProductGrid(activeCategory);
  });

  // product grid + cart drawer + admin list (delegated actions)
  document.getElementById("productGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='add']");
    if (btn) addToCart(btn.dataset.id);
  });
  document.getElementById("cartItems")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === "inc") changeQty(id, 1);
    else if (action === "dec") changeQty(id, -1);
    else if (action === "remove") removeFromCart(id);
  });
  document.getElementById("adminProductList")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='delete-product']");
    if (btn) handleDeleteProduct(btn, btn.dataset.id);
  });
  document.getElementById("adminResultList")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='delete-result']");
    if (btn) handleDeleteResult(btn, btn.dataset.id);
  });
  document.getElementById("adminTabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tab]");
    if (btn) switchAdminTab(btn.dataset.tab);
  });

  document.getElementById("cartToggle")?.addEventListener("click", openCart);
  document.getElementById("cartClose")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("goCheckout")?.addEventListener("click", closeCart);
  document.getElementById("checkoutForm")?.addEventListener("submit", submitOrder);
  document.getElementById("adminLockForm")?.addEventListener("submit", checkAdminPassword);
  document.getElementById("newProductForm")?.addEventListener("submit", submitNewProduct);
  document.getElementById("newResultForm")?.addEventListener("submit", submitNewResult);
  document.getElementById("adminToggleBtn")?.addEventListener("click", () => document.getElementById("adminPanel").classList.add("open"));
  document.getElementById("adminCloseBtn")?.addEventListener("click", () => document.getElementById("adminPanel").classList.remove("open"));
});
