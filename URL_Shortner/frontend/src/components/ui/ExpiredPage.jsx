import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function ExpiredPage({ onGoHome }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-base)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" aria-hidden="true">
              <path fill="currentColor" d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z" />
              <path fill="currentColor" d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z" />
            </svg>
          </span>
          <span className="text-base font-bold text-[var(--text-primary)]">Shortly</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-muted)]">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 12a6 6 0 0 0-6-6H6a6 6 0 0 0-6 6v3a3 3 0 0 0 3 3h3" />
              <path d="M24 12a6 6 0 0 0-6-6h-2" />
              <line x1="6" y1="12" x2="6" y2="18" />
              <line x1="10" y1="12" x2="10" y2="18" />
              <line x1="16" y1="6" x2="16" y2="12" />
              <circle cx="6" cy="18" r="1" fill="currentColor" />
              <circle cx="10" cy="18" r="1" fill="currentColor" />
            </svg>
          </div>

          <p className="mb-2 font-[family-name:var(--font-doodle)] text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
            Error 404
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Link expired or not found</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
            The requested short URL is invalid, expired, or has reached its active lifetime cap.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              onClick={onGoHome}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Go to Home
            </Link>
            <a
              href="mailto:support@shortly.dev"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--bg-muted)]"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] px-5 py-6 text-center text-xs text-[var(--text-muted)]">
        Copyright 2026 Shortly. Built for sharing.
      </footer>
    </div>
  )
}
