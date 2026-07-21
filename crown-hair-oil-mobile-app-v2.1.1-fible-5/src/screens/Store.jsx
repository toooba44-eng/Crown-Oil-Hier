import { useMemo, useState } from 'react';
import { money } from '../lib/store.js';

function saleBadge(p) {
  if (!p.oldPrice || p.oldPrice <= p.price) return null;
  const pct = Math.round((1 - p.price / p.oldPrice) * 100);
  return <span className="sale-ribbon">خصم {pct}٪</span>;
}

function stockNote(stock) {
  if (stock <= 0) return <span className="stock-note out">غير متوفر</span>;
  if (stock <= 5) return <span className="stock-note low">باقي {stock} فقط</span>;
  return <span className="stock-note">متوفر</span>;
}

function ResultSlide({ r, theme, ariaHidden }) {
  const composite = r.imageLight ? (theme === 'dark' ? r.imageDark : r.imageLight) : r.image;
  return (
    <figure className="result-slide" aria-hidden={ariaHidden || undefined}>
      {composite ? (
        <div className="result-frame">
          <img src={composite} alt="نتيجة قبل وبعد استخدام الزيت" />
        </div>
      ) : (
        <div className="result-frame">
          <div className="result-pair">
            <div className="result-img"><span className="result-tag after">بعد</span><img src={r.after} alt="بعد الاستخدام" /></div>
            <div className="result-img"><span className="result-tag">قبل</span><img src={r.before} alt="قبل الاستخدام" /></div>
          </div>
        </div>
      )}
      {(r.weeks || r.name || r.comment || r.caption) && (
        <figcaption className="result-cap">
          {r.weeks ? <span className="result-weeks">النتيجة بعد {r.weeks} أسابيع</span> : null}
          {(r.name || r.caption) ? <span className="result-name">{r.name || r.caption}</span> : null}
          {r.comment ? <span className="result-comment">”{r.comment}“</span> : null}
        </figcaption>
      )}
    </figure>
  );
}

function Stars({ rating }) {
  const n = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <span className="stars" aria-label={`${n} من 5`}>
      {'★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n)}
    </span>
  );
}

export default function Store({ products, results = [], reviews = [], theme, onAdd }) {
  const [cat, setCat] = useState('الكل');
  const [detail, setDetail] = useState(null); // product shown in the bottom sheet

  const cats = useMemo(
    () => ['الكل', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );
  const filtered = cat === 'الكل' ? products : products.filter((p) => p.category === cat);

  return (
    <div className="screen store-screen">
      <header className="screen-head">
        <h1>المتجر</h1>
        <div className="chip-row">
          {cats.map((c) => (
            <button key={c} className={'chip' + (c === cat ? ' active' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="empty-state">لا توجد منتجات في هذا التصنيف حالياً.</div>
      ) : (
        <div className="product-list">
          {filtered.map((p) => (
            <article className="product-card" key={p.id}>
              <button className="product-thumb" onClick={() => setDetail(p)} aria-label={'تفاصيل ' + p.name}>
                {saleBadge(p)}
                <img src={p.image} alt={p.name} loading="lazy" />
              </button>
              <div className="product-body">
                <h3>{p.name}</h3>
                <div className="price-row">
                  <span className="price">{money(p.price)}</span>
                  {p.oldPrice ? <span className="price-old">{money(p.oldPrice)}</span> : null}
                  {stockNote(p.stock)}
                </div>
                <button className="btn btn-primary btn-block" disabled={p.stock <= 0} onClick={() => onAdd(p.id)}>
                  {p.stock <= 0 ? 'غير متوفر' : 'أضف للسلة'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <section className="results-section">
          <div className="results-head">
            <h2>نتائج حقيقية</h2>
            <p>صور فعلية من عميلاتنا قبل وبعد استخدام الزيت.</p>
          </div>
          <div className="results-viewport">
            <div className="results-track" style={{ '--result-count': results.length }}>
              {[...results, ...results].map((r, idx) => (
                <ResultSlide key={r.id + '-' + idx} r={r} theme={theme} ariaHidden={idx >= results.length} />
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="reviews-section">
          <div className="results-head">
            <h2>تقييمات العملاء</h2>
            <p>آراء حقيقية من عميلاتنا بعد التجربة.</p>
          </div>
          <div className="reviews-list">
            {reviews.map((rv) => (
              <article className="review-card" key={rv.id}>
                <div className="review-top">
                  <span className="review-avatar" aria-hidden="true">{(rv.name || '؟').trim().charAt(0)}</span>
                  <div className="review-id">
                    <b>{rv.name || 'عميلة'}</b>
                    <Stars rating={rv.rating} />
                  </div>
                </div>
                <p className="review-comment">{rv.comment}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {detail && (
        <div className="sheet-overlay" onClick={() => setDetail(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <img className="sheet-img" src={detail.image} alt={detail.name} />
            <h2>{detail.name}</h2>
            <p className="sheet-desc">{detail.desc}</p>
            <div className="price-row">
              <span className="price">{money(detail.price)}</span>
              {detail.oldPrice ? <span className="price-old">{money(detail.oldPrice)}</span> : null}
              {stockNote(detail.stock)}
            </div>
            <button
              className="btn btn-primary btn-block"
              disabled={detail.stock <= 0}
              onClick={() => { onAdd(detail.id); setDetail(null); }}
            >
              {detail.stock <= 0 ? 'غير متوفر' : 'أضف للسلة'}
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setDetail(null)}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}
