/* ============================================================
   CROWN HAIR OIL — Mobile app domain logic (V2.1.1)
   Same storage model as the web store:
     crown_products / crown_cart / crown_orders in localStorage.
   The cart stores only { id, qty }; product data is always
   re-resolved from the catalog so it can never go stale.
   ============================================================ */

export const SHIPPING_FLAT = 20;
export const FREE_SHIP_OVER = 200;
const MAX_IMAGE_EDGE = 800;

export const PAY_METHOD_LABELS = {
  cod: "دفع عند الاستلام",
  bank: "تحويل بنكي",
  card: "بطاقة مدى / فيزا",
};

/* ---------------- locale (AR / EN) ----------------
   The i18n provider mirrors the active language here so that
   money()/formatDate() and the pure cart helpers format and speak
   in the right language without threading `lang` through every call. */
let LOCALE = (() => {
  try { return localStorage.getItem("crown_lang") === "en" ? "en" : "ar"; }
  catch { return "ar"; }
})();
export function setLocale(lang) { LOCALE = lang === "en" ? "en" : "ar"; }
export function getLocale() { return LOCALE; }

const MSG = {
  ar: {
    outOfStock: "المنتج غير متوفر",
    noMore: "لا تتوفر كمية أكبر من هذا المنتج",
    maxQty: "وصلتِ للكمية المتوفرة كاملة",
  },
  en: {
    outOfStock: "This product is unavailable",
    noMore: "No more of this product is available",
    maxQty: "You've reached the available quantity",
  },
};
function msg(k) { return (MSG[LOCALE] || MSG.ar)[k]; }

/** Localized product name/description; falls back to the canonical value. */
export function pName(p, lang) { return lang === "en" && p && p.nameEn ? p.nameEn : (p ? p.name : ""); }
export function pDesc(p, lang) { return lang === "en" && p && p.descEn ? p.descEn : (p ? p.desc : ""); }

/* ---------------- site settings (admin dashboard) ----------------
   Persisted in localStorage under crown_settings; loadSettings merges
   the saved values over the defaults so new keys always exist.
   NOTE: this is a static site, so admin auth is a client-side gate —
   see the security note in the admin login. adminPassHash is the
   SHA-256 of the password. */
const DEFAULT_SETTINGS = {
  storeName: "Crown Hair Oil",
  tagline: "مزيج زيوت طبيعية 100٪",
  shippingFlat: SHIPPING_FLAT,
  freeShipOver: FREE_SHIP_OVER,
  freeShipEnabled: true,
  payCod: true,
  payBank: true,
  payCard: false,
  instagram: "@CrownHairOil_KSA",
  website: "",
  adminEmail: "toooba44@gmail.com",
  adminPassHash: "ea92397a70d82dc8600e989548443d31bc01b878e33e617da8ea7e46c871e194",
};
export function loadSettings() { return { ...DEFAULT_SETTINGS, ...readJSON("crown_settings", {}) }; }
export function persistSettings(next) { return writeJSON("crown_settings", { ...loadSettings(), ...next }); }

/** SHA-256 hex of a string (used to verify the admin password client-side). */
export async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// V2.1.1: the retired default product photo, migrated to the new white shot.
const LEGACY_PRODUCT_IMAGE = "assets/hero-light.jpg";
export const DEFAULT_PRODUCT_IMAGE = "assets/product-white.png";

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
  },
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns false when the localStorage quota is exceeded. */
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function money(n) {
  const v = Number(n);
  return LOCALE === "en"
    ? v.toLocaleString("en-US", { minimumFractionDigits: 0 }) + " SAR"
    : v.toLocaleString("ar-SA", { minimumFractionDigits: 0 }) + " ر.س";
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(LOCALE === "en" ? "en-GB" : "ar-SA", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function uid(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---------------- data access ---------------- */

export function loadProducts() {
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
export function persistProducts(products) { return writeJSON("crown_products", products); }

export function loadCart() { return readJSON("crown_cart", []); }
export function persistCart(cart) { return writeJSON("crown_cart", cart); }

export function loadOrders() { return readJSON("crown_orders", []); }
export function persistOrders(orders) { return writeJSON("crown_orders", orders); }

/* ---------------- real results gallery ----------------
   Genuine customer before/after photos only. Two sources:
   1. DEFAULT_RESULTS: real photos committed to public/assets/results/
      (visible to every visitor of the deployed site).
   2. User results in localStorage, managed from the admin panel
      (per-device — good for previewing before committing).
   A result = { id, before, after, caption, weeks }. */
const DEFAULT_RESULTS = [
  // Real customer before/after composites for the hair oil. The frame is
  // recolored per theme: white in light mode, black in dark mode.
  { id: "r-1", imageLight: "assets/results/result-1-light.jpg", imageDark: "assets/results/result-1-dark.jpg", name: "نورة — الرياض", comment: "لاحظت الفرق على بنتي فعلاً" },
  { id: "r-2", imageLight: "assets/results/result-2-light.jpg", imageDark: "assets/results/result-2-dark.jpg", name: "أحمد — الرياض", comment: "كثافة أوضح خلال 6 أسابيع" },
  { id: "r-3", imageLight: "assets/results/result-3-light.jpg", imageDark: "assets/results/result-3-dark.jpg", name: "منى — جدة", comment: "رجعت فراغات الشعر تنمو من جديد بعد استخدام شهرين" },
  { id: "r-4", imageLight: "assets/results/result-4-light.jpg", imageDark: "assets/results/result-4-dark.jpg", name: "سعيد — المدينة المنورة", comment: "تحسّنت فروة الرأس جداً وبدأ شعري ينمو من جديد" },
  { id: "r-5", imageLight: "assets/results/result-5-light.jpg", imageDark: "assets/results/result-5-dark.jpg", name: "منار — الرياض", comment: "ليست أول تجربة لي مع الزيوت، لكن أقدر أقول إنها أفضل تجربة وفعّالة جداً" },
];
export function loadUserResults() { return readJSON("crown_results", []); }
export function persistUserResults(list) { return writeJSON("crown_results", list); }
export function loadResults() { return [...DEFAULT_RESULTS, ...loadUserResults()]; }

/* ---------------- customer reviews ----------------
   Genuine customer reviews only. DEFAULT_REVIEWS holds committed
   reviews (public to every visitor); user reviews in localStorage are
   managed from the admin panel. A review = { id, name, rating, comment }. */
const DEFAULT_REVIEWS = [
  // Add real reviews here, e.g.:
  // { id: "rv-1", name: "سارة", rating: 5, comment: "نتيجة رائعة خلال شهر." },
];
export function loadUserReviews() { return readJSON("crown_reviews", []); }
export function persistUserReviews(list) { return writeJSON("crown_reviews", list); }
export function loadReviews() { return [...DEFAULT_REVIEWS, ...loadUserReviews()]; }

/* ---------------- derived state ---------------- */

/** Join cart lines with the catalog; drop deleted products, clamp to stock. */
export function resolveCart(cart, products) {
  return cart
    .map((line) => {
      const product = products.find((p) => p.id === line.id);
      if (!product) return null;
      return { product, qty: Math.min(line.qty, Math.max(product.stock, 0)) };
    })
    .filter((l) => l && l.qty > 0);
}

export function cartCount(cart, products) {
  return resolveCart(cart, products).reduce((s, l) => s + l.qty, 0);
}
export function cartSubtotal(cart, products) {
  return resolveCart(cart, products).reduce((s, l) => s + l.product.price * l.qty, 0);
}
export function shippingFor(subtotal) {
  const s = loadSettings();
  if (s.freeShipEnabled && subtotal >= s.freeShipOver) return 0;
  return s.shippingFlat;
}

/* ---------------- cart mutations (pure) ---------------- */

/** Returns { cart, error } — error is an Arabic message when clamped. */
export function addLine(cart, products, productId) {
  const product = products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return { cart, error: msg("outOfStock") };
  const existing = cart.find((i) => i.id === productId);
  const qty = existing ? existing.qty : 0;
  if (qty + 1 > product.stock) return { cart, error: msg("noMore") };
  const next = existing
    ? cart.map((i) => (i.id === productId ? { ...i, qty: i.qty + 1 } : i))
    : [...cart, { id: productId, qty: 1 }];
  return { cart: next, error: null };
}

export function changeLineQty(cart, products, productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return { cart, error: null };
  if (delta > 0) {
    const product = products.find((p) => p.id === productId);
    if (product && item.qty + delta > product.stock) {
      return { cart, error: msg("maxQty") };
    }
  }
  const nextQty = item.qty + delta;
  const next = nextQty <= 0
    ? cart.filter((i) => i.id !== productId)
    : cart.map((i) => (i.id === productId ? { ...i, qty: nextQty } : i));
  return { cart: next, error: null };
}

export function removeLine(cart, productId) {
  return cart.filter((i) => i.id !== productId);
}

/* ---------------- orders ---------------- */

/**
 * Build an order from the current cart + form fields, reduce stock.
 * Returns { order, products, cart } with the updated collections.
 */
export function buildOrder(cart, products, fields) {
  const lines = resolveCart(cart, products);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  const order = {
    id: uid("ORD"),
    date: new Date().toISOString(),
    ...fields,
    items: lines.map(({ product: p, qty }) => ({ id: p.id, name: p.name, price: p.price, qty })),
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: "جديد",
  };
  const nextProducts = products.map((p) => {
    const line = lines.find((l) => l.product.id === p.id);
    return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
  });
  return { order, products: nextProducts, cart: [] };
}

/* ---------------- images ---------------- */

/** Downscale an image file to ≤ MAX_IMAGE_EDGE px, return a JPEG data URL. */
export function compressImage(file) {
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
