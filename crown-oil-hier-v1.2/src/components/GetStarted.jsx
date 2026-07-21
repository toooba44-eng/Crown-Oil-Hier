import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ShieldCheck, Truck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function GetStarted() {
  const scope = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.start-reveal',
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: scope.current, start: 'top 70%' },
        }
      );
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section id="start" ref={scope} className="bg-cream dark:bg-void py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-5xl mx-auto rounded-4xl bg-moss overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-plasma/20 blur-3xl" />
        <div className="relative grid md:grid-cols-2 items-center gap-10 p-8 md:p-16">
          <div>
            <p className="start-reveal font-mono text-xs tracking-[0.3em] uppercase text-ghost/60 mb-5">
              Begin the Ritual
            </p>
            <h2 className="start-reveal font-jakarta font-extrabold text-ghost text-[clamp(1.9rem,4.5vw,3.2rem)] leading-tight tracking-tight">
              Ready for
              <span className="font-garamond italic font-medium text-clay"> visible </span>
              results?
            </h2>
            <p className="start-reveal mt-5 text-ghost/70 font-jakarta max-w-sm leading-relaxed">
              One bottle. Three botanical oils. A protocol your roots will recognize in four weeks.
            </p>

            <div className="start-reveal mt-8 flex items-baseline gap-3">
              <span className="font-jakarta font-extrabold text-ghost text-3xl">119 SAR</span>
              <span className="font-jakarta text-ghost/40 line-through text-sm">149 SAR</span>
            </div>

            <a
              href="#"
              className="start-reveal btn-magnetic mt-7 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold font-jakarta bg-clay text-ghost shadow-clay"
            >
              <span className="btn-bg bg-plasma" />
              <span className="relative z-10 flex items-center gap-2">
                Order Your Bottle <ArrowUpRight size={16} />
              </span>
            </a>

            <div className="start-reveal mt-8 flex flex-wrap gap-6 text-ghost/60 text-xs font-mono">
              <span className="flex items-center gap-1.5"><Truck size={14} /> Free shipping over 200 SAR</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> 100% natural formula</span>
            </div>
          </div>

          <div className="start-reveal relative rounded-3xl overflow-hidden aspect-[4/5] md:aspect-auto md:h-full">
            <img
              src={import.meta.env.BASE_URL + 'assets/hero-light-crop.jpg'}
              alt="Crown Hair Oil bottle among rosemary and olive branches"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
