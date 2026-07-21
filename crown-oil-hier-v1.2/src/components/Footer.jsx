import { useLang } from '../i18n.jsx';

export default function Footer() {
  const { t } = useLang();

  const NAV_COLUMNS = [
    { title: t('footer.col1'), links: [t('footer.col1a'), t('footer.col1b'), t('footer.col1c')] },
    { title: t('footer.col2'), links: [t('footer.col2a'), t('footer.col2b'), t('footer.col2c')] },
    { title: t('footer.col3'), links: [t('footer.col3a'), t('footer.col3b')] },
  ];

  return (
    <footer className="bg-charcoal rounded-t-5xl px-6 md:px-10 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[1.4fr_repeat(3,1fr)] gap-10 pb-14 border-b border-ghost/10">
          <div>
            <p className="font-jakarta font-extrabold text-2xl text-ghost">
              Crown<span className="text-clay">.</span>
            </p>
            <p className="font-garamond italic text-ghost/50 text-lg mt-3 max-w-[220px]">
              {t('footer.tagline')}
            </p>
          </div>

          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-ghost/40 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="lift-hover inline-block font-jakarta text-sm text-ghost/70">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-7">
          <p className="font-jakarta text-xs text-ghost/40">© {new Date().getFullYear()} Crown Hair Oil. {t('footer.rights')}</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-moss" />
            </span>
            <span className="font-mono text-[11px] tracking-widest uppercase text-ghost/40">
              {t('footer.status')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
