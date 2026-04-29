import { useState, useCallback, useEffect } from 'react';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

interface Props {
  title?: string;
}

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

function isActive(pathname: string, href: string) {
  if (href === '/about') {
    return pathname === '/' || pathname === '/about' || pathname.startsWith('/about');
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export default function MobileHeader({ title = 'Jeremy' }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <div className="mtop md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 -ml-2 flex items-center justify-center"
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
        <div className="mtop-title">{title}</div>
        <div className="flex items-center gap-1 text-accent text-xs font-semibold">
          <span className="font-serif">文A</span>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="mobile-menu-overlay md:hidden" onClick={closeMenu} />
          <div className="mobile-menu md:hidden">
            <nav className="mobile-menu-nav">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`mobile-menu-item ${isActive(pathname, item.href) ? 'active' : ''}`}
                  onClick={closeMenu}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mobile-menu-actions">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </>
  );
}
