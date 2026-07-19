import { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';

const MESSAGES = [
  'Initializing follicle scan…',
  'Week 1: absorption rate nominal.',
  'Week 4: +12% visible thickness detected.',
  'Week 8: root strength stabilized.',
  'Week 12: shine index at peak.',
];

export default function TypewriterCard() {
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState('');
  const msgIndex = useRef(0);
  const charIndex = useRef(0);

  useEffect(() => {
    const tick = setInterval(() => {
      const msg = MESSAGES[msgIndex.current];
      if (charIndex.current < msg.length) {
        charIndex.current += 1;
        setCurrent(msg.slice(0, charIndex.current));
      } else {
        setLines((prev) => [...prev.slice(-3), msg]);
        setCurrent('');
        charIndex.current = 0;
        msgIndex.current = (msgIndex.current + 1) % MESSAGES.length;
      }
    }, 38);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="bg-void rounded-2xl border border-plasma/20 shadow-plasma p-7 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-plasma opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-plasma" />
        </span>
        <h3 className="font-sora font-semibold text-sm tracking-wide text-ghost">Live Feed</h3>
        <Activity size={14} className="text-plasma ml-auto" />
      </div>

      <div className="flex-1 font-code text-xs text-ghost/50 space-y-1.5 overflow-hidden">
        {lines.map((l, i) => (
          <p key={i} className="truncate">
            <span className="text-plasma/70">›</span> {l}
          </p>
        ))}
        <p className="text-ghost">
          <span className="text-plasma">›</span> {current}
          <span className="inline-block w-[7px] h-[13px] bg-plasma ml-0.5 align-middle animate-pulse" />
        </p>
      </div>
    </div>
  );
}
