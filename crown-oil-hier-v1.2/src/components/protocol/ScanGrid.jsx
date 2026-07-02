import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ROWS = 8;
const COLS = 12;

export default function ScanGrid() {
  const lineRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { top: '0%' },
        { top: '100%', duration: 2.6, repeat: -1, ease: 'sine.inOut', yoyo: true }
      );
    }, boxRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={boxRef} className="relative w-64 h-48 md:w-80 md:h-56 rounded-2xl overflow-hidden border border-plasma/20">
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-ghost/25" />
          </div>
        ))}
      </div>
      <div
        ref={lineRef}
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #7B61FF, transparent)',
          boxShadow: '0 0 16px 2px rgba(123,97,255,0.8)',
        }}
      />
    </div>
  );
}
