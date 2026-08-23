import AuthForm from '../auth/AuthForm'
import ThemeToggle from '../ui/ThemeToggle'
import ProductPreview from './ProductPreview'
import PricingSection from './PricingSection'

export default function LandingHero({ onAuthenticated }) {
  return (
    <div className="page-bg min-h-screen">
      <header className="landing-nav mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3 text-lg font-extrabold tracking-tight">
          <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-black"><LinkIcon /></span>
          shortly
        </a>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-5 text-sm font-semibold text-[var(--text-secondary)] md:flex" aria-label="Landing navigation">
            <a href="#product" className="hover:text-[var(--text-primary)]">Product</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)]">Pricing</a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="top">
        <section className="landing-hero mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="space-y-8">
            <div className="landing-announcement inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-glass)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]"><span className="h-2 w-2 rounded-full bg-brand" />Link management, simplified</div>
            <div className="space-y-5">
              <h1 className="max-w-xl text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Make every link<br /><span className="text-gradient">pull its weight.</span></h1>
              <p className="max-w-lg text-lg leading-relaxed text-[var(--text-secondary)]">Create a clean destination, share it anywhere, and see the story behind every click in one focused workspace.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#join" className="landing-primary-action">Start for free <span aria-hidden="true">→</span></a>
              <a href="#pricing" className="landing-secondary-action">View plans</a>
            </div>
          </div>
          <ProductPreview />
        </section>

        <section id="product" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="landing-eyebrow">How it works</p>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-gradient">Three steps to link clarity.</h2>
            <p className="mt-4 text-[var(--text-secondary)]">Shortly is designed for speed, clarity, and focus. Here is how your links pull their weight.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              ['Paste & Shorten', 'Drop any long URL into your studio. Shortly generates a clean, compact code name in milliseconds, keeping your destination neat and shareable.'],
              ['Personalize Alias', 'Add a custom alias to make your shares recognizable. Choose lowercase letters, numbers, or hyphens that match your brand identity perfectly.'],
              ['See the Story', 'Auditing traffic is live and simple. Inspect your click timeline, browser sources, devices, and visitor locations directly inside your dashboard.']
            ].map(([title, copy], index) => (
              <article key={title} className="landing-benefit-card bg-[var(--bg-elevated)] border-2 border-[var(--text-primary)] rounded-[24px] p-6 shadow-neo-md hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150">
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--text-primary)] bg-[var(--color-brand)] text-black font-extrabold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold font-mono">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <PricingSection />

        <section id="join" className="landing-join mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8">
          <div><p className="landing-eyebrow">Ready when you are</p><h2>Turn a long URL into a better next step.</h2><p>Create an account to make your first short link, then open the workspace to manage clicks, aliases, and your subscription.</p></div>
          <div className="animate-float lg:justify-self-end"><AuthForm onAuthenticated={onAuthenticated} /></div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] px-5 py-6 text-center text-xs text-[var(--text-muted)]">Copyright 2026 shortly. Built for sharing.</footer>
    </div>
  )
}

function LinkIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z" /><path fill="currentColor" d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z" /></svg>
}
