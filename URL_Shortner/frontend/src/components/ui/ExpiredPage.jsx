import ThemeToggle from './ThemeToggle'

export default function ExpiredPage({ onGoHome }) {
  return (
    <div className="page-bg min-h-screen flex flex-col justify-between p-5 sm:p-8">
      <header className="landing-nav mx-auto w-full max-w-6xl flex items-center justify-between py-4 border-b border-[var(--border)]">
        <a 
          href="/"
          onClick={(e) => {
            e.preventDefault()
            onGoHome?.()
          }}
          className="flex items-center gap-3 text-lg font-extrabold tracking-tight"
        >
          <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-black">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z"
              />
              <path
                fill="currentColor"
                d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z"
              />
            </svg>
          </span>
          shortly
        </a>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-lg card-neo rounded-[28px] p-8 text-center bg-[var(--bg-elevated)]">
          {/* Custom Neo-Brutalist Vector Illustration of Disconnected Plug */}
          <div className="mx-auto w-36 h-36 flex items-center justify-center bg-[var(--bg-muted)] border-2 border-[var(--text-primary)] rounded-full mb-8 shadow-neo-sm">
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 12a6 6 0 0 0-6-6H6a6 6 0 0 0-6 6v3a3 3 0 0 0 3 3h3" />
              <path d="M24 12a6 6 0 0 0-6-6h-2" />
              <line x1="6" y1="12" x2="6" y2="18" />
              <line x1="10" y1="12" x2="10" y2="18" />
              <line x1="16" y1="6" x2="16" y2="12" />
              <circle cx="6" cy="18" r="1" fill="currentColor" />
              <circle cx="10" cy="18" r="1" fill="currentColor" />
            </svg>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand font-mono">Error 404</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 mb-4">Link expired or not found</h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm mx-auto mb-8">
            The requested short URL is invalid, expired, or has reached its active lifetime cap. You can try the following links.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onGoHome}
              className="px-6 py-3 rounded-full text-sm font-bold btn-neo-primary"
            >
              Go to Home
            </button>
            <a
              href="mailto:support@shortly.dev"
              className="px-6 py-3 rounded-full text-sm font-bold border-2 border-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-md active:translate-x-0 active:translate-y-0 active:shadow-neo-sm transition-all text-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-6">
        Copyright 2026 shortly. Built for sharing.
      </footer>
    </div>
  )
}
