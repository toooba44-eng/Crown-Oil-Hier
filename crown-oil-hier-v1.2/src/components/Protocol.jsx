import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RotatingRings from './protocol/RotatingRings.jsx';
import ScanGrid from './protocol/ScanGrid.jsx';
import Waveform from './protocol/Waveform.jsx';
import { useLang } from '../i18n.jsx';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: '01', key: 'step1', Visual: RotatingRings },
  { n: '02', key: 'step2', Visual: ScanGrid },
  { n: '03', key: 'step3', Visual: Waveform },
];

export default function Protocol() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardRefs.current;

      cards.forEach((card) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top top',
          pin: true,
          pinSpacing: false,
        });
      });

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.92,
          filter: 'blur(20px)',
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" ref={sectionRef} className="relative bg-void">
      {STEPS.map((step, i) => (
        <div
          key={step.n}
          ref={(el) => (cardRefs.current[i] = el)}
          className="h-[100dvh] min-h-[560px] flex items-center justify-center px-6 md:px-10 bg-void"
        >
          <div className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="font-code text-plasma text-sm tracking-widest">{step.n} / 03</span>
              <h3 className="font-sora font-bold text-ghost text-[clamp(2rem,5vw,3.5rem)] mt-3 tracking-tight">
                {t(`proto.${step.key}t`)}
              </h3>
              <p className="font-instrument italic text-ghost/60 text-lg md:text-xl mt-5 max-w-md leading-relaxed">
                {t(`proto.${step.key}d`)}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <step.Visual />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
