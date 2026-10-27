import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Shorten link', to: '/dashboard#shorten' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Subscription', to: '/subscription' },
]

export default function TopBar({ user, onLogout, loggingOut }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (!menuOpen) return undefined
    const close = (event) => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 shadow-sm shadow-[var(--text-primary)]/5 backdrop-blur-xl">
      <div className="relative mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <NavLink to="/dashboard" className="shrink-0 text-base font-bold tracking-tight text-[var(--text-primary)]">Shortly</NavLink>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="Workspace navigation">
          {navItems.map((item) => <NavLink key={item.label} to={item.to} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${`${location.pathname}${location.hash}` === item.to ? 'bg-[var(--accent-muted)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`}>{item.label}</NavLink>)}
        </nav>
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 md:hidden" aria-label="Workspace navigation">
          {navItems.map((item) => <NavLink key={item.label} to={item.to} className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">{item.label}</NavLink>)}
        </nav>
        <div className="relative shrink-0">
          <button ref={buttonRef} type="button" onClick={() => setMenuOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]" aria-expanded={menuOpen} aria-haspopup="menu">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">{user?.username?.[0]?.toUpperCase() || '?'}</span>
            <span className="hidden sm:inline">@{user?.username}</span>
          </button>
          {menuOpen && <div ref={menuRef} className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-xl shadow-[var(--text-primary)]/10" role="menu">
            <p className="mb-1 border-b border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">@{user?.username}</p>
            {['Profile:/profile', 'Dashboard:/dashboard', 'Settings:/settings'].map((entry) => { const [label, to] = entry.split(':'); return <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]" role="menuitem">{label}</NavLink> })}
            <div className="mt-1 border-t border-[var(--border)] pt-1">
              <button type="button" onClick={onLogout} disabled={loggingOut} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger-muted)] disabled:cursor-not-allowed disabled:opacity-60" role="menuitem">{loggingOut ? 'Logging out…' : 'Log out'}</button>
            </div>
          </div>}
        </div>
      </div>
    </header>
  )
}
