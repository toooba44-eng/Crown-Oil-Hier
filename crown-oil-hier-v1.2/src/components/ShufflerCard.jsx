import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { useLang } from '../i18n.jsx';

export default function ShufflerCard() {
  const { t } = useLang();
  const ITEMS = [
    { name: t('shuffler.item1'), note: t('shuffler.item1n') },
    { name: t('shuffler.item2'), note: t('shuffler.item2n') },
    { name: t('shuffler.item3'), note: t('shuffler.item3n') },
  ];
  const [order, setOrder] = useState([0, 1, 2]);

  useEffect(() => {
    const id = setInterval(() => {
      setOrder((prev) => {
        const next = [...prev];
        next.unshift(next.pop());
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-cream dark:bg-charcoal rounded-2xl border border-charcoal/10 dark:border-ghost/10 shadow-xl shadow-charcoal/5 dark:shadow-black/40 p-7 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <Leaf size={16} className="text-moss" />
        <h3 className="font-jakarta font-bold text-lg text-charcoal dark:text-ghost">{t('shuffler.title')}</h3>
      </div>
      <p className="text-sm text-charcoal/60 dark:text-ghost/60 font-jakarta mb-6">
        {t('shuffler.sub')}
      </p>

      <div className="relative h-40 flex-1">
        {order.map((itemIdx, pos) => {
          const item = ITEMS[itemIdx];
          const styles = [
            { zIndex: 30, transform: 'translateY(0px) scale(1)', opacity: 1 },
            { zIndex: 20, transform: 'translateY(14px) scale(0.94)', opacity: 0.6 },
            { zIndex: 10, transform: 'translateY(26px) scale(0.88)', opacity: 0.3 },
          ][pos];
          return (
            <div
              key={itemIdx}
              style={{ ...styles, transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              className="absolute inset-x-0 top-0 rounded-2xl border border-charcoal/10 dark:border-ghost/10 bg-white dark:bg-void px-5 py-4 transition-all duration-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-jakarta font-semibold text-charcoal dark:text-ghost">{item.name}</span>
                <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-moss/10 dark:bg-plasma/15 text-moss dark:text-plasma">
                  0{itemIdx + 1}
                </span>
              </div>
              <p className="font-mono text-xs text-charcoal/50 dark:text-ghost/50 mt-1">{item.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
