import { useEffect, useRef, useState } from 'react';
import { CalendarCheck2, MousePointer2 } from 'lucide-react';
import { useLang } from '../i18n.jsx';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const TARGET_DAYS = [2, 5]; // Tuesday, Friday — the twice-weekly ritual

export default function SchedulerCard() {
  const { lang, t } = useLang();
  const days = lang === 'ar' ? DAYS_AR : DAYS;
  const wrapRef = useRef(null);
  const cursorRef = useRef(null);
  const cellRefs = useRef([]);
  const saveRef = useRef(null);
  const [active, setActive] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cursor = cursorRef.current;

    const moveTo = (el, duration = 0.6) =>
      new Promise((resolve) => {
        if (!el || !cursor) return resolve();
        const wrapBox = wrapRef.current.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        const x = box.left - wrapBox.left + box.width / 2 - 9;
        const y = box.top - wrapBox.top + box.height / 2 - 4;
        cursor.style.transition = `transform ${duration}s cubic-bezier(0.25,0.46,0.45,0.94)`;
        cursor.style.transform = `translate(${x}px, ${y}px)`;
        setTimeout(resolve, duration * 1000);
      });

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const press = async (el) => {
      if (!el) return;
      el.style.transition = 'transform 0.15s ease';
      el.style.transform = 'scale(0.93)';
      await wait(150);
      el.style.transform = 'scale(1)';
    };

    async function loop() {
      while (!cancelled) {
        setActive([]);
        setSaved(false);
        cursor.style.opacity = '0';
        await wait(400);
        cursor.style.opacity = '1';
        await moveTo(cellRefs.current[TARGET_DAYS[0]], 0.7);

        for (const dayIdx of TARGET_DAYS) {
          if (cancelled) return;
          await moveTo(cellRefs.current[dayIdx], 0.55);
          await press(cellRefs.current[dayIdx]);
          setActive((prev) => [...prev, dayIdx]);
          await wait(300);
        }

        await moveTo(saveRef.current, 0.6);
        await press(saveRef.current);
        setSaved(true);
        await wait(700);
        cursor.style.opacity = '0';
        await wait(900);
      }
    }
    loop();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-cream dark:bg-charcoal rounded-2xl border border-charcoal/10 dark:border-ghost/10 shadow-xl shadow-charcoal/5 dark:shadow-black/40 p-7 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <CalendarCheck2 size={16} className="text-clay" />
        <h3 className="font-jakarta font-bold text-lg text-charcoal dark:text-ghost">{t('sched.title')}</h3>
      </div>
      <p className="text-sm text-charcoal/60 dark:text-ghost/60 font-jakarta mb-6">
        {t('sched.sub')}
      </p>

      <div ref={wrapRef} className="relative flex-1">
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => (
            <div
              key={i}
              ref={(el) => (cellRefs.current[i] = el)}
              className={`aspect-square rounded-full flex items-center justify-center font-mono text-xs font-medium border transition-colors duration-300 ${
                active.includes(i)
                  ? 'bg-clay text-ghost border-clay'
                  : 'bg-white dark:bg-void text-charcoal/50 dark:text-ghost/50 border-charcoal/10 dark:border-ghost/10'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        <button
          ref={saveRef}
          type="button"
          tabIndex={-1}
          className={`mt-6 w-full rounded-full py-2.5 font-jakarta text-sm font-semibold transition-colors duration-300 ${
            saved ? 'bg-moss text-ghost' : 'bg-charcoal/5 dark:bg-ghost/10 text-charcoal/40 dark:text-ghost/40'
          }`}
        >
          {saved ? t('sched.saved') : t('sched.save')}
        </button>

        <div
          ref={cursorRef}
          className="absolute top-0 left-0 z-20 pointer-events-none opacity-0"
          style={{ transform: 'translate(0px,0px)' }}
        >
          <MousePointer2 size={18} className="text-void drop-shadow-md" fill="white" />
        </div>
      </div>
    </div>
  );
}
