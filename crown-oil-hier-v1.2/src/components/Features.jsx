import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ShufflerCard from './ShufflerCard.jsx';
import TypewriterCard from './TypewriterCard.jsx';
import SchedulerCard from './SchedulerCard.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const scope = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feature-heading',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: scope.current, start: 'top 75%' },
        }
      );
      gsap.fromTo(
        '.feature-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: { trigger: '.feature-grid', start: 'top 80%' },
        }
      );
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={scope} className="bg-cream py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="feature-heading max-w-xl mb-16">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-clay mb-4">The Formula</p>
          <h2 className="font-jakarta font-extrabold text-charcoal text-[clamp(1.8rem,4vw,2.75rem)] tracking-tight">
            Three instruments,
            <span className="font-garamond italic font-medium text-moss"> one ritual.</span>
          </h2>
        </div>

        <div className="feature-grid grid md:grid-cols-3 gap-6">
          <div className="feature-card"><ShufflerCard /></div>
          <div className="feature-card"><TypewriterCard /></div>
          <div className="feature-card"><SchedulerCard /></div>
        </div>
      </div>
    </section>
  );
}
