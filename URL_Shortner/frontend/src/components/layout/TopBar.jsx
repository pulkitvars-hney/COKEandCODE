import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

export default function TopBar({ user, onLogout, loggingOut, onToggleSidebar }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()

  const close = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        close()
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        close()
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen, close])

  const navigateAndClose = (path) => {
    close()
    navigate(path)
  }

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'M4 6h16M4 12h16M4 18h7' },
    { label: 'Subscription', path: '/subscription', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center border-b border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-xl px-4 sm:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          aria-label="Toggle sidebar"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-sm font-bold text-[var(--text-primary)]">Shortly</span>
      </div>

      <div className="hidden lg:block" />

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
                {user.username?.[0]?.toUpperCase() || '?'}
              </span>
              <span className="hidden text-xs sm:inline">@{user.username}</span>
              <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className="glass-strong absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--border)] p-1.5 shadow-xl shadow-black/10 dark:shadow-black/30"
                role="menu"
                aria-label="Account menu"
              >
                {/* user identity */}
                <div className="border-b border-[var(--border)] px-3 py-2.5 mb-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">@{user.username}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Account</p>
                </div>

                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigateAndClose(item.path)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    role="menuitem"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                ))}

                <div className="my-1 border-t border-[var(--border)]" />

                <button
                  type="button"
                  onClick={() => { close(); onLogout() }}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-muted)] disabled:opacity-50"
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
