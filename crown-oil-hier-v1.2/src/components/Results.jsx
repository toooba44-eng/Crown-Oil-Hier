import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '../i18n.jsx';

gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;

// Genuine customer before/after composites (frame recolored per theme:
// white in light mode, black in dark mode). Captions are real testimonials
// and stay in their original language.
const RESULTS = [
  { id: 'r-1', light: 'assets/results/result-1-light.jpg', dark: 'assets/results/result-1-dark.jpg', name: 'نورة — الرياض', comment: 'لاحظت الفرق على بنتي فعلاً' },
  { id: 'r-2', light: 'assets/results/result-2-light.jpg', dark: 'assets/results/result-2-dark.jpg', name: 'أحمد — الرياض', comment: 'كثافة أوضح خلال 6 أسابيع' },
  { id: 'r-3', light: 'assets/results/result-3-light.jpg', dark: 'assets/results/result-3-dark.jpg', name: 'منى — جدة', comment: 'رجعت فراغات الشعر تنمو من جديد بعد استخدام شهرين' },
  { id: 'r-4', light: 'assets/results/result-4-light.jpg', dark: 'assets/results/result-4-dark.jpg', name: 'سعيد — المدينة المنورة', comment: 'تحسّنت فروة الرأس جداً وبدأ شعري ينمو من جديد' },
  { id: 'r-5', light: 'assets/results/result-5-light.jpg', dark: 'assets/results/result-5-dark.jpg', name: 'منار — الرياض', comment: 'ليست أول تجربة لي مع الزيوت، لكن أقدر أقول إنها أفضل تجربة وفعّالة جداً' },
];

function Slide({ r, ariaHidden }) {
  return (
    <figure className="v12-result-slide" aria-hidden={ariaHidden || undefined}>
      <div className="v12-result-frame">
        <img className="v12-res-light" src={BASE + r.light} alt="Crown Hair Oil — before and after" loading="eager" />
        <img className="v12-res-dark" src={BASE + r.dark} alt="" loading="eager" />
      </div>
      <figcaption className="v12-result-cap" dir="rtl">
        <span className="v12-result-name">{r.name}</span>
        <span className="v12-result-comment">”{r.comment}“</span>
      </figcaption>
    </figure>
  );
}

export default function Results() {
  const { t } = useLang();
  const scope = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.v12-results-head',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: scope.current, start: 'top 78%' } }
      );
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section id="results" ref={scope} className="bg-cream dark:bg-void py-24 md:py-32 overflow-hidden">
      <div className="v12-results-head max-w-6xl mx-auto px-6 md:px-10 mb-14">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-clay mb-4">{t('results.eyebrow')}</p>
        <h2 className="font-jakarta font-extrabold text-charcoal dark:text-ghost text-[clamp(1.8rem,4vw,2.75rem)] tracking-tight">
          {t('results.h')}
        </h2>
        <p className="mt-4 max-w-md font-jakarta text-charcoal/60 dark:text-ghost/60 text-base leading-relaxed">
          {t('results.sub')}
        </p>
      </div>

      <div className="v12-results-viewport">
        <div className="v12-results-track">
          {RESULTS.map((r) => <Slide key={r.id} r={r} />)}
          {RESULTS.map((r) => <Slide key={r.id + '-dup'} r={r} ariaHidden />)}
        </div>
      </div>
    </section>
  );
}
