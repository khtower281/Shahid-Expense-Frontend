import { useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';

const TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/categories': 'Categories'
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Shahid Expense';

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: menu + title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              {title}
            </h1>
            <p className="hidden sm:block text-[11px] text-slate-400">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Right: user */}
        <UserMenu />
      </div>
    </header>
  );
}