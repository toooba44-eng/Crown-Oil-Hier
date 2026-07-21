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

function ResultSlide({ r, ariaHidden }) {
  return (
    <figure className="result-slide" aria-hidden={ariaHidden || undefined}>
      {r.image ? (
        <div className="result-frame">
          <img src={r.image} alt="نتيجة قبل وبعد استخدام الزيت" />
        </div>
      ) : (
        <div className="result-frame">
          <div className="result-pair">
            <div className="result-img"><span className="result-tag after">بعد</span><img src={r.after} alt="بعد الاستخدام" /></div>
            <div className="result-img"><span className="result-tag">قبل</span><img src={r.before} alt="قبل الاستخدام" /></div>
          </div>
        </div>
      )}
      {(r.weeks || r.caption) && (
        <figcaption className="result-cap">
          {r.weeks ? <span className="result-weeks">النتيجة بعد {r.weeks} أسابيع</span> : null}
          {r.caption ? <span className="result-name">{r.caption}</span> : null}
        </figcaption>
      )}
    </figure>
  );
}

export default function Store({ products, results = [], onAdd }) {
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
                <ResultSlide key={r.id + '-' + idx} r={r} ariaHidden={idx >= results.length} />
              ))}
            </div>
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
