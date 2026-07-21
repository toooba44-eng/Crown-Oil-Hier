import { money, pName, resolveCart, cartSubtotal, shippingFor, loadSettings } from '../lib/store.js';

export default function Cart({ cart, products, lang = 'ar', t, onQty, onRemove, onCheckout, lastOrder, onShop }) {
  const lines = resolveCart(cart, products);
  const subtotal = cartSubtotal(cart, products);
  const shipping = lines.length ? shippingFor(subtotal) : 0;
  const freeOver = loadSettings().freeShipOver ?? 200;

  if (lastOrder) {
    return (
      <div className="screen cart-screen">
        <header className="screen-head"><h1>{t('cart.title')}</h1></header>
        <div className="order-confirm">
          <span className="confirm-check" aria-hidden="true">✓</span>
          <h2>{t('cart.confirmTitle')}</h2>
          <p>{t('cart.orderNo')} <strong>{lastOrder.id}</strong></p>
          <p>{t('cart.total')} <strong>{money(lastOrder.total)}</strong></p>
          <p className="muted">{t('cart.confirmNote')}</p>
          <button className="btn btn-primary btn-block" onClick={onShop}>{t('cart.continue')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen cart-screen">
      <header className="screen-head"><h1>{t('cart.title')}</h1></header>

      {lines.length === 0 ? (
        <div className="empty-state">
          <p>{t('cart.empty')}</p>
          <button className="btn btn-primary" onClick={onShop}>{t('cart.browse')}</button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {lines.map(({ product: p, qty }) => (
              <div className="cart-item" key={p.id}>
                <img src={p.image} alt={pName(p, lang)} />
                <div className="cart-item-info">
                  <h3>{pName(p, lang)}</h3>
                  <span className="price">{money(p.price)}</span>
                  <div className="qty-row">
                    <button onClick={() => onQty(p.id, -1)} aria-label={t('cart.dec')}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => onQty(p.id, 1)} aria-label={t('cart.inc')}>+</button>
                    <button className="remove-btn" onClick={() => onRemove(p.id)}>{t('cart.remove')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="sum-line"><span>{t('cart.subtotal')}</span><span>{money(subtotal)}</span></div>
            <div className="sum-line"><span>{t('cart.shipping')}</span><span>{shipping === 0 ? t('cart.free') : money(shipping)}</span></div>
            <div className="sum-line total"><span>{t('cart.grandTotal')}</span><span>{money(subtotal + shipping)}</span></div>
            <button className="btn btn-primary btn-block" onClick={onCheckout}>{t('cart.checkout')}</button>
            <p className="muted small">{t('cart.freeNote', { money: money(freeOver) })}</p>
          </div>
        </>
      )}
    </div>
  );
}
