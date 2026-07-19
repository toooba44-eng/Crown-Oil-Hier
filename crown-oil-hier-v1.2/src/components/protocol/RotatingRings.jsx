import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function RotatingRings() {
  const outer = useRef(null);
  const inner = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(outer.current, { rotate: 360, duration: 30, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      gsap.to(inner.current, { rotate: -360, duration: 20, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    });
    return () => ctx.revert();
  }, []);

  return (
    <svg viewBox="0 0 300 300" className="w-56 h-56 md:w-72 md:h-72">
      <g ref={outer} opacity="0.7">
        <circle cx="150" cy="150" r="130" fill="none" stroke="#7B61FF" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 10" />
        <circle cx="150" cy="150" r="130" fill="none" stroke="#CC5833" strokeWidth="1.5" strokeDasharray="6 250" strokeLinecap="round" />
      </g>
      <g ref={inner}>
        <circle cx="150" cy="150" r="90" fill="none" stroke="#F0EFF4" strokeOpacity="0.15" strokeWidth="1" />
        <circle cx="150" cy="150" r="90" fill="none" stroke="#7B61FF" strokeWidth="2" strokeDasharray="4 180" strokeLinecap="round" />
      </g>
      <circle cx="150" cy="150" r="52" fill="none" stroke="#F0EFF4" strokeOpacity="0.2" strokeWidth="1" />
      <circle cx="150" cy="150" r="4" fill="#CC5833" />
    </svg>
  );
}
