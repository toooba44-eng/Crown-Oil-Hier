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
   User-facing strings come from js/i18n.js via crownT() so the
   store switches between Arabic and English live.
   ============================================================ */

"use strict";

const ADMIN_PASSWORD = "crown2026"; // غيّري هذه الكلمة من هنا
const SHIPPING_FLAT = 20;           // ريال — رسوم شحن ثابتة
const FREE_SHIP_OVER = 200;         // شحن مجاني فوق هذا المبلغ
const MAX_IMAGE_EDGE = 800;         // أقصى عرض/ارتفاع لصور المنتجات المخزنة
const ALL_CAT = "__all__";          // language-agnostic "all categories" sentinel

/** Localized text helper with a safe fallback if i18n.js is missing. */
function T(key, vars) {
  return (typeof window.crownT === "function") ? window.crownT(key, vars) : key;
}
function lang() {
  return (typeof window.crownLang === "function") ? window.crownLang() : "ar";
}

function payLabel(method) {
  const key = { cod: "pay.cod", bank: "pay.bank", card: "pay.card" }[method];
  return key ? T(key) : method;
}

const DEFAULT_PRODUCTS = [
  {
    id: "p-001",
    name: "Crown Hair Oil — زيت الشعر الأساسي",
    nameEn: "Crown Hair Oil — Essential Hair Oil",
    desc: "مزيج 100٪ طبيعي من زيت الأرغان والروزماري وزيت الزيتون، لتطويل الشعر وتكثيفه وتغذيته من الجذور حتى الأطراف.",
    descEn: "A 100% natural blend of argan, rosemary and olive oil to lengthen, thicken and nourish hair from root to tip.",
    price: 119,
    oldPrice: 149,
    stock: 24,
    category: "زيوت الشعر",
    categoryEn: "Hair oils",
    image: "assets/product-white.png",
    images: ["assets/product-white.png"],
  },
];

// V2.1.1: the retired default product photo, migrated to the new white shot.
const LEGACY_PRODUCT_IMAGE = "assets/hero-light.jpg";
const DEFAULT_PRODUCT_IMAGE = "assets/product-white.png";
const MAX_PRODUCT_IMAGES = 5;

/** All images for a product (up to MAX_PRODUCT_IMAGES); always ≥ 1. */
function productImages(p) {
  if (p && Array.isArray(p.images) && p.images.length) return p.images.slice(0, MAX_PRODUCT_IMAGES);
  if (p && p.image) return [p.image];
  return [DEFAULT_PRODUCT_IMAGE];
}

/** Localized product name/description; falls back to the canonical value. */
function pName(p) { return lang() === "en" && p && p.nameEn ? p.nameEn : (p ? p.name : ""); }
function pDesc(p) { return lang() === "en" && p && p.descEn ? p.descEn : (p ? (p.desc || "") : ""); }

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
    toast(T("js.quotaFull"));
    return false;
  }
}

function money(n) {
  const v = Number(n);
  const locale = lang() === "en" ? "en-US" : "ar-SA";
  return v.toLocaleString(locale, { minimumFractionDigits: 0 }) + T("cur.suffix");
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(lang() === "en" ? "en-GB" : "ar-SA", {
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
  // Migrate catalogs saved before the product photo swap / bilingual seed.
  let migrated = false;
  products.forEach((p) => {
    if (p.image === LEGACY_PRODUCT_IMAGE) {
      p.image = DEFAULT_PRODUCT_IMAGE;
      migrated = true;
    }
    if (p.id === "p-001" && !p.nameEn) {
      const seed = DEFAULT_PRODUCTS[0];
      p.nameEn = seed.nameEn; p.descEn = seed.descEn; p.categoryEn = seed.categoryEn;
      migrated = true;
    }
    // Backfill the images[] gallery for catalogs saved before multi-image support.
    if (!Array.isArray(p.images) || !p.images.length) {
      p.images = [p.image || DEFAULT_PRODUCT_IMAGE];
      migrated = true;
    }
    if (p.images[0] && p.image !== p.images[0]) {
      p.image = p.images[0];
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
  { id: "r-1", imageLight: "assets/results/result-1-light.jpg", imageDark: "assets/results/result-1-dark.jpg", name: "نورة — الرياض", comment: "لاحظت الفرق على بنتي فعلاً" },
  { id: "r-2", imageLight: "assets/results/result-2-light.jpg", imageDark: "assets/results/result-2-dark.jpg", name: "أحمد — الرياض", comment: "كثافة أوضح خلال 6 أسابيع" },
  { id: "r-3", imageLight: "assets/results/result-3-light.jpg", imageDark: "assets/results/result-3-dark.jpg", name: "منى — جدة", comment: "رجعت فراغات الشعر تنمو من جديد بعد استخدام شهرين" },
  { id: "r-4", imageLight: "assets/results/result-4-light.jpg", imageDark: "assets/results/result-4-dark.jpg", name: "سعيد — المدينة المنورة", comment: "تحسّنت فروة الرأس جداً وبدأ شعري ينمو من جديد" },
  { id: "r-5", imageLight: "assets/results/result-5-light.jpg", imageDark: "assets/results/result-5-dark.jpg", name: "منار — الرياض", comment: "ليست أول تجربة لي مع الزيوت، لكن أقدر أقول إنها أفضل تجربة وفعّالة جداً" },
];
function getUserResults() { return readJSON("crown_results", []); }
function saveUserResults(list) { return writeJSON("crown_results", list); }
function getResults() { return [...DEFAULT_RESULTS, ...getUserResults()]; }

/* Genuine customer reviews. DEFAULT_REVIEWS is committed (public to all);
   user reviews live in localStorage, managed from the admin panel. */
const DEFAULT_REVIEWS = [
  // { id: "rv-1", name: "سارة", rating: 5, comment: "نتيجة رائعة خلال شهر." },
];
function getUserReviews() { return readJSON("crown_reviews", []); }
function saveUserReviews(list) { return writeJSON("crown_reviews", list); }
function getReviews() { return [...DEFAULT_REVIEWS, ...getUserReviews()]; }

function starString(rating) {
  const n = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

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

/* Re-render everything on a language switch (called by js/i18n.js). */
window.__crownRerender = function () {
  renderCategoryFilter();
  refreshAll();
  renderReviews();
  // Refresh admin views if the panel is currently unlocked.
  if (document.getElementById("adminContent") && !document.getElementById("adminContent").hidden) {
    renderAdminProductList();
    renderAdminOrders();
    renderAdminResults();
    renderAdminReviews();
    renderProductImgDraft();
    setProductFormMode();
  }
};

/* ---------------- real results gallery ---------------- */
function resultSlideHTML(r, ariaHidden) {
  const hidden = ariaHidden ? ' aria-hidden="true"' : "";
  const isDark = document.documentElement.dataset.theme === "dark";
  const composite = r.imageLight ? (isDark ? r.imageDark : r.imageLight) : r.image;
  const frame = composite
    ? `<div class="result-frame"><img src="${esc(composite)}" alt="${esc(T("js.resultAlt"))}"></div>`
    : `<div class="result-frame"><div class="result-pair">
         <div class="result-img"><span class="result-tag after">${esc(T("js.after"))}</span><img src="${esc(r.after)}" alt="${esc(T("js.afterAlt"))}"></div>
         <div class="result-img"><span class="result-tag">${esc(T("js.before"))}</span><img src="${esc(r.before)}" alt="${esc(T("js.beforeAlt"))}"></div>
       </div></div>`;
  const name = r.name || r.caption;
  const cap = (r.weeks || name || r.comment) ? `<figcaption class="result-cap">
      ${r.weeks ? `<span class="result-weeks">${esc(T("js.resultWeeks", { n: r.weeks }))}</span>` : ""}
      ${name ? `<span class="result-name">${esc(name)}</span>` : ""}
      ${r.comment ? `<span class="result-comment">”${esc(r.comment)}“</span>` : ""}
    </figcaption>` : "";
  return `<figure class="result-slide"${hidden}>${frame}${cap}</figure>`;
}

function renderReviews() {
  const section = document.getElementById("reviewsSection");
  const grid = document.getElementById("reviewsGrid");
  if (!section || !grid) return;
  const reviews = getReviews();
  if (!reviews.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  grid.innerHTML = reviews.map((rv) => `
    <article class="review-card">
      <div class="review-top">
        <span class="review-avatar">${esc((rv.name || "?").trim().charAt(0))}</span>
        <div class="review-id">
          <b>${esc(rv.name || T("js.customer"))}</b>
          <span class="stars">${starString(rv.rating)}</span>
        </div>
      </div>
      <p class="review-comment">${esc(rv.comment || "")}</p>
    </article>
  `).join("");
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

let activeCategory = ALL_CAT;

function stockLabel(stock) {
  if (stock <= 0) return `<span class="stock-note out">${esc(T("js.stockOut"))}</span>`;
  if (stock <= 5) return `<span class="stock-note low">${esc(T("js.stockLow", { n: stock }))}</span>`;
  return `<span class="stock-note">${esc(T("js.stockIn"))}</span>`;
}

function saleRibbon(p) {
  if (!p.oldPrice || p.oldPrice <= p.price) return "";
  const pct = Math.round((1 - p.price / p.oldPrice) * 100);
  return `<span class="sale-ribbon">${esc(T("js.sale", { pct }))}</span>`;
}

function renderProductGrid(filterCategory) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const products = getProducts();
  const filtered = filterCategory && filterCategory !== ALL_CAT
    ? products.filter((p) => p.category === filterCategory)
    : products;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">${esc(T("js.emptyCategory"))}</div>`;
    return;
  }

  grid.innerHTML = filtered.map((p) => {
    const imgs = productImages(p);
    const strip = imgs.length > 1
      ? `<div class="thumb-strip">${imgs.map((src, i) =>
          `<button type="button" class="thumb-dot${i === 0 ? " active" : ""}" data-img="${esc(src)}" aria-label="${esc(T("js.viewImage", { n: i + 1 }))}"><img src="${esc(src)}" alt=""></button>`
        ).join("")}</div>`
      : "";
    return `
    <div class="product-card">
      <div class="product-thumb">
        ${saleRibbon(p)}
        <img class="pc-main" src="${esc(imgs[0])}" alt="${esc(pName(p))}">
      </div>
      ${strip}
      <div class="product-body">
        <h3>${esc(pName(p))}</h3>
        <p class="desc">${esc(pDesc(p))}</p>
        <div class="product-price-row">
          <div>
            <span class="price">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ""}
          </div>
          ${stockLabel(p.stock)}
        </div>
        <button class="btn btn-primary btn-block btn-sm" data-action="add" data-id="${esc(p.id)}"
          ${p.stock <= 0 ? "disabled" : ""}>${p.stock <= 0 ? esc(T("js.addDisabled")) : esc(T("js.add"))}</button>
      </div>
    </div>
  `;
  }).join("");
}

function renderCategoryFilter() {
  const wrap = document.getElementById("tagFilter");
  if (!wrap) return;
  const products = getProducts();
  const catEn = {};
  products.forEach((p) => { if (p.category) catEn[p.category] = p.categoryEn || p.category; });
  const cats = [ALL_CAT, ...new Set(products.map((p) => p.category).filter(Boolean))];
  const en = lang() === "en";
  wrap.innerHTML = cats.map((c) => {
    const label = c === ALL_CAT ? T("js.all") : (en ? (catEn[c] || c) : c);
    return `<button class="${c === activeCategory ? "active" : ""}" data-cat="${esc(c)}">${esc(label)}</button>`;
  }).join("");
}

/* ---------------- cart actions ---------------- */

function addToCart(productId) {
  const product = getProducts().find((p) => p.id === productId);
  if (!product || product.stock <= 0) return;

  const cart = getCart();
  const existing = cart.find((i) => i.id === productId);
  const currentQty = existing ? existing.qty : 0;
  if (currentQty + 1 > product.stock) {
    toast(T("js.noMore"));
    return;
  }
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, qty: 1 });

  saveCart(cart);
  refreshAll();
  toast(T("js.added"));
  openCart();
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  if (delta > 0) {
    const product = getProducts().find((p) => p.id === productId);
    if (product && item.qty + delta > product.stock) {
      toast(T("js.maxQty"));
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
    itemsEl.innerHTML = `<div class="empty-state">${esc(T("js.cartEmpty"))}</div>`;
  } else {
    itemsEl.innerHTML = lines.map(({ product: p, qty }) => `
      <div class="cart-item">
        <img src="${esc(p.image)}" alt="${esc(pName(p))}">
        <div class="cart-item-info">
          <h4>${esc(pName(p))}</h4>
          <span>${money(p.price)}</span>
          <div class="qty-row">
            <button data-action="dec" data-id="${esc(p.id)}" aria-label="${esc(T("js.dec"))}">−</button>
            <span>${esc(qty)}</span>
            <button data-action="inc" data-id="${esc(p.id)}" aria-label="${esc(T("js.inc"))}">+</button>
          </div>
          <button class="cart-remove" data-action="remove" data-id="${esc(p.id)}">${esc(T("js.remove"))}</button>
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
    el.innerHTML = `<div class="empty-state">${esc(T("js.summaryEmpty"))}</div>`;
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = shippingFor(subtotal);
  el.innerHTML = `
    ${lines.map(({ product: p, qty }) =>
      `<div class="order-line"><span>${esc(pName(p))} × ${esc(qty)}</span><span>${money(p.price * qty)}</span></div>`
    ).join("")}
    <div class="order-line"><span>${esc(T("js.shipping"))}</span><span>${shipping === 0 ? esc(T("js.free")) : money(shipping)}</span></div>
    <div class="order-line total"><span>${esc(T("js.total"))}</span><span>${money(subtotal + shipping)}</span></div>
  `;
}

function submitOrder(e) {
  e.preventDefault();
  const lines = resolvedCart();
  if (!lines.length) {
    toast(T("js.cartEmptyToast"));
    return;
  }
  const data = new FormData(e.target);
  const payMethod = data.get("payMethod");
  if (payMethod === "card") {
    toast(T("js.cardOff"));
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
    list.innerHTML = `<div class="empty-state">${esc(T("js.noProducts"))}</div>`;
    return;
  }
  list.innerHTML = products.map((p) => {
    const n = productImages(p).length;
    return `
    <div class="admin-list-item${editingProductId === p.id ? " editing" : ""}">
      <img src="${esc(p.image)}" alt="${esc(pName(p))}">
      <div class="grow">
        <b>${esc(pName(p))}</b>
        <span>${money(p.price)} · ${esc(T("js.stock"))}: ${esc(p.stock)}${n > 1 ? ` · 📷 ${n}` : ""}</span>
      </div>
      <div class="admin-item-actions">
        <button class="icon-btn" title="${esc(T("admin.edit"))}" aria-label="${esc(T("admin.edit"))}" data-action="edit-product" data-id="${esc(p.id)}">✏️</button>
        <button class="icon-btn" title="${esc(T("js.delete"))}" data-action="delete-product" data-id="${esc(p.id)}">🗑</button>
      </div>
    </div>
  `;
  }).join("");
}

/** Two-step delete: first tap arms the button, second tap confirms. */
function handleDeleteProduct(btn, id) {
  if (btn.dataset.armed !== "1") {
    btn.dataset.armed = "1";
    btn.textContent = T("js.confirm");
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
  toast(T("js.productDeleted"));
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

/* ---- product add/edit form with up to 5 images ---- */
let editingProductId = null;   // null = adding a new product
let productImgDraft = [];      // gallery being edited (image sources / data URLs)
let busyImg = false;

/** Render the draft image thumbnails + the "add" slot into #productImgList. */
function renderProductImgDraft() {
  const wrap = document.getElementById("productImgList");
  if (!wrap) return;
  const thumbs = productImgDraft.map((src, i) => `
    <div class="img-thumb">
      <img src="${esc(src)}" alt="">
      ${i === 0 ? `<span class="img-main-badge">★</span>` : ""}
      <button type="button" class="img-remove" aria-label="${esc(T("admin.removeImage"))}" data-action="remove-img" data-i="${i}">×</button>
    </div>
  `).join("");
  const addSlot = productImgDraft.length < MAX_PRODUCT_IMAGES
    ? `<label class="img-add${busyImg ? " busy" : ""}">
         <input type="file" accept="image/*" multiple hidden id="productImgInput" ${busyImg ? "disabled" : ""}>
         <span>${busyImg ? "…" : "＋"}</span>
       </label>`
    : "";
  wrap.innerHTML = thumbs + addSlot;
  const count = document.getElementById("productImgCount");
  if (count) count.textContent = T("admin.imgCount", { n: productImgDraft.length });
}

async function addDraftImages(files) {
  const list = [...files];
  if (!list.length) return;
  const room = MAX_PRODUCT_IMAGES - productImgDraft.length;
  if (room <= 0) { toast(T("js.maxImages")); return; }
  busyImg = true;
  renderProductImgDraft();
  try {
    for (const f of list.slice(0, room)) {
      try { productImgDraft.push(await compressImage(f)); }
      catch { toast(T("js.imgReadErr")); }
    }
    if (list.length > room) toast(T("js.maxImages"));
  } finally {
    busyImg = false;
    renderProductImgDraft();
  }
}

function setProductFormMode() {
  const title = document.getElementById("productFormTitle");
  const submit = document.getElementById("productSubmitBtn");
  const cancel = document.getElementById("productCancelBtn");
  const editing = !!editingProductId;
  if (title) { title.setAttribute("data-i18n", editing ? "admin.editProduct" : "admin.addProduct"); title.textContent = T(editing ? "admin.editProduct" : "admin.addProduct"); }
  if (submit) { submit.setAttribute("data-i18n", editing ? "admin.saveChanges" : "admin.saveProduct"); submit.textContent = T(editing ? "admin.saveChanges" : "admin.saveProduct"); }
  if (cancel) cancel.hidden = !editing;
}

function fillProductForm(p) {
  const form = document.getElementById("newProductForm");
  if (!form) return;
  form.querySelector('[name="name"]').value = p ? (p.name || "") : "";
  form.querySelector('[name="desc"]').value = p ? (p.desc || "") : "";
  form.querySelector('[name="price"]').value = p ? (p.price ?? "") : "";
  form.querySelector('[name="oldPrice"]').value = p && p.oldPrice ? p.oldPrice : "";
  form.querySelector('[name="stock"]').value = p ? (p.stock ?? "") : "";
  form.querySelector('[name="category"]').value = p ? (p.category || "") : "";
}

function startEditProduct(id) {
  const p = getProducts().find((x) => x.id === id);
  if (!p) return;
  editingProductId = id;
  productImgDraft = productImages(p).slice();
  fillProductForm(p);
  renderProductImgDraft();
  setProductFormMode();
  renderAdminProductList();
  document.getElementById("productFormTitle")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetProductForm() {
  editingProductId = null;
  productImgDraft = [];
  const form = document.getElementById("newProductForm");
  if (form) form.reset();
  fillProductForm(null);
  renderProductImgDraft();
  setProductFormMode();
  renderAdminProductList();
}

function submitProductForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const images = productImgDraft.length ? productImgDraft.slice() : [DEFAULT_PRODUCT_IMAGE];
  const fields = {
    name: data.get("name"),
    desc: data.get("desc"),
    price: Number(data.get("price")) || 0,
    oldPrice: data.get("oldPrice") ? Number(data.get("oldPrice")) : null,
    stock: Number(data.get("stock")) || 0,
    category: data.get("category") || "عام",
    images,
    image: images[0],
  };

  const products = getProducts();
  if (editingProductId) {
    const next = products.map((p) => (p.id === editingProductId ? { ...p, ...fields } : p));
    if (!saveProducts(next)) return; // quota hit — keep form intact
    toast(T("js.productUpdated"));
  } else {
    products.push({ id: uid("p"), ...fields });
    if (!saveProducts(products)) return;
    toast(T("js.productAdded"));
  }

  resetProductForm();
  renderCategoryFilter();
  refreshAll();
}

/* ---------------- admin: orders ---------------- */

function renderAdminOrders() {
  const list = document.getElementById("adminOrderList");
  if (!list) return;
  const orders = getOrders();
  if (!orders.length) {
    list.innerHTML = `<div class="empty-state">${esc(T("js.noOrders"))}</div>`;
    return;
  }
  list.innerHTML = orders.map((o) => `
    <div class="admin-list-item" style="align-items:flex-start;">
      <div class="grow">
        <b>${esc(o.id)} — ${esc(o.name)} <span class="order-status">${esc(o.status && o.status !== "جديد" ? o.status : T("js.orderNew"))}</span></b>
        <span>${esc(o.phone)} · ${esc(o.city)} · ${money(o.total)} · ${esc(payLabel(o.payMethod))}</span>
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
    list.innerHTML = `<div class="empty-state">${esc(T("js.noResults"))}</div>`;
    return;
  }
  list.innerHTML = results.map((r) => `
    <div class="admin-list-item">
      <img src="${esc(r.before)}" alt="${esc(T("js.before"))}">
      <img src="${esc(r.after)}" alt="${esc(T("js.after"))}">
      <div class="grow">
        <b>${esc(r.name || r.caption || T("js.result"))}</b>
        <span>${r.weeks ? esc(T("js.afterWeeksShort", { n: r.weeks })) : "—"}</span>
      </div>
      <button class="icon-btn" title="${esc(T("js.delete"))}" data-action="delete-result" data-id="${esc(r.id)}">🗑</button>
    </div>
  `).join("");
}

function handleDeleteResult(btn, id) {
  if (btn.dataset.armed !== "1") {
    btn.dataset.armed = "1";
    btn.textContent = T("js.confirm");
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
  toast(T("js.resultDeleted"));
}

async function submitNewResult(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const beforeFile = form.querySelector('[name="before"]').files[0];
  const afterFile = form.querySelector('[name="after"]').files[0];
  if (!beforeFile || !afterFile) {
    toast(T("js.needBothImages"));
    return;
  }
  let before, after;
  try {
    [before, after] = await Promise.all([compressImage(beforeFile), compressImage(afterFile)]);
  } catch {
    toast(T("js.imgsReadErr"));
    return;
  }
  const list = getUserResults();
  list.push({
    id: uid("r"),
    before,
    after,
    name: data.get("name") || "",
    comment: data.get("comment") || "",
    weeks: Number(data.get("weeks")) || 0,
  });
  if (!saveUserResults(list)) return; // quota hit
  renderAdminResults();
  renderResults();
  form.reset();
  toast(T("js.resultAdded"));
}

/* ---------------- admin: reviews ---------------- */

function renderAdminReviews() {
  const list = document.getElementById("adminReviewList");
  if (!list) return;
  const reviews = getUserReviews();
  if (!reviews.length) {
    list.innerHTML = `<div class="empty-state">${esc(T("js.noReviews"))}</div>`;
    return;
  }
  list.innerHTML = reviews.map((rv) => `
    <div class="admin-list-item">
      <div class="grow">
        <b>${esc(rv.name || T("js.customer"))} · <span class="stars">${starString(rv.rating)}</span></b>
        <span>${esc(rv.comment || "")}</span>
      </div>
      <button class="icon-btn" title="${esc(T("js.delete"))}" data-action="delete-review" data-id="${esc(rv.id)}">🗑</button>
    </div>
  `).join("");
}

function handleDeleteReview(btn, id) {
  if (btn.dataset.armed !== "1") {
    btn.dataset.armed = "1";
    btn.textContent = T("js.confirm");
    btn.classList.add("danger");
    setTimeout(() => {
      btn.dataset.armed = "0";
      btn.textContent = "🗑";
      btn.classList.remove("danger");
    }, 2600);
    return;
  }
  saveUserReviews(getUserReviews().filter((r) => r.id !== id));
  renderAdminReviews();
  renderReviews();
  toast(T("js.reviewDeleted"));
}

function submitNewReview(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const comment = (data.get("comment") || "").trim();
  if (!comment) {
    toast(T("js.reviewNeed"));
    return;
  }
  const list = getUserReviews();
  list.push({
    id: uid("rv"),
    name: (data.get("name") || "").trim() || T("js.customer"),
    rating: Number(data.get("rating")) || 5,
    comment,
  });
  if (!saveUserReviews(list)) return;
  renderAdminReviews();
  renderReviews();
  form.reset();
  toast(T("js.reviewAdded"));
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
    renderAdminReviews();
  } else {
    toast(T("js.badPassword"));
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
  renderReviews();

  // category filter (delegated)
  document.getElementById("tagFilter")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cat]");
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    renderCategoryFilter();
    renderProductGrid(activeCategory);
  });

  // product image manager (add/edit form)
  renderProductImgDraft();
  setProductFormMode();

  // product grid: add to cart + switch main image via thumbnails (delegated)
  document.getElementById("productGrid")?.addEventListener("click", (e) => {
    const addBtn = e.target.closest("button[data-action='add']");
    if (addBtn) { addToCart(addBtn.dataset.id); return; }
    const dot = e.target.closest(".thumb-dot");
    if (dot) {
      const card = dot.closest(".product-card");
      const main = card?.querySelector(".pc-main");
      if (main) main.src = dot.dataset.img;
      card?.querySelectorAll(".thumb-dot").forEach((d) => d.classList.toggle("active", d === dot));
    }
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
    const del = e.target.closest("button[data-action='delete-product']");
    if (del) { handleDeleteProduct(del, del.dataset.id); return; }
    const edit = e.target.closest("button[data-action='edit-product']");
    if (edit) startEditProduct(edit.dataset.id);
  });
  document.getElementById("adminResultList")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='delete-result']");
    if (btn) handleDeleteResult(btn, btn.dataset.id);
  });
  document.getElementById("adminReviewList")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='delete-review']");
    if (btn) handleDeleteReview(btn, btn.dataset.id);
  });
  document.getElementById("adminTabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tab]");
    if (btn) switchAdminTab(btn.dataset.tab);
  });

  // product image manager: pick files + remove (delegated)
  const imgList = document.getElementById("productImgList");
  imgList?.addEventListener("change", (e) => {
    const input = e.target.closest('input[type="file"]');
    if (input && input.files.length) addDraftImages(input.files);
  });
  imgList?.addEventListener("click", (e) => {
    const btn = e.target.closest('button[data-action="remove-img"]');
    if (btn) { productImgDraft.splice(Number(btn.dataset.i), 1); renderProductImgDraft(); }
  });
  document.getElementById("productCancelBtn")?.addEventListener("click", resetProductForm);

  document.getElementById("cartToggle")?.addEventListener("click", openCart);
  document.getElementById("cartClose")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("goCheckout")?.addEventListener("click", closeCart);
  document.getElementById("checkoutForm")?.addEventListener("submit", submitOrder);
  document.getElementById("adminLockForm")?.addEventListener("submit", checkAdminPassword);
  document.getElementById("newProductForm")?.addEventListener("submit", submitProductForm);
  document.getElementById("newResultForm")?.addEventListener("submit", submitNewResult);
  document.getElementById("newReviewForm")?.addEventListener("submit", submitNewReview);
  document.getElementById("adminToggleBtn")?.addEventListener("click", () => document.getElementById("adminPanel").classList.add("open"));
  document.getElementById("adminCloseBtn")?.addEventListener("click", () => document.getElementById("adminPanel").classList.remove("open"));
});
