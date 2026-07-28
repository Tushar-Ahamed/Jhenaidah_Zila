import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS, ORG_INFO } from '@/data/sampleData';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { classNames } from '@/utils/format';

export function Navbar() {
  const scrolled = useScrollPosition(12);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header
      className={classNames(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass-strong shadow-soft border-b border-white/30 dark:border-white/10'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16" aria-label="প্রধান নেভিগেশন">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="হোম পৃষ্ঠা">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-bd-gradient text-white font-bold text-lg shadow-glow" aria-hidden="true">
            ঝি
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{ORG_INFO.name}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{ORG_INFO.university}</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                classNames(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-bd-green-700 dark:text-bd-green-300 bg-bd-green-50 dark:bg-bd-green-900/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-bd-green-700 dark:hover:text-bd-green-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="hidden sm:inline-flex btn-primary !px-3.5 !py-2">
              <LayoutDashboard className="h-4 w-4" /> ড্যাশবোর্ড
            </Link>
          ) : (
            <Link to="/login" className="hidden sm:inline-flex btn-primary !px-3.5 !py-2">
              <LogIn className="h-4 w-4" /> লগইন
            </Link>
          )}
          <button
            onClick={() => setOpen((p) => !p)}
            aria-label={open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="lg:hidden grid h-9 w-9 place-items-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden glass-strong border-t border-white/30 dark:border-white/10"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    classNames(
                      'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-bd-green-700 dark:text-bd-green-300 bg-bd-green-50 dark:bg-bd-green-900/30'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                {user ? (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-primary w-full mt-2">
                    <LayoutDashboard className="h-4 w-4" /> ড্যাশবোর্ড
                  </Link>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-primary w-full mt-2">
                    <LogIn className="h-4 w-4" /> লগইন
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


