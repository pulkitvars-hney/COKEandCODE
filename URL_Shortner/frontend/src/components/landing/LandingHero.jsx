import { Link } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'
import Button from '../ui/Button'
import Card from '../ui/Card'
import PricingSection from './PricingSection'

const benefits = [
  {
    title: 'Paste & Shorten',
    description: 'Drop any long URL into your studio. Shortly generates a clean, compact code name in milliseconds, keeping your destination neat and shareable.',
  },
  {
    title: 'Personalize Alias',
    description: 'Add a custom alias to make your shares recognizable. Choose lowercase letters, numbers, or hyphens that match your brand identity.',
  },
  {
    title: 'See the Story',
    description: 'Inspect your click timeline, browser sources, devices, and visitor locations directly inside your dashboard.',
  },
]

export default function LandingHero() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-base font-bold text-[var(--text-primary)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path fill="currentColor" d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z" />
              <path fill="currentColor" d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z" />
            </svg>
          </span>
          Shortly
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-5 text-sm text-[var(--text-secondary)] md:flex" aria-label="Landing navigation">
            <a href="#product" className="hover:text-[var(--text-primary)]">Product</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)]">Pricing</a>
          </nav>
          <ThemeToggle className="h-8 w-8" />
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Link management</p>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Make every link pull its weight.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--text-secondary)]">
              Create a clean destination, share it anywhere, and see the story behind every click in one focused workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/signup">
                <Button variant="primary" size="lg">Start for free</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">Log in</Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">How it works</p>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Three steps to link clarity.</h2>
            <p className="mt-3 text-[var(--text-secondary)]">Shortly is designed for speed, clarity, and focus.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={benefit.title} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-muted)] text-sm font-semibold text-[var(--accent)]">
                    {index + 1}
                  </span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">0{index + 1}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <PricingSection />

        <section className="border-t border-[var(--border)] px-5 py-12 text-center sm:px-8">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Ready when you are.</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-[var(--text-secondary)]">
            Create an account to make your first short link, then manage clicks, aliases, and your subscription.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button variant="primary">Create free account</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Log in</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] px-5 py-6 text-center text-xs text-[var(--text-muted)]">
        Copyright 2026 Shortly. Built for sharing.
      </footer>
    </div>
  )
}
