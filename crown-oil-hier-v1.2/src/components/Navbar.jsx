import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '#features', label: 'Ritual' },
  { href: '#philosophy', label: 'Philosophy' },
  { href: '#protocol', label: 'Protocol' },
  { href: '#start', label: 'Order' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('crown_theme', theme); } catch { /* private mode */ }
  }, [theme]);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const target = document.querySelector('#hero-sentinel');
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: '-1px 0px 0px 0px', threshold: 0 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl rounded-full transition-all duration-500 ${
        scrolled
          ? 'bg-cream/70 dark:bg-void/70 backdrop-blur-xl border border-charcoal/10 dark:border-ghost/10 shadow-lg shadow-charcoal/5 dark:shadow-black/40'
          : 'bg-transparent border border-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-5 py-3 md:px-6">
        <a
          href="#top"
          className={`font-jakarta font-extrabold tracking-tight text-lg lift-hover ${
            scrolled ? 'text-charcoal dark:text-ghost' : 'text-ghost'
          }`}
        >
          Crown<span className="text-clay">.</span>
        </a>

        <ul className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`font-jakarta text-sm font-medium lift-hover inline-block ${
                  scrolled ? 'text-moss dark:text-ghost/80' : 'text-ghost/90'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="../"
          aria-label="Home"
          title="Home"
          className={`hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border lift-hover ${
            scrolled ? 'border-charcoal/15 dark:border-ghost/20 text-charcoal dark:text-ghost' : 'border-ghost/30 text-ghost'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </a>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border text-base lift-hover ${
            scrolled ? 'border-charcoal/15 dark:border-ghost/20 text-charcoal dark:text-ghost' : 'border-ghost/30 text-ghost'
          }`}
        >
          {theme === 'dark' ? '\u2600\uFE0F' : '\u{1F319}'}
        </button>
        <a
          href="#start"
          className="btn-magnetic hidden md:inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold font-jakarta bg-clay text-ghost"
        >
          <span className="btn-bg bg-moss" />
          <span className="relative z-10">Order Now</span>
        </a>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 ${
            scrolled ? 'text-charcoal dark:text-ghost' : 'text-ghost'
          }`}
        >
          <span className={`block h-[2px] w-full bg-current transition-transform duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block h-[2px] w-full bg-current transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-[2px] w-full bg-current transition-transform duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="md:hidden px-5 pb-5 pt-1 rounded-b-[2rem] bg-cream/95 dark:bg-void/95 backdrop-blur-xl">
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="../"
                className="flex items-center gap-2 py-2 font-jakarta text-base font-medium text-moss dark:text-ghost/85"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
                </svg>
                Home
              </a>
            </li>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-jakarta text-base font-medium text-moss dark:text-ghost/85"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="mt-1 inline-flex items-center gap-2 py-2 font-jakarta text-base font-medium text-moss dark:text-ghost/85"
              >
                {theme === 'dark' ? '\u2600\uFE0F Light mode' : '\u{1F319} Dark mode'}
              </button>
            </li>
            <li>
              <a
                href="#start"
                onClick={() => setOpen(false)}
                className="btn-magnetic mt-2 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold font-jakarta bg-clay text-ghost"
              >
                <span className="btn-bg bg-moss" />
                <span className="relative z-10">Order Now</span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
