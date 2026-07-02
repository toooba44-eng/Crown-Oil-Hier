import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const scope = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.manifesto-word',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.03,
          scrollTrigger: { trigger: scope.current, start: 'top 65%' },
        }
      );
      gsap.to('.philosophy-bg', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  const line1 = 'Most hair care focuses on quick fixes and synthetic silicones.';
  const line2 = 'We focus on root biology, patience, and three oils working as one.';

  return (
    <section id="philosophy" ref={scope} className="relative bg-void py-28 md:py-40 px-6 md:px-10 overflow-hidden">
      <div className="philosophy-bg absolute inset-0 opacity-20">
        <img src="/assets/hero-detail.jpg" alt="" className="w-full h-full object-cover scale-110" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void/90 to-void" />

      <div className="relative max-w-3xl mx-auto text-center">
        <p className="font-jakarta text-ghost/45 text-base md:text-lg leading-relaxed mb-8">
          {line1.split(' ').map((w, i) => (
            <span key={i} className="manifesto-word inline-block mr-[0.3em]">
              {w}
            </span>
          ))}
        </p>
        <p className="font-garamond italic text-[clamp(1.8rem,5vw,3.2rem)] leading-[1.15] text-ghost">
          {line2.split(' ').map((w, i) => {
            const isKeyword = w.toLowerCase().includes('root') || w.toLowerCase().includes('biology,');
            return (
              <span
                key={i}
                className={`manifesto-word inline-block mr-[0.28em] ${isKeyword ? 'text-clay text-glow-plasma' : ''}`}
              >
                {w}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}
