const NAV_COLUMNS = [
  {
    title: 'Product',
    links: ['Ingredients', 'The Ritual', 'Results'],
  },
  {
    title: 'Company',
    links: ['Our Story', 'Contact', 'Instagram'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service'],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal rounded-t-5xl px-6 md:px-10 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[1.4fr_repeat(3,1fr)] gap-10 pb-14 border-b border-ghost/10">
          <div>
            <p className="font-jakarta font-extrabold text-2xl text-ghost">
              Crown<span className="text-clay">.</span>
            </p>
            <p className="font-garamond italic text-ghost/50 text-lg mt-3 max-w-[220px]">
              Root science. Ritual results.
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
          <p className="font-jakarta text-xs text-ghost/40">© {new Date().getFullYear()} Crown Hair Oil. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-moss" />
            </span>
            <span className="font-mono text-[11px] tracking-widest uppercase text-ghost/40">
              System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
