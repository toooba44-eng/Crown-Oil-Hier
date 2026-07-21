import { useState } from 'react';
import {
  PAY_METHOD_LABELS, DEFAULT_PRODUCT_IMAGE,
  money, formatDate, uid, compressImage, sha256Hex, pName,
} from '../lib/store.js';

export default function Admin({ products, orders, userResults = [], userReviews = [], settings = {}, lang = 'ar', t, onSaveProducts, onSaveResults, onSaveReviews, onSaveSettings, toast }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pane, setPane] = useState('products'); // products | orders | results | reviews | settings
  const [armedDelete, setArmedDelete] = useState(null);
  const [savingResult, setSavingResult] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [checking, setChecking] = useState(false);

  const payLabel = (m) => ({ cod: t('co.codT'), bank: t('co.bankT'), card: t('co.cardT') }[m] || PAY_METHOD_LABELS[m] || m);

  const login = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const email = (data.get('email') || '').trim().toLowerCase();
    const password = data.get('password') || '';
    setChecking(true);
    try {
      const hash = await sha256Hex(password);
      const emailOk = email === (settings.adminEmail || '').trim().toLowerCase();
      if (emailOk && hash === settings.adminPassHash) {
        setUnlocked(true);
      } else {
        toast(t('admin.badCreds'));
      }
    } catch {
      toast(t('admin.verifyErr'));
    } finally {
      setChecking(false);
    }
  };

  const deleteProduct = (id) => {
    if (armedDelete !== id) {
      setArmedDelete(id);
      setTimeout(() => setArmedDelete((cur) => (cur === id ? null : cur)), 2600);
      return;
    }
    onSaveProducts(products.filter((p) => p.id !== id));
    setArmedDelete(null);
    toast(t('admin.productDeleted'));
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const file = form.querySelector('[name="image"]').files[0];

    let image = null;
    if (file) {
      try { image = await compressImage(file); }
      catch { toast(t('admin.imgReadErr')); }
    }

    onSaveProducts([
      ...products,
      {
        id: uid('p'),
        name: data.get('name'),
        desc: data.get('desc'),
        price: Number(data.get('price')) || 0,
        oldPrice: data.get('oldPrice') ? Number(data.get('oldPrice')) : null,
        stock: Number(data.get('stock')) || 0,
        category: data.get('category') || 'عام',
        image: image || DEFAULT_PRODUCT_IMAGE,
      },
    ]);
    form.reset();
    toast(t('admin.productAdded'));
  };

  const deleteResult = (id) => {
    if (armedDelete !== id) {
      setArmedDelete(id);
      setTimeout(() => setArmedDelete((cur) => (cur === id ? null : cur)), 2600);
      return;
    }
    onSaveResults(userResults.filter((r) => r.id !== id));
    setArmedDelete(null);
    toast(t('admin.resultDeleted'));
  };

  const addResult = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const beforeFile = form.querySelector('[name="before"]').files[0];
    const afterFile = form.querySelector('[name="after"]').files[0];
    if (!beforeFile || !afterFile) { toast(t('admin.needBothImages')); return; }

    setSavingResult(true);
    try {
      const [before, after] = await Promise.all([compressImage(beforeFile), compressImage(afterFile)]);
      onSaveResults([
        ...userResults,
        {
          id: uid('r'),
          before,
          after,
          name: data.get('name') || '',
          comment: data.get('comment') || '',
          weeks: Number(data.get('weeks')) || 0,
        },
      ]);
      form.reset();
      toast(t('admin.resultAdded'));
    } catch {
      toast(t('admin.imgsReadErr'));
    } finally {
      setSavingResult(false);
    }
  };

  const deleteReview = (id) => {
    if (armedDelete !== id) {
      setArmedDelete(id);
      setTimeout(() => setArmedDelete((cur) => (cur === id ? null : cur)), 2600);
      return;
    }
    onSaveReviews(userReviews.filter((r) => r.id !== id));
    setArmedDelete(null);
    toast(t('admin.reviewDeleted'));
  };

  const addReview = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const comment = (data.get('comment') || '').trim();
    if (!comment) { toast(t('admin.rvNeed')); return; }
    onSaveReviews([
      ...userReviews,
      {
        id: uid('rv'),
        name: (data.get('name') || '').trim() || t('store.customer'),
        rating: Number(data.get('rating')) || 5,
        comment,
      },
    ]);
    form.reset();
    toast(t('admin.reviewAdded'));
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    const payCod = data.get('payCod') === 'on';
    const payBank = data.get('payBank') === 'on';
    const payCard = data.get('payCard') === 'on';
    if (!payCod && !payBank && !payCard) { toast(t('admin.needPay')); return; }

    const adminEmail = (data.get('adminEmail') || '').trim();
    if (!adminEmail) { toast(t('admin.needEmail')); return; }

    const next = {
      storeName: (data.get('storeName') || '').trim() || settings.storeName,
      tagline: (data.get('tagline') || '').trim(),
      shippingFlat: Math.max(0, Number(data.get('shippingFlat')) || 0),
      freeShipOver: Math.max(0, Number(data.get('freeShipOver')) || 0),
      freeShipEnabled: data.get('freeShipEnabled') === 'on',
      payCod, payBank, payCard,
      instagram: (data.get('instagram') || '').trim(),
      website: (data.get('website') || '').trim(),
      adminEmail,
    };

    const newPass = (data.get('newPass') || '').trim();
    if (newPass) {
      if (newPass.length < 6) { toast(t('admin.passTooShort')); return; }
      next.adminPassHash = await sha256Hex(newPass);
    }

    setSavingSettings(true);
    try {
      onSaveSettings(next);
      const passField = form.querySelector('[name="newPass"]');
      if (passField) passField.value = '';
      toast(newPass ? t('admin.settingsSavedPass') : t('admin.settingsSaved'));
    } finally {
      setSavingSettings(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="screen admin-screen">
        <header className="screen-head"><h1>{t('admin.title')}</h1></header>
        <div className="lock-card">
          <p>{t('admin.lockIntro')}</p>
          <form onSubmit={login}>
            <label className="field">
              <span>{t('admin.email')}</span>
              <input name="email" type="email" required autoComplete="username" inputMode="email" placeholder="you@example.com" defaultValue={settings.adminEmail} />
            </label>
            <label className="field">
              <span>{t('admin.password')}</span>
              <input name="password" type="password" required autoComplete="current-password" />
            </label>
            <button type="submit" className="btn btn-primary btn-block" disabled={checking}>
              {checking ? t('admin.checking') : t('admin.login')}
            </button>
          </form>
          <p className="muted small lock-note">{t('admin.lockNote')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen admin-screen">
      <header className="screen-head">
        <h1>{t('admin.title')}</h1>
        <div className="chip-row">
          <button className={'chip' + (pane === 'products' ? ' active' : '')} onClick={() => setPane('products')}>{t('admin.tabProducts')}</button>
          <button className={'chip' + (pane === 'orders' ? ' active' : '')} onClick={() => setPane('orders')}>{t('admin.tabOrders', { n: orders.length })}</button>
          <button className={'chip' + (pane === 'results' ? ' active' : '')} onClick={() => setPane('results')}>{t('admin.tabResults', { n: userResults.length })}</button>
          <button className={'chip' + (pane === 'reviews' ? ' active' : '')} onClick={() => setPane('reviews')}>{t('admin.tabReviews', { n: userReviews.length })}</button>
          <button className={'chip' + (pane === 'settings' ? ' active' : '')} onClick={() => setPane('settings')}>{t('admin.tabSettings')}</button>
        </div>
      </header>

      {pane === 'products' && (
        <>
          <div className="admin-list">
            {products.map((p) => (
              <div className="admin-item" key={p.id}>
                <img src={p.image} alt={pName(p, lang)} />
                <div className="grow">
                  <b>{pName(p, lang)}</b>
                  <span>{money(p.price)} · {p.category || t('admin.noCategory')} · {t('admin.stock')}: {p.stock}</span>
                </div>
                <button
                  className={'icon-btn' + (armedDelete === p.id ? ' danger' : '')}
                  onClick={() => deleteProduct(p.id)}
                >
                  {armedDelete === p.id ? t('admin.confirm') : '🗑'}
                </button>
              </div>
            ))}
          </div>

          <h2 className="sub-head">{t('admin.addProduct')}</h2>
          <form onSubmit={addProduct} className="admin-form">
            <label className="field"><span>{t('admin.pName')}</span><input name="name" type="text" required /></label>
            <label className="field"><span>{t('admin.pDesc')}</span><textarea name="desc" rows="2" /></label>
            <div className="field-row">
              <label className="field"><span>{t('admin.pPrice')}</span><input name="price" type="number" min="0" step="0.5" required /></label>
              <label className="field"><span>{t('admin.pOld')}</span><input name="oldPrice" type="number" min="0" step="0.5" /></label>
            </div>
            <div className="field-row">
              <label className="field"><span>{t('admin.pStock')}</span><input name="stock" type="number" min="0" required /></label>
              <label className="field"><span>{t('admin.pCat')}</span><input name="category" type="text" /></label>
            </div>
            <label className="field">
              <span>{t('admin.pImage')}</span>
              <input name="image" type="file" accept="image/*" />
              <small className="muted small">{t('admin.imgHint')}</small>
            </label>
            <button type="submit" className="btn btn-primary btn-block">{t('admin.saveProduct')}</button>
          </form>
        </>
      )}

      {pane === 'orders' && (
        <div className="admin-list">
          {orders.length === 0 ? (
            <div className="empty-state">{t('admin.noOrders')}</div>
          ) : orders.map((o) => (
            <div className="admin-item column" key={o.id}>
              <div className="order-head">
                <b>{o.id}</b>
                <span className="order-status">{o.status && o.status !== 'جديد' ? o.status : t('admin.orderNew')}</span>
              </div>
              <span>{o.name} · {o.phone} · {o.city}</span>
              <span>{money(o.total)} · {payLabel(o.payMethod)}</span>
              <span className="muted small">{formatDate(o.date)}</span>
            </div>
          ))}
        </div>
      )}

      {pane === 'results' && (
        <>
          <p className="results-note">{t('admin.resultsNote')}</p>
          <div className="admin-list">
            {userResults.length === 0 ? (
              <div className="empty-state">{t('admin.noResults')}</div>
            ) : userResults.map((r) => (
              <div className="admin-item" key={r.id}>
                <img src={r.before} alt={t('store.before')} />
                <img src={r.after} alt={t('store.after')} />
                <div className="grow">
                  <b>{r.name || t('admin.result')}</b>
                  <span>{r.weeks ? t('admin.afterWeeks', { n: r.weeks }) : '—'}</span>
                </div>
                <button
                  className={'icon-btn' + (armedDelete === r.id ? ' danger' : '')}
                  onClick={() => deleteResult(r.id)}
                >
                  {armedDelete === r.id ? t('admin.confirm') : '🗑'}
                </button>
              </div>
            ))}
          </div>

          <h2 className="sub-head">{t('admin.addResult')}</h2>
          <form onSubmit={addResult} className="admin-form">
            <div className="field-row">
              <label className="field"><span>{t('admin.imgBefore')}</span><input name="before" type="file" accept="image/*" required /></label>
              <label className="field"><span>{t('admin.imgAfter')}</span><input name="after" type="file" accept="image/*" required /></label>
            </div>
            <div className="field-row">
              <label className="field"><span>{t('admin.clientName')}</span><input name="name" type="text" placeholder={t('admin.clientNamePh')} /></label>
              <label className="field"><span>{t('admin.weeks')}</span><input name="weeks" type="number" min="0" placeholder="6" /></label>
            </div>
            <label className="field"><span>{t('admin.resultComment')}</span><input name="comment" type="text" placeholder={t('admin.resultCommentPh')} /></label>
            <small className="muted small">{t('admin.imgHint')}</small>
            <button type="submit" className="btn btn-primary btn-block" disabled={savingResult}>
              {savingResult ? t('admin.saving') : t('admin.saveResult')}
            </button>
          </form>
        </>
      )}

      {pane === 'reviews' && (
        <>
          <p className="results-note">{t('admin.reviewsNote')}</p>
          <div className="admin-list">
            {userReviews.length === 0 ? (
              <div className="empty-state">{t('admin.noReviews')}</div>
            ) : userReviews.map((rv) => (
              <div className="admin-item" key={rv.id}>
                <div className="grow">
                  <b>{rv.name} · {'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</b>
                  <span>{rv.comment}</span>
                </div>
                <button
                  className={'icon-btn' + (armedDelete === rv.id ? ' danger' : '')}
                  onClick={() => deleteReview(rv.id)}
                >
                  {armedDelete === rv.id ? t('admin.confirm') : '🗑'}
                </button>
              </div>
            ))}
          </div>

          <h2 className="sub-head">{t('admin.addReview')}</h2>
          <form onSubmit={addReview} className="admin-form">
            <div className="field-row">
              <label className="field"><span>{t('admin.rvName')}</span><input name="name" type="text" placeholder={t('admin.rvNamePh')} /></label>
              <label className="field"><span>{t('admin.rvRating')}</span>
                <select name="rating" defaultValue="5">
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★☆ (4)</option>
                  <option value="3">★★★☆☆ (3)</option>
                  <option value="2">★★☆☆☆ (2)</option>
                  <option value="1">★☆☆☆☆ (1)</option>
                </select>
              </label>
            </div>
            <label className="field"><span>{t('admin.rvComment')}</span><textarea name="comment" rows="3" placeholder={t('admin.rvCommentPh')} required /></label>
            <button type="submit" className="btn btn-primary btn-block">{t('admin.saveReview')}</button>
          </form>
        </>
      )}

      {pane === 'settings' && (
        <form onSubmit={saveSettings} className="admin-form settings-form" key={settings.adminPassHash}>
          <h2 className="sub-head">{t('admin.setIdentity')}</h2>
          <label className="field"><span>{t('admin.setStoreName')}</span><input name="storeName" type="text" defaultValue={settings.storeName} /></label>
          <label className="field"><span>{t('admin.setTagline')}</span><input name="tagline" type="text" defaultValue={settings.tagline} /></label>

          <h2 className="sub-head">{t('admin.setShipping')}</h2>
          <div className="field-row">
            <label className="field"><span>{t('admin.setShipFlat')}</span><input name="shippingFlat" type="number" min="0" step="0.5" defaultValue={settings.shippingFlat} /></label>
            <label className="field"><span>{t('admin.setFreeOver')}</span><input name="freeShipOver" type="number" min="0" step="1" defaultValue={settings.freeShipOver} /></label>
          </div>
          <label className="switch-row">
            <input name="freeShipEnabled" type="checkbox" defaultChecked={settings.freeShipEnabled} />
            <span>{t('admin.setFreeEnabled')}</span>
          </label>

          <h2 className="sub-head">{t('admin.setPay')}</h2>
          <label className="switch-row">
            <input name="payCod" type="checkbox" defaultChecked={settings.payCod} />
            <span>{t('co.codT')}</span>
          </label>
          <label className="switch-row">
            <input name="payBank" type="checkbox" defaultChecked={settings.payBank} />
            <span>{t('co.bankT')}</span>
          </label>
          <label className="switch-row">
            <input name="payCard" type="checkbox" defaultChecked={settings.payCard} />
            <span>{t('co.cardT')}</span>
          </label>

          <h2 className="sub-head">{t('admin.setContact')}</h2>
          <label className="field"><span>{t('admin.setInstagram')}</span><input name="instagram" type="text" defaultValue={settings.instagram} placeholder="@CrownHairOil" /></label>
          <label className="field"><span>{t('admin.setWebsite')}</span><input name="website" type="url" defaultValue={settings.website} placeholder="https://" /></label>

          <h2 className="sub-head">{t('admin.setCreds')}</h2>
          <label className="field"><span>{t('admin.setAdminEmail')}</span><input name="adminEmail" type="email" defaultValue={settings.adminEmail} inputMode="email" /></label>
          <label className="field">
            <span>{t('admin.setNewPass')}</span>
            <input name="newPass" type="password" autoComplete="new-password" placeholder="••••••" />
            <small className="muted small">{t('admin.setPassHint')}</small>
          </label>

          <p className="muted small lock-note">{t('admin.setNote')}</p>

          <button type="submit" className="btn btn-primary btn-block" disabled={savingSettings}>
            {savingSettings ? t('admin.saving') : t('admin.saveSettings')}
          </button>
        </form>
      )}
    </div>
  );
}
