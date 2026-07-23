import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLang } from '../i18n.jsx';
import { orderHref } from '../orderLink.js';

export default function Hero() {
  const { t } = useLang();
  const scope = useRef(null);
  const orderTo = orderHref();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.hero-eyebrow', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.1)
        .fromTo('.hero-line-1', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.25)
        .fromTo('.hero-line-2', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0.4)
        .fromTo('.hero-sub', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.6)
        .fromTo('.hero-cta', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.75);

      gsap.to('.hero-media img', {
        scale: 1.08,
        duration: 8,
        ease: 'power1.inOut',
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" ref={scope} className="relative h-[100dvh] min-h-[640px] flex items-end overflow-hidden">
      <div id="hero-sentinel" className="absolute top-0 h-1 w-1" />

      <div className="hero-media absolute inset-0 z-0 overflow-hidden">
        <img
          src={import.meta.env.BASE_URL + 'assets/hero-dark.jpg'}
          alt="Crown Hair Oil bottle in botanical light"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-moss/50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full px-6 md:px-10 pb-24 md:pb-28">
        <div className="max-w-xl">
          <p className="hero-eyebrow font-mono text-xs tracking-[0.3em] uppercase text-plasma text-glow-plasma mb-5">
            {t('hero.eyebrow')}
          </p>
          <h1 className="leading-[0.95]">
            <span className="hero-line-1 block font-jakarta font-extrabold text-ghost text-[clamp(2.2rem,6vw,3.6rem)] tracking-tight">
              {t('hero.line1')}
            </span>
            <span className="hero-line-2 block font-garamond italic font-medium text-clay text-[clamp(4rem,13vw,8.5rem)] -mt-2">
              {t('hero.line2')}
            </span>
          </h1>
          <p className="hero-sub mt-6 max-w-md font-jakarta text-ghost/85 text-base md:text-lg leading-relaxed">
            {t('hero.sub')}
          </p>
          <div className="hero-cta mt-9 flex flex-wrap items-center gap-4">
            <a
              href={orderTo}
              className="btn-magnetic inline-flex items-center rounded-full px-7 py-3.5 text-sm font-semibold font-jakarta bg-clay text-ghost shadow-clay"
            >
              <span className="btn-bg bg-plasma" />
              <span className="relative z-10">{t('hero.order')}</span>
            </a>
            <a href="#features" className="lift-hover inline-flex items-center gap-2 font-jakarta text-sm font-medium text-ghost/90 border-b border-ghost/40 pb-1">
              {t('hero.formula')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
