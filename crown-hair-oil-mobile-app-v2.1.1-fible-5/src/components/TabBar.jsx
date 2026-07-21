const TABS = [
  {
    id: 'home', key: 'tab.home',
    icon: <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    id: 'store', key: 'tab.store',
    icon: <path d="M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9zM8 10V6a4 4 0 0 1 8 0v4" />,
  },
  {
    id: 'cart', key: 'tab.cart',
    icon: <path d="M3 4h2l2.5 12.5a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 8H6.2M9.5 21.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />,
  },
  {
    id: 'admin', key: 'tab.admin',
    icon: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v3M12 18.2v3M21.2 12h-3M5.8 12h-3M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1M18.5 18.5l-2.1-2.1M7.6 7.6 5.5 5.5" /></>,
  },
];

export default function TabBar({ tab, count, onChange, t }) {
  return (
    <nav className="tab-bar" aria-label={t('a11y.nav')}>
      {TABS.map((item) => (
        <button
          key={item.id}
          className={'tab-btn' + (tab === item.id ? ' active' : '')}
          onClick={() => onChange(item.id)}
          aria-current={tab === item.id ? 'page' : undefined}
        >
          <span className="tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
            {item.id === 'cart' && count > 0 && <span className="tab-badge">{count}</span>}
          </span>
          <span className="tab-label">{t(item.key)}</span>
        </button>
      ))}
    </nav>
  );
}
