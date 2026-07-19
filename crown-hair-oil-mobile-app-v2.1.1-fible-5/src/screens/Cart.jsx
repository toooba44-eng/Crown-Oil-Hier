import { money, resolveCart, cartSubtotal, shippingFor } from '../lib/store.js';

export default function Cart({ cart, products, onQty, onRemove, onCheckout, lastOrder, onShop }) {
  const lines = resolveCart(cart, products);
  const subtotal = cartSubtotal(cart, products);
  const shipping = lines.length ? shippingFor(subtotal) : 0;

  if (lastOrder) {
    return (
      <div className="screen cart-screen">
        <header className="screen-head"><h1>السلة</h1></header>
        <div className="order-confirm">
          <span className="confirm-check" aria-hidden="true">✓</span>
          <h2>تم استلام طلبك بنجاح</h2>
          <p>رقم الطلب: <strong>{lastOrder.id}</strong></p>
          <p>الإجمالي: <strong>{money(lastOrder.total)}</strong></p>
          <p className="muted">سيتم التواصل معك لتأكيد التفاصيل والتوصيل.</p>
          <button className="btn btn-primary btn-block" onClick={onShop}>متابعة التسوق</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen cart-screen">
      <header className="screen-head"><h1>السلة</h1></header>

      {lines.length === 0 ? (
        <div className="empty-state">
          <p>سلتك فارغة، تصفحي المنتجات وأضيفي ما يناسبك.</p>
          <button className="btn btn-primary" onClick={onShop}>تصفّح المتجر</button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {lines.map(({ product: p, qty }) => (
              <div className="cart-item" key={p.id}>
                <img src={p.image} alt={p.name} />
                <div className="cart-item-info">
                  <h3>{p.name}</h3>
                  <span className="price">{money(p.price)}</span>
                  <div className="qty-row">
                    <button onClick={() => onQty(p.id, -1)} aria-label="إنقاص الكمية">−</button>
                    <span>{qty}</span>
                    <button onClick={() => onQty(p.id, 1)} aria-label="زيادة الكمية">+</button>
                    <button className="remove-btn" onClick={() => onRemove(p.id)}>إزالة</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="sum-line"><span>المجموع الفرعي</span><span>{money(subtotal)}</span></div>
            <div className="sum-line"><span>الشحن</span><span>{shipping === 0 ? 'مجاني' : money(shipping)}</span></div>
            <div className="sum-line total"><span>الإجمالي</span><span>{money(subtotal + shipping)}</span></div>
            <button className="btn btn-primary btn-block" onClick={onCheckout}>إتمام الشراء</button>
            <p className="muted small">شحن مجاني للطلبات أكثر من 200 ر.س.</p>
          </div>
        </>
      )}
    </div>
  );
}
