import { useState } from 'react';
import {
  ADMIN_PASSWORD, PAY_METHOD_LABELS, DEFAULT_PRODUCT_IMAGE,
  money, formatDate, uid, compressImage,
} from '../lib/store.js';

export default function Admin({ products, orders, onSaveProducts, toast }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pane, setPane] = useState('products'); // products | orders
  const [armedDelete, setArmedDelete] = useState(null);

  const login = (e) => {
    e.preventDefault();
    const val = new FormData(e.target).get('password');
    if (val === ADMIN_PASSWORD) setUnlocked(true);
    else toast('كلمة المرور غير صحيحة');
  };

  const deleteProduct = (id) => {
    if (armedDelete !== id) {
      setArmedDelete(id);
      setTimeout(() => setArmedDelete((cur) => (cur === id ? null : cur)), 2600);
      return;
    }
    onSaveProducts(products.filter((p) => p.id !== id));
    setArmedDelete(null);
    toast('تم حذف المنتج');
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const file = form.querySelector('[name="image"]').files[0];

    let image = null;
    if (file) {
      try { image = await compressImage(file); }
      catch { toast('تعذّر قراءة الصورة — سيُستخدم شكل افتراضي'); }
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
    toast('تمت إضافة المنتج بنجاح');
  };

  if (!unlocked) {
    return (
      <div className="screen admin-screen">
        <header className="screen-head"><h1>لوحة التحكم</h1></header>
        <div className="lock-card">
          <p>هذه المنطقة لإدارة المتجر فقط. أدخلي كلمة المرور للاستمرار.</p>
          <form onSubmit={login}>
            <label className="field">
              <span>كلمة المرور</span>
              <input name="password" type="password" required autoComplete="current-password" />
            </label>
            <button type="submit" className="btn btn-primary btn-block">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="screen admin-screen">
      <header className="screen-head">
        <h1>لوحة التحكم</h1>
        <div className="chip-row">
          <button className={'chip' + (pane === 'products' ? ' active' : '')} onClick={() => setPane('products')}>المنتجات</button>
          <button className={'chip' + (pane === 'orders' ? ' active' : '')} onClick={() => setPane('orders')}>الطلبات ({orders.length})</button>
        </div>
      </header>

      {pane === 'products' && (
        <>
          <div className="admin-list">
            {products.map((p) => (
              <div className="admin-item" key={p.id}>
                <img src={p.image} alt={p.name} />
                <div className="grow">
                  <b>{p.name}</b>
                  <span>{money(p.price)} · {p.category || 'بدون تصنيف'} · المخزون: {p.stock}</span>
                </div>
                <button
                  className={'icon-btn' + (armedDelete === p.id ? ' danger' : '')}
                  onClick={() => deleteProduct(p.id)}
                >
                  {armedDelete === p.id ? 'تأكيد؟' : '🗑'}
                </button>
              </div>
            ))}
          </div>

          <h2 className="sub-head">إضافة منتج جديد</h2>
          <form onSubmit={addProduct} className="admin-form">
            <label className="field"><span>اسم المنتج</span><input name="name" type="text" required /></label>
            <label className="field"><span>الوصف</span><textarea name="desc" rows="2" /></label>
            <div className="field-row">
              <label className="field"><span>السعر (ر.س)</span><input name="price" type="number" min="0" step="0.5" required /></label>
              <label className="field"><span>قبل الخصم</span><input name="oldPrice" type="number" min="0" step="0.5" /></label>
            </div>
            <div className="field-row">
              <label className="field"><span>الكمية</span><input name="stock" type="number" min="0" required /></label>
              <label className="field"><span>التصنيف</span><input name="category" type="text" /></label>
            </div>
            <label className="field">
              <span>صورة المنتج</span>
              <input name="image" type="file" accept="image/*" />
              <small className="muted small">تُضغط الصورة تلقائياً لتناسب التخزين.</small>
            </label>
            <button type="submit" className="btn btn-primary btn-block">حفظ المنتج</button>
          </form>
        </>
      )}

      {pane === 'orders' && (
        <div className="admin-list">
          {orders.length === 0 ? (
            <div className="empty-state">لا توجد طلبات بعد.</div>
          ) : orders.map((o) => (
            <div className="admin-item column" key={o.id}>
              <div className="order-head">
                <b>{o.id}</b>
                <span className="order-status">{o.status || 'جديد'}</span>
              </div>
              <span>{o.name} · {o.phone} · {o.city}</span>
              <span>{money(o.total)} · {PAY_METHOD_LABELS[o.payMethod] || o.payMethod}</span>
              <span className="muted small">{formatDate(o.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
