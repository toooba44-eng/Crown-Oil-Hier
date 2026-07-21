import { money } from '../lib/store.js';

const DEFAULT_TAGLINE = 'مزيج زيوت طبيعية 100٪';

export default function Home({ settings = {}, lang = 'ar', t, onShop }) {
  const benefits = [
    { icon: '🌿', title: t('home.benefit1.t'), desc: t('home.benefit1.d') },
    { icon: '📏', title: t('home.benefit2.t'), desc: t('home.benefit2.d') },
    { icon: '✨', title: t('home.benefit3.t'), desc: t('home.benefit3.d') },
    { icon: '📆', title: t('home.benefit4.t'), desc: t('home.benefit4.d') },
  ];
  // Show the admin's custom tagline as entered; fall back to the localized default.
  const tagline = settings.tagline && settings.tagline !== DEFAULT_TAGLINE
    ? settings.tagline
    : t('home.eyebrow');
  const freeOver = settings.freeShipOver ?? 200;

  return (
    <div className="screen home-screen">
      <div className="home-hero">
        <img src="assets/hero-light-crop.jpg" alt="Crown Hair Oil" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <img className="home-logo" src="assets/logo.jpg" alt="" />
          <p className="home-eyebrow">{tagline}</p>
          <h1>{t('home.title')}</h1>
          <p className="home-sub">{t('home.sub')}</p>
          <button className="btn btn-primary" onClick={onShop}>{t('home.shop')}</button>
        </div>
      </div>

      <section className="home-section">
        <h2>{t('home.why')}</h2>
        <div className="benefit-list">
          {benefits.map((b) => (
            <div className="benefit-item" key={b.title}>
              <span className="benefit-icon" aria-hidden="true">{b.icon}</span>
              <div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2>{t('home.how')}</h2>
        <ol className="steps-list">
          <li><b>{lang === 'en' ? '1' : '١'}</b> {t('home.step1')}</li>
          <li><b>{lang === 'en' ? '2' : '٢'}</b> {t('home.step2')}</li>
          <li><b>{lang === 'en' ? '3' : '٣'}</b> {t('home.step3')}</li>
        </ol>
      </section>

      <section className="home-cta">
        <img src="assets/hero-dark-crop.jpg" alt="" />
        <div>
          <h2>{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaSub', { money: money(freeOver) })}</p>
          <button className="btn btn-light" onClick={onShop}>{t('home.ctaBtn')}</button>
        </div>
      </section>
    </div>
  );
}
