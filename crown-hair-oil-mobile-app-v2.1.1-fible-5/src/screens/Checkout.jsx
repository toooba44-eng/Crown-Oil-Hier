import { useState } from 'react';
import { money, pName, resolveCart, cartSubtotal, shippingFor } from '../lib/store.js';

export default function Checkout({ cart, products, settings = {}, lang = 'ar', t, onClose, onSubmit, toast }) {
  const firstMethod = settings.payCod ? 'cod' : settings.payBank ? 'bank' : 'card';
  const [payMethod, setPayMethod] = useState(firstMethod);
  const lines = resolveCart(cart, products);
  const subtotal = cartSubtotal(cart, products);
  const shipping = shippingFor(subtotal);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!lines.length) { toast(t('co.cartEmpty')); return; }
    if (payMethod === 'card' && !settings.payCard) { toast(t('co.cardOff')); return; }
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
          <h2>{t('co.title')}</h2>
          <button className="close-btn" onClick={onClose} aria-label={t('co.close')}>×</button>
        </header>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>{t('co.name')}</span>
            <input name="name" type="text" required placeholder={t('co.namePh')} />
          </label>
          <label className="field">
            <span>{t('co.phone')}</span>
            <input name="phone" type="tel" required inputMode="tel" placeholder={t('co.phonePh')} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>{t('co.city')}</span>
              <input name="city" type="text" required placeholder={t('co.cityPh')} />
            </label>
            <label className="field">
              <span>{t('co.district')}</span>
              <input name="address" type="text" required placeholder={t('co.districtPh')} />
            </label>
          </div>
          <label className="field">
            <span>{t('co.notes')}</span>
            <textarea name="notes" rows="2" placeholder={t('co.notesPh')} />
          </label>

          <fieldset className="pay-methods">
            <legend>{t('co.payLegend')}</legend>
            {settings.payCod && (
              <label className={'pay-option' + (payMethod === 'cod' ? ' active' : '')}>
                <input type="radio" name="payMethod" value="cod" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} />
                <span><strong>{t('co.codT')}</strong><small>{t('co.codD')}</small></span>
              </label>
            )}
            {settings.payBank && (
              <label className={'pay-option' + (payMethod === 'bank' ? ' active' : '')}>
                <input type="radio" name="payMethod" value="bank" checked={payMethod === 'bank'} onChange={() => setPayMethod('bank')} />
                <span><strong>{t('co.bankT')}</strong><small>{t('co.bankD')}</small></span>
              </label>
            )}
            {settings.payCard ? (
              <label className={'pay-option' + (payMethod === 'card' ? ' active' : '')}>
                <input type="radio" name="payMethod" value="card" checked={payMethod === 'card'} onChange={() => setPayMethod('card')} />
                <span><strong>{t('co.cardT')}</strong><small>{t('co.cardD')}</small></span>
              </label>
            ) : (
              <label className="pay-option disabled">
                <input type="radio" name="payMethod" value="card" disabled />
                <span><strong>{t('co.cardSoonT')}</strong><small>{t('co.cardSoonD')}</small></span>
              </label>
            )}
          </fieldset>

          <div className="cart-summary flat">
            {lines.map(({ product: p, qty }) => (
              <div className="sum-line" key={p.id}><span>{pName(p, lang)} × {qty}</span><span>{money(p.price * qty)}</span></div>
            ))}
            <div className="sum-line"><span>{t('co.shipping')}</span><span>{shipping === 0 ? t('co.free') : money(shipping)}</span></div>
            <div className="sum-line total"><span>{t('co.total')}</span><span>{money(subtotal + shipping)}</span></div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">{t('co.submit')}</button>
        </form>
      </div>
    </div>
  );
}
