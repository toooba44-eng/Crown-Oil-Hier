import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const PATH = 'M0,60 L60,60 L80,60 L95,20 L115,100 L135,60 L160,60 L175,40 L190,60 L400,60';

export default function Waveform() {
  const pathRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 2.2,
        repeat: -1,
        ease: 'power1.inOut',
      });
      gsap.to(dotRef.current, {
        opacity: 0.3,
        scale: 1.6,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: '50% 50%',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <svg viewBox="0 0 400 120" className="w-72 h-24 md:w-96 md:h-28">
      <line x1="0" y1="60" x2="400" y2="60" stroke="#F0EFF4" strokeOpacity="0.08" strokeWidth="1" />
      <path ref={pathRef} d={PATH} fill="none" stroke="#CC5833" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle ref={dotRef} cx="115" cy="100" r="5" fill="#7B61FF" />
    </svg>
  );
}
