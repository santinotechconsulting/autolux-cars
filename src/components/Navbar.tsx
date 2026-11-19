import { Menu, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { prefetchRoute } from '../App';
import { useMarketplace } from '../context/MarketplaceContext';
import { AUTOLUX_LOGO } from '../data/inventory';

const NAV_LINKS = [
  { label: 'Cars for Sale', to: '/cars-for-sale' },
  { label: 'Sell Your Car', to: '/sell-your-car' },
  { label: 'Research', to: '/research' },
  { label: 'Financing', to: '/financing' },
  { label: 'Dealers', to: '/dealers' },
];

export function Navbar() {
  const { userProfile, messages } = useMarketplace();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark & Official Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg"
          aria-label="AutoLux USA Home"
        >
          <img
            src={AUTOLUX_LOGO}
            alt="AutoLux USA"
            width={64}
            height={36}
            className="h-9 w-16 rounded-md object-cover bg-slate-950"
            referrerPolicy="no-referrer"
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-950">
            AutoLux <span className="text-red-600">USA</span>
          </span>
        </Link>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary Navigation">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              className={({ isActive }) =>
                `relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive ? 'text-red-600 font-semibold' : 'text-slate-600 hover:text-slate-950'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-red-600 rounded-full"
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/dashboard"
            onMouseEnter={() => prefetchRoute('/dashboard')}
            onFocus={() => prefetchRoute('/dashboard')}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            <span>{userProfile.firstName}'s Dashboard</span>
            {unreadCount > 0 && (
              <span className="ml-0.5 font-mono text-xs tabular-nums text-red-300">({unreadCount})</span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-red-50 text-red-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <User className="h-4 w-4" />
                <span>My Dashboard {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
