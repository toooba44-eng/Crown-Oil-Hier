import { useState } from 'react';
import {
  ADMIN_PASSWORD, PAY_METHOD_LABELS, DEFAULT_PRODUCT_IMAGE,
  money, formatDate, uid, compressImage,
} from '../lib/store.js';

export default function Admin({ products, orders, userResults = [], userReviews = [], onSaveProducts, onSaveResults, onSaveReviews, toast }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pane, setPane] = useState('products'); // products | orders | results | reviews
  const [armedDelete, setArmedDelete] = useState(null);
  const [savingResult, setSavingResult] = useState(false);

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

  const deleteResult = (id) => {
    if (armedDelete !== id) {
      setArmedDelete(id);
      setTimeout(() => setArmedDelete((cur) => (cur === id ? null : cur)), 2600);
      return;
    }
    onSaveResults(userResults.filter((r) => r.id !== id));
    setArmedDelete(null);
    toast('تم حذف النتيجة');
  };

  const addResult = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const beforeFile = form.querySelector('[name="before"]').files[0];
    const afterFile = form.querySelector('[name="after"]').files[0];
    if (!beforeFile || !afterFile) { toast('أضيفي صورتي "قبل" و"بعد"'); return; }

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
      toast('تمت إضافة النتيجة');
    } catch {
      toast('تعذّر قراءة الصور');
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
    toast('تم حذف التقييم');
  };

  const addReview = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const comment = (data.get('comment') || '').trim();
    if (!comment) { toast('اكتبي نص التقييم'); return; }
    onSaveReviews([
      ...userReviews,
      {
        id: uid('rv'),
        name: (data.get('name') || '').trim() || 'عميلة',
        rating: Number(data.get('rating')) || 5,
        comment,
      },
    ]);
    form.reset();
    toast('تمت إضافة التقييم');
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
          <button className={'chip' + (pane === 'results' ? ' active' : '')} onClick={() => setPane('results')}>النتائج ({userResults.length})</button>
          <button className={'chip' + (pane === 'reviews' ? ' active' : '')} onClick={() => setPane('reviews')}>التقييمات ({userReviews.length})</button>
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

      {pane === 'results' && (
        <>
          <p className="results-note">أضيفي صوراً <b>حقيقية</b> من نتائج عميلاتك (قبل/بعد) وبإذنهنّ. تجنّبي الصور غير الحقيقية حتى لا يكون العرض مضلِّلاً.</p>
          <div className="admin-list">
            {userResults.length === 0 ? (
              <div className="empty-state">لا توجد نتائج بعد. أضيفي أول نتيجة من الأسفل.</div>
            ) : userResults.map((r) => (
              <div className="admin-item" key={r.id}>
                <img src={r.before} alt="قبل" />
                <img src={r.after} alt="بعد" />
                <div className="grow">
                  <b>{r.name || 'نتيجة'}</b>
                  <span>{r.weeks ? `بعد ${r.weeks} أسابيع` : '—'}</span>
                </div>
                <button
                  className={'icon-btn' + (armedDelete === r.id ? ' danger' : '')}
                  onClick={() => deleteResult(r.id)}
                >
                  {armedDelete === r.id ? 'تأكيد؟' : '🗑'}
                </button>
              </div>
            ))}
          </div>

          <h2 className="sub-head">إضافة نتيجة جديدة</h2>
          <form onSubmit={addResult} className="admin-form">
            <div className="field-row">
              <label className="field"><span>صورة "قبل"</span><input name="before" type="file" accept="image/*" required /></label>
              <label className="field"><span>صورة "بعد"</span><input name="after" type="file" accept="image/*" required /></label>
            </div>
            <div className="field-row">
              <label className="field"><span>اسم العميلة (اختياري)</span><input name="name" type="text" placeholder="مثال: سارة — الرياض" /></label>
              <label className="field"><span>عدد الأسابيع</span><input name="weeks" type="number" min="0" placeholder="6" /></label>
            </div>
            <label className="field"><span>تعليق تحت الصورة (اختياري)</span><input name="comment" type="text" placeholder="مثال: لاحظت فرقاً واضحاً في الكثافة" /></label>
            <small className="muted small">تُضغط الصور تلقائياً لتناسب التخزين.</small>
            <button type="submit" className="btn btn-primary btn-block" disabled={savingResult}>
              {savingResult ? 'جارٍ الحفظ…' : 'حفظ النتيجة'}
            </button>
          </form>
        </>
      )}

      {pane === 'reviews' && (
        <>
          <p className="results-note">أضيفي تقييمات <b>حقيقية</b> من عميلاتك وبإذنهنّ. تجنّبي التقييمات غير الحقيقية حتى لا يكون العرض مضلِّلاً.</p>
          <div className="admin-list">
            {userReviews.length === 0 ? (
              <div className="empty-state">لا توجد تقييمات بعد. أضيفي أول تقييم من الأسفل.</div>
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
                  {armedDelete === rv.id ? 'تأكيد؟' : '🗑'}
                </button>
              </div>
            ))}
          </div>

          <h2 className="sub-head">إضافة تقييم جديد</h2>
          <form onSubmit={addReview} className="admin-form">
            <div className="field-row">
              <label className="field"><span>اسم العميلة</span><input name="name" type="text" placeholder="مثال: نورة" /></label>
              <label className="field"><span>التقييم</span>
                <select name="rating" defaultValue="5">
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★☆ (4)</option>
                  <option value="3">★★★☆☆ (3)</option>
                  <option value="2">★★☆☆☆ (2)</option>
                  <option value="1">★☆☆☆☆ (1)</option>
                </select>
              </label>
            </div>
            <label className="field"><span>نص التقييم</span><textarea name="comment" rows="3" placeholder="مثال: منتج ممتاز، لاحظت فرقاً خلال شهر." required /></label>
            <button type="submit" className="btn btn-primary btn-block">حفظ التقييم</button>
          </form>
        </>
      )}
    </div>
  );
}
