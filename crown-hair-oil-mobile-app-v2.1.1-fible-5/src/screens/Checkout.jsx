import { useState } from 'react';
import { money, resolveCart, cartSubtotal, shippingFor } from '../lib/store.js';

export default function Checkout({ cart, products, onClose, onSubmit, toast }) {
  const [payMethod, setPayMethod] = useState('cod');
  const lines = resolveCart(cart, products);
  const subtotal = cartSubtotal(cart, products);
  const shipping = shippingFor(subtotal);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!lines.length) { toast('السلة فارغة'); return; }
    if (payMethod === 'card') { toast('الدفع بالبطاقة غير مفعّل بعد'); return; }
    const data = new FormData(e.target);
    onSubmit({
      name: data.get('name'),
      phone: data.get('phone'),
      city: data.get('city'),
      address: data.get('address'),
      notes: data.get('notes') || '',
      payMethod,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal checkout-modal">
        <header className="modal-head">
          <h2>إتمام الطلب</h2>
          <button className="close-btn" onClick={onClose} aria-label="إغلاق">×</button>
        </header>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>الاسم الكامل</span>
            <input name="name" type="text" required placeholder="مثال: سارة العتيبي" />
          </label>
          <label className="field">
            <span>رقم الجوال</span>
            <input name="phone" type="tel" required inputMode="tel" placeholder="05xxxxxxxx" />
          </label>
          <div className="field-row">
            <label className="field">
              <span>المدينة</span>
              <input name="city" type="text" required placeholder="الرياض" />
            </label>
            <label className="field">
              <span>الحي</span>
              <input name="address" type="text" required placeholder="حي الياسمين" />
            </label>
          </div>
          <label className="field">
            <span>ملاحظات (اختياري)</span>
            <textarea name="notes" rows="2" placeholder="مثال: التوصيل بعد الساعة 5 مساءً" />
          </label>

          <fieldset className="pay-methods">
            <legend>طريقة الدفع</legend>
            <label className={'pay-option' + (payMethod === 'cod' ? ' active' : '')}>
              <input type="radio" name="payMethod" value="cod" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} />
              <span><strong>الدفع عند الاستلام</strong><small>نقداً أو بالشبكة عند وصول الطلب.</small></span>
            </label>
            <label className={'pay-option' + (payMethod === 'bank' ? ' active' : '')}>
              <input type="radio" name="payMethod" value="bank" checked={payMethod === 'bank'} onChange={() => setPayMethod('bank')} />
              <span><strong>تحويل بنكي</strong><small>يُرسل رقم الحساب بعد تأكيد الطلب.</small></span>
            </label>
            <label className="pay-option disabled">
              <input type="radio" name="payMethod" value="card" disabled />
              <span><strong>بطاقة مدى / فيزا — قريباً</strong><small>الدفع الإلكتروني قيد التفعيل.</small></span>
            </label>
          </fieldset>

          <div className="cart-summary flat">
            {lines.map(({ product: p, qty }) => (
              <div className="sum-line" key={p.id}><span>{p.name} × {qty}</span><span>{money(p.price * qty)}</span></div>
            ))}
            <div className="sum-line"><span>الشحن</span><span>{shipping === 0 ? 'مجاني' : money(shipping)}</span></div>
            <div className="sum-line total"><span>الإجمالي</span><span>{money(subtotal + shipping)}</span></div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">تأكيد الطلب</button>
        </form>
      </div>
    </div>
  );
}
