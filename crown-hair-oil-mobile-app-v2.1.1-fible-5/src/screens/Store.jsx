import { useMemo, useState } from 'react';
import { money, pName, pDesc, productImages } from '../lib/store.js';

const ALL = '__all__';

function saleBadge(p, t) {
  if (!p.oldPrice || p.oldPrice <= p.price) return null;
  const pct = Math.round((1 - p.price / p.oldPrice) * 100);
  return <span className="sale-ribbon">{t('store.sale', { pct })}</span>;
}

function stockNote(stock, t) {
  if (stock <= 0) return <span className="stock-note out">{t('store.stockOut')}</span>;
  if (stock <= 5) return <span className="stock-note low">{t('store.stockLow', { n: stock })}</span>;
  return <span className="stock-note">{t('store.stockIn')}</span>;
}

/** Small thumbnail switcher shown under the main image when a product has >1 image. */
function ThumbStrip({ imgs, idx, onPick, t, className }) {
  if (imgs.length <= 1) return null;
  return (
    <div className={'thumb-strip' + (className ? ' ' + className : '')}>
      {imgs.map((src, i) => (
        <button
          key={i}
          type="button"
          className={'thumb-dot' + (i === idx ? ' active' : '')}
          aria-label={t('store.viewImage', { n: i + 1 })}
          aria-pressed={i === idx}
          onClick={(e) => { e.stopPropagation(); onPick(i); }}
        >
          <img src={src} alt="" />
        </button>
      ))}
    </div>
  );
}

function ProductCard({ p, lang, t, onAdd, onOpen }) {
  const imgs = productImages(p);
  const [active, setActive] = useState(0);
  const idx = Math.min(active, imgs.length - 1);
  return (
    <article className="product-card">
      <button className="product-thumb" onClick={() => onOpen(p)} aria-label={t('store.detailsOf', { name: pName(p, lang) })}>
        {saleBadge(p, t)}
        <img src={imgs[idx]} alt={pName(p, lang)} loading="lazy" />
      </button>
      <ThumbStrip imgs={imgs} idx={idx} onPick={setActive} t={t} />
      <div className="product-body">
        <h3>{pName(p, lang)}</h3>
        <div className="price-row">
          <span className="price">{money(p.price)}</span>
          {p.oldPrice ? <span className="price-old">{money(p.oldPrice)}</span> : null}
          {stockNote(p.stock, t)}
        </div>
        <button className="btn btn-primary btn-block" disabled={p.stock <= 0} onClick={() => onAdd(p.id)}>
          {p.stock <= 0 ? t('store.stockOut') : t('store.add')}
        </button>
      </div>
    </article>
  );
}

function DetailSheet({ p, lang, t, onAdd, onClose }) {
  const imgs = productImages(p);
  const [active, setActive] = useState(0);
  const idx = Math.min(active, imgs.length - 1);
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <img className="sheet-img" src={imgs[idx]} alt={pName(p, lang)} />
        <ThumbStrip imgs={imgs} idx={idx} onPick={setActive} t={t} className="sheet-thumbs" />
        <h2>{pName(p, lang)}</h2>
        <p className="sheet-desc">{pDesc(p, lang)}</p>
        <div className="price-row">
          <span className="price">{money(p.price)}</span>
          {p.oldPrice ? <span className="price-old">{money(p.oldPrice)}</span> : null}
          {stockNote(p.stock, t)}
        </div>
        <button
          className="btn btn-primary btn-block"
          disabled={p.stock <= 0}
          onClick={() => { onAdd(p.id); onClose(); }}
        >
          {p.stock <= 0 ? t('store.stockOut') : t('store.add')}
        </button>
        <button className="btn btn-ghost btn-block" onClick={onClose}>{t('store.close')}</button>
      </div>
    </div>
  );
}

function Stars({ rating, t }) {
  const n = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <span className="stars" aria-label={t('store.starsAria', { n })}>
      {'★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n)}
    </span>
  );
}

function ResultSlide({ r, theme, t, ariaHidden }) {
  const composite = r.imageLight ? (theme === 'dark' ? r.imageDark : r.imageLight) : r.image;
  return (
    <figure className="result-slide" aria-hidden={ariaHidden || undefined}>
      {composite ? (
        <div className="result-frame">
          <img src={composite} alt={t('store.resultAlt')} />
        </div>
      ) : (
        <div className="result-frame">
          <div className="result-pair">
            <div className="result-img"><span className="result-tag after">{t('store.after')}</span><img src={r.after} alt={t('store.afterAlt')} /></div>
            <div className="result-img"><span className="result-tag">{t('store.before')}</span><img src={r.before} alt={t('store.beforeAlt')} /></div>
          </div>
        </div>
      )}
      {(r.weeks || r.name || r.comment || r.caption) && (
        <figcaption className="result-cap">
          {r.weeks ? <span className="result-weeks">{t('store.resultWeeks', { n: r.weeks })}</span> : null}
          {(r.name || r.caption) ? <span className="result-name">{r.name || r.caption}</span> : null}
          {r.comment ? <span className="result-comment">”{r.comment}“</span> : null}
        </figcaption>
      )}
    </figure>
  );
}

export default function Store({ products, results = [], reviews = [], theme, lang = 'ar', t, onAdd }) {
  const [cat, setCat] = useState(ALL);
  const [detail, setDetail] = useState(null); // product shown in the bottom sheet

  const cats = useMemo(
    () => [ALL, ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );
  const catEn = useMemo(() => {
    const m = {};
    products.forEach((p) => { if (p.category) m[p.category] = p.categoryEn || p.category; });
    return m;
  }, [products]);
  const catLabel = (c) => (c === ALL ? t('store.all') : (lang === 'en' ? (catEn[c] || c) : c));
  const filtered = cat === ALL ? products : products.filter((p) => p.category === cat);

  return (
    <div className="screen store-screen">
      <header className="screen-head">
        <h1>{t('store.title')}</h1>
        <div className="chip-row">
          {cats.map((c) => (
            <button key={c} className={'chip' + (c === cat ? ' active' : '')} onClick={() => setCat(c)}>{catLabel(c)}</button>
          ))}
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="empty-state">{t('store.empty')}</div>
      ) : (
        <div className="product-list">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} lang={lang} t={t} onAdd={onAdd} onOpen={setDetail} />
          ))}
        </div>
      )}

      {results.length > 0 && (
        <section className="results-section">
          <div className="results-head">
            <h2>{t('store.results')}</h2>
            <p>{t('store.resultsSub')}</p>
          </div>
          <div className="results-viewport">
            <div className="results-track" style={{ '--result-count': results.length }}>
              {[...results, ...results].map((r, idx) => (
                <ResultSlide key={r.id + '-' + idx} r={r} theme={theme} t={t} ariaHidden={idx >= results.length} />
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="reviews-section">
          <div className="results-head">
            <h2>{t('store.reviews')}</h2>
            <p>{t('store.reviewsSub')}</p>
          </div>
          <div className="reviews-list">
            {reviews.map((rv) => (
              <article className="review-card" key={rv.id}>
                <div className="review-top">
                  <span className="review-avatar" aria-hidden="true">{(rv.name || '?').trim().charAt(0)}</span>
                  <div className="review-id">
                    <b>{rv.name || t('store.customer')}</b>
                    <Stars rating={rv.rating} t={t} />
                  </div>
                </div>
                <p className="review-comment">{rv.comment}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {detail && (
        <DetailSheet p={detail} lang={lang} t={t} onAdd={onAdd} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
