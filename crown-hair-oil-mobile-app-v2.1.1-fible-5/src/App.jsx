import { useCallback, useEffect, useRef, useState } from 'react';
import Home from './screens/Home.jsx';
import Store from './screens/Store.jsx';
import Cart from './screens/Cart.jsx';
import Checkout from './screens/Checkout.jsx';
import Admin from './screens/Admin.jsx';
import TabBar from './components/TabBar.jsx';
import {
  loadProducts, persistProducts,
  loadCart, persistCart,
  loadOrders, persistOrders,
  loadResults, loadUserResults, persistUserResults,
  cartCount, addLine, changeLineQty, removeLine, buildOrder,
} from './lib/store.js';

export default function App() {
  const [tab, setTab] = useState('home');           // home | store | cart | admin
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [products, setProducts] = useState(loadProducts);
  const [cart, setCart] = useState(loadCart);
  const [orders, setOrders] = useState(loadOrders);
  const [results, setResults] = useState(loadResults);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0D0C0A' : '#F6F1E6');
    try { localStorage.setItem('crown_theme', theme); } catch { /* private mode */ }
  }, [theme]);

  useEffect(() => { persistProducts(products); }, [products]);
  useEffect(() => { persistCart(cart); }, [cart]);
  useEffect(() => { persistOrders(orders); }, [orders]);

  const handleAdd = (productId) => {
    const { cart: next, error } = addLine(cart, products, productId);
    if (error) { toast(error); return; }
    setCart(next);
    toast('تمت إضافة المنتج إلى السلة');
  };

  const handleQty = (productId, delta) => {
    const { cart: next, error } = changeLineQty(cart, products, productId, delta);
    if (error) { toast(error); return; }
    setCart(next);
  };

  const handleRemove = (productId) => setCart(removeLine(cart, productId));

  const handleOrder = (fields) => {
    const { order, products: nextProducts, cart: nextCart } = buildOrder(cart, products, fields);
    setProducts(nextProducts);
    setOrders([order, ...orders]);
    setCart(nextCart);
    setLastOrder(order);
    return order;
  };

  const count = cartCount(cart, products);

  const shareSite = async () => {
    const url = new URL('../', window.location.href).href; // the site home page
    const data = { title: 'Crown Hair Oil', text: 'Crown Hair Oil — زيت شعر طبيعي 100٪ 🌿', url };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* dismissed */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); toast('تم نسخ رابط الموقع'); }
      catch { window.prompt('انسخي الرابط:', url); }
    } else {
      window.prompt('انسخي الرابط:', url);
    }
  };

  return (
    <div className="app" dir="rtl">
      <div className="top-fabs">
        <a className="fab hub-fab" href="../" aria-label="الصفحة الرئيسية للموقع" title="الصفحة الرئيسية">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </a>
        <button className="fab share-fab" onClick={shareSite} aria-label="مشاركة الموقع" title="مشاركة الموقع">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </button>
        <button
          className="fab theme-fab"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'التبديل إلى الوضع العادي' : 'التبديل إلى الوضع الداكن'}
          title="الوضع الداكن / العادي"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      <main className="screen-area">
        {tab === 'home' && <Home onShop={() => setTab('store')} />}
        {tab === 'store' && <Store products={products} results={results} theme={theme} onAdd={handleAdd} />}
        {tab === 'cart' && (
          <Cart
            cart={cart} products={products}
            onQty={handleQty} onRemove={handleRemove}
            onCheckout={() => { setLastOrder(null); setCheckoutOpen(true); }}
            lastOrder={lastOrder}
            onShop={() => setTab('store')}
          />
        )}
        {tab === 'admin' && (
          <Admin
            products={products} orders={orders}
            userResults={loadUserResults()}
            onSaveProducts={(p) => setProducts(p)}
            onSaveResults={(list) => { persistUserResults(list); setResults(loadResults()); }}
            toast={toast}
          />
        )}
      </main>

      {checkoutOpen && (
        <Checkout
          cart={cart} products={products}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={(fields) => {
            const order = handleOrder(fields);
            setCheckoutOpen(false);
            toast('تم استلام طلبك: ' + order.id);
          }}
          toast={toast}
        />
      )}

      <TabBar tab={tab} count={count} onChange={setTab} />

      <div className={'toast' + (toastMsg ? ' show' : '')} role="status" aria-live="polite">{toastMsg}</div>
    </div>
  );
}
