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
  cartCount, addLine, changeLineQty, removeLine, buildOrder,
} from './lib/store.js';

export default function App() {
  const [tab, setTab] = useState('home');           // home | store | cart | admin
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [products, setProducts] = useState(loadProducts);
  const [cart, setCart] = useState(loadCart);
  const [orders, setOrders] = useState(loadOrders);
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

  return (
    <div className="app" dir="rtl">
      <button
        className="theme-fab"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'التبديل إلى الوضع العادي' : 'التبديل إلى الوضع الداكن'}
        title="الوضع الداكن / العادي"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <main className="screen-area">
        {tab === 'home' && <Home onShop={() => setTab('store')} />}
        {tab === 'store' && <Store products={products} onAdd={handleAdd} />}
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
            onSaveProducts={(p) => setProducts(p)}
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
