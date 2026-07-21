/* ============================================================
   CROWN HAIR OIL — Mobile app domain logic (V2.1.1)
   Same storage model as the web store:
     crown_products / crown_cart / crown_orders in localStorage.
   The cart stores only { id, qty }; product data is always
   re-resolved from the catalog so it can never go stale.
   ============================================================ */

export const ADMIN_PASSWORD = "crown2026";
export const SHIPPING_FLAT = 20;
export const FREE_SHIP_OVER = 200;
const MAX_IMAGE_EDGE = 800;

export const PAY_METHOD_LABELS = {
  cod: "دفع عند الاستلام",
  bank: "تحويل بنكي",
  card: "بطاقة مدى / فيزا",
};

// V2.1.1: the retired default product photo, migrated to the new white shot.
const LEGACY_PRODUCT_IMAGE = "assets/hero-light.jpg";
export const DEFAULT_PRODUCT_IMAGE = "assets/product-white.png";

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
  return Number(n).toLocaleString("ar-SA", { minimumFractionDigits: 0 }) + " ر.س";
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("ar-SA", {
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
  { id: "r-1", imageLight: "assets/results/result-1-light.jpg", imageDark: "assets/results/result-1-dark.jpg" },
  { id: "r-2", imageLight: "assets/results/result-2-light.jpg", imageDark: "assets/results/result-2-dark.jpg" },
  { id: "r-3", imageLight: "assets/results/result-3-light.jpg", imageDark: "assets/results/result-3-dark.jpg" },
  { id: "r-4", imageLight: "assets/results/result-4-light.jpg", imageDark: "assets/results/result-4-dark.jpg" },
  { id: "r-5", imageLight: "assets/results/result-5-light.jpg", imageDark: "assets/results/result-5-dark.jpg" },
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
  return subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FLAT;
}

/* ---------------- cart mutations (pure) ---------------- */

/** Returns { cart, error } — error is an Arabic message when clamped. */
export function addLine(cart, products, productId) {
  const product = products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return { cart, error: "المنتج غير متوفر" };
  const existing = cart.find((i) => i.id === productId);
  const qty = existing ? existing.qty : 0;
  if (qty + 1 > product.stock) return { cart, error: "لا تتوفر كمية أكبر من هذا المنتج" };
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
      return { cart, error: "وصلتِ للكمية المتوفرة كاملة" };
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
