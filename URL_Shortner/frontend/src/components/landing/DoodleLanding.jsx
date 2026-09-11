import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

/* ─── Utility: scroll-reveal ─── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, vis }
}

function Reveal({ children, className = '', delay = 0 }) {
  const { ref, vis } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" aria-hidden="true">
              <path fill="currentColor" d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z" />
              <path fill="currentColor" d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z" />
            </svg>
          </span>
          <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">Shortly</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--text-secondary)] md:flex" aria-label="Landing">
          <a href="#features" className="transition-colors hover:text-[var(--text-primary)]">Features</a>
          <a href="#pricing" className="transition-colors hover:text-[var(--text-primary)]">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-[var(--text-primary)]">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-28 pb-12 sm:px-8 sm:pt-36 sm:pb-20">
      {/* decorative orange accent */}
      <div className="pointer-events-none absolute top-20 right-0 h-64 w-64 rounded-full bg-[var(--accent)]/[0.06] blur-[80px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-48 w-48 rounded-full bg-[var(--accent)]/[0.04] blur-[60px]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="mb-4 inline-block rounded-full border border-[var(--accent)]/20 bg-[var(--accent-muted)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Link management, refined
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="font-[family-name:var(--font-doodle)] text-5xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
            Make every link{' '}
            <span className="text-[var(--accent)]">pull its weight</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            Create clean short URLs, manage your link portfolio, and see the story behind every click — all from one focused workspace.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="lg">Get started free</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">Log in</Button>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* product mockup */}
      <Reveal delay={320} className="mt-14 sm:mt-20">
        <ProductMockup />
      </Reveal>
    </section>
  )
}

/* ─── Product Mockup (realistic Shortly UI) ─── */
function ProductMockup() {
  const [tab, setTab] = useState('links')

  const links = [
    { short: 'sho.rt/launch26', dest: 'https://example.com/products/summer-launch', clicks: 1842, status: 'active', plan: 'Pro' },
    { short: 'sho.rt/promo', dest: 'https://example.com/promo/limited-offer', clicks: 639, status: 'active', plan: 'Free' },
    { short: 'sho.rt/docs', dest: 'https://docs.example.com/api/v2', clicks: 271, status: 'active', plan: 'Pro' },
    { short: 'sho.rt/blog1', dest: 'https://blog.example.com/getting-started', clicks: 94, status: 'expired', plan: 'Free' },
  ]

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* ambient glow behind mockup */}
      <div className="pointer-events-none absolute -inset-16 -z-10 rounded-3xl bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-[var(--accent)]/4 blur-2xl" />

      <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]/60" />
          <span className="ml-3 font-mono text-[11px] text-[var(--text-muted)]">app.shortly.io</span>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-[var(--border)] px-4 pt-3">
          {['links', 'analytics', 'subscription'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-t-lg px-4 py-2 text-xs font-medium transition-colors ${
                tab === t
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'links' && <MockLinksTab rows={links} />}
          {tab === 'analytics' && <MockAnalyticsTab />}
          {tab === 'subscription' && <MockSubscriptionTab />}
        </div>
      </div>
    </div>
  )
}

function MockLinksTab({ rows }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-muted)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            <th className="px-3 py-2 font-semibold">Short URL</th>
            <th className="hidden px-3 py-2 font-semibold sm:table-cell">Destination</th>
            <th className="px-3 py-2 text-right font-semibold">Clicks</th>
            <th className="px-3 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.short} className="border-b border-[var(--border)] transition-colors hover:bg-[var(--bg-hover)]">
              <td className="px-3 py-2.5 font-mono text-[var(--accent)]">{r.short}</td>
              <td className="hidden max-w-[180px] truncate px-3 py-2.5 text-[var(--text-muted)] sm:table-cell">{r.dest}</td>
              <td className="px-3 py-2.5 text-right font-mono text-[var(--text-primary)]">{r.clicks.toLocaleString()}</td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  r.status === 'active'
                    ? 'bg-[var(--success-muted)] text-[var(--success)]'
                    : 'bg-[var(--danger-muted)] text-[var(--danger)]'
                }`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MockAnalyticsTab() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  const values = [320, 580, 420, 790, 960, 1240, 1842]
  const max = Math.max(...values)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total clicks', value: '5,154' },
          { label: 'Unique visitors', value: '3,891' },
          { label: 'Top referrer', value: 'Twitter' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2" style={{ height: 110 }}>
        {months.map((m, i) => (
          <div key={m} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="w-full rounded-t-sm bg-gradient-to-t from-[var(--accent)]/70 to-[var(--accent)]/30"
              style={{ height: `${(values[i] / max) * 100}%`, minHeight: 4 }}
            />
            <span className="text-[10px] text-[var(--text-muted)]">{m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockSubscriptionTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-muted)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Pro Plan</p>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Active until Dec 2026</p>
          </div>
          <span className="inline-flex rounded-full bg-[var(--success-muted)] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--success)]">
            Active
          </span>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] p-4">
        <p className="mb-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Recent billing</p>
        <div className="space-y-2">
          {[
            { date: 'Sep 1, 2026', amount: '$9.00', status: 'Paid' },
            { date: 'Aug 1, 2026', amount: '$9.00', status: 'Paid' },
            { date: 'Jul 1, 2026', amount: '$9.00', status: 'Paid' },
          ].map((row) => (
            <div key={row.date} className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{row.date}</span>
              <span className="font-mono text-[var(--text-secondary)]">{row.amount}</span>
              <span className="text-[var(--success)]">{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── What Shortly Does ─── */
function WhatItDoes() {
  const items = [
    { icon: '🔗', title: 'Shorten URLs', desc: 'Turn any long link into a clean, shareable short URL in milliseconds.' },
    { icon: '✏️', title: 'Custom aliases', desc: 'Choose memorable, branded slugs that match your identity.' },
    { icon: '📊', title: 'Track clicks', desc: 'See exactly who is clicking, when, and from where.' },
    { icon: '📈', title: 'View analytics', desc: 'Timelines, referrers, browsers, devices, and locations — all in one view.' },
    { icon: '💳', title: 'Manage subscriptions', desc: 'Upgrade to Pro, track your billing, and control your plan.' },
    { icon: '🔒', title: 'Secure & private', desc: 'Your links and analytics data are protected with industry-standard security.' },
  ]

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <div className="mb-12 max-w-lg">
          <p className="mb-2 font-[family-name:var(--font-doodle)] text-lg text-[var(--accent)]">What Shortly does</p>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Everything you need to shorten, share, and track.
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 60}>
            <div className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all duration-200 hover:border-[var(--accent)]/30 hover:shadow-md hover:shadow-[var(--accent)]/5">
              <span className="mb-3 block text-2xl">{item.icon}</span>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { num: '01', label: 'Create', desc: 'Paste any URL and get a clean short link instantly.' },
    { num: '02', label: 'Share', desc: 'Distribute your link anywhere — social, email, print.' },
    { num: '03', label: 'Analyze', desc: 'Watch real-time clicks, sources, and visitor insights.' },
  ]

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <div className="mb-12 max-w-lg">
          <p className="mb-2 font-[family-name:var(--font-doodle)] text-lg text-[var(--accent)]">How it works</p>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Three steps to link clarity.
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">No complexity. No setup. Just paste, share, and watch.</p>
        </div>
      </Reveal>

      <div className="relative grid gap-8 md:grid-cols-3">
        {/* connecting line */}
        <div className="pointer-events-none absolute top-12 left-[16.66%] right-[16.66%] hidden h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent md:block" />

        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 100}>
            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-200 group-hover:border-[var(--accent)]/30">
                <span className="font-[family-name:var(--font-doodle)] text-2xl font-bold text-[var(--accent)]">{step.num}</span>
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{step.label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── Features ─── */
function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <div className="mb-12 max-w-lg">
          <p className="mb-2 font-[family-name:var(--font-doodle)] text-lg text-[var(--accent)]">Features</p>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Built for people who share a lot of links.
          </h2>
        </div>
      </Reveal>

      {/* editorial layout: large card + grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="glass-strong flex h-full flex-col justify-between rounded-2xl p-6 sm:p-8">
            <div>
              <h3 className="font-[family-name:var(--font-doodle)] text-2xl font-bold text-[var(--text-primary)]">Instant shortening</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                Paste a URL, get a short link. No waiting, no configuration. Your links are ready in milliseconds.
              </p>
            </div>
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] p-4 font-mono text-sm text-[var(--accent)]">
              sho.rt/launch26 → 1,842 clicks
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="glass-strong flex h-full flex-col justify-between rounded-2xl p-6">
            <div>
              <h3 className="font-[family-name:var(--font-doodle)] text-xl font-bold text-[var(--text-primary)]">Custom aliases</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Brand your links with memorable slugs.</p>
            </div>
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] p-3 font-mono text-xs text-[var(--text-muted)]">
              sho.rt/<span className="text-[var(--accent)]">my-brand</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="font-[family-name:var(--font-doodle)] text-xl font-bold text-[var(--text-primary)]">Click analytics</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Real-time data on every click — timeline, referrers, browsers, devices.</p>
            <div className="mt-4 flex items-end gap-1" style={{ height: 48 }}>
              {[30, 55, 40, 70, 85, 60, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-[var(--accent)]/30" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="font-[family-name:var(--font-doodle)] text-xl font-bold text-[var(--text-primary)]">Link management</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Edit, delete, and organize your entire link portfolio from one dashboard.</p>
            <div className="mt-4 space-y-2">
              {['Active', 'Active', 'Expired'].map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-1.5 text-xs">
                  <span className={`h-1.5 w-1.5 rounded-full ${s === 'Active' ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
                  <span className="text-[var(--text-muted)]">sho.rt/link{i + 1}</span>
                  <span className="ml-auto text-[var(--text-muted)]">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="font-[family-name:var(--font-doodle)] text-xl font-bold text-[var(--text-primary)]">Expiry control</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Free links last 7 days. Pro links last indefinitely. You decide.</p>
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Free plan</span>
                <span className="text-[var(--warning)]">7-day expiry</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Pro plan</span>
                <span className="text-[var(--success)]">No expiry</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Analytics Showcase ─── */
function AnalyticsShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div>
            <p className="mb-2 font-[family-name:var(--font-doodle)] text-lg text-[var(--accent)]">Analytics</p>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              See the story behind every click.
            </h2>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
              Each link gets its own analytics dashboard. View click timelines, visitor geography, referrer sources, browsers, devices, and operating systems — all updated in real time.
            </p>
            <ul className="mt-6 space-y-3">
              {['Click timelines by day, week, month, or year', 'Top referrers with click counts', 'Browser, device, and OS breakdowns', 'Visitor location data'].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="glass-strong rounded-2xl p-5 shadow-lg shadow-black/5 dark:shadow-black/20">
            <MockAnalyticsTab />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Pricing ─── */
function Pricing() {
  const plans = [
    {
      name: 'Free',
      eyebrow: 'For fresh ideas',
      price: '$0',
      period: '/ month',
      detail: 'Start sharing in seconds',
      features: ['7 active links', 'Custom aliases', 'Click analytics', '7-day link expiry'],
      cta: { label: 'Create free account', to: '/signup' },
    },
    {
      name: 'Pro',
      eyebrow: 'For serious creators',
      price: '$9',
      period: '/ month',
      detail: 'Available today',
      features: ['Unlimited active links', 'No expiry', 'Full analytics', 'Subscription history', 'Priority workspace'],
      cta: { label: 'Upgrade to Pro', to: '/signup' },
      featured: true,
    },
  ]

  return (
    <section id="pricing" className="mx-auto max-w-4xl px-5 py-20 sm:px-8" aria-labelledby="pricing-title">
      <Reveal>
        <div className="mb-12 text-center">
          <p className="mb-2 font-[family-name:var(--font-doodle)] text-lg text-[var(--accent)]">Simple plans</p>
          <h2 id="pricing-title" className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Pick the pace that fits your links.
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">Everything begins with a free account. Upgrade when you are ready.</p>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 80}>
            <div
              className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-200 ${
                plan.featured
                  ? 'border-[var(--accent)]/30 bg-[var(--accent-muted)] shadow-lg shadow-[var(--accent)]/5'
                  : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/20 hover:shadow-md'
              }`}
            >
              {plan.featured && (
                <span className="absolute right-4 top-4 inline-flex rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Popular
                </span>
              )}
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{plan.eyebrow}</p>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
              <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
                {plan.price}
                {plan.period && <span className="text-sm font-normal text-[var(--text-muted)]">{plan.period}</span>}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.detail}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link to={plan.cta.to}>
                  <Button variant={plan.featured ? 'primary' : 'secondary'} fullWidth>
                    {plan.cta.label}
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── Testimonials ─── */
function Testimonials() {
  const items = [
    {
      quote: 'Shortly replaced three tools I was using for link management. The analytics alone are worth it.',
      name: 'Alex Rivera',
      role: 'Marketing Lead',
      company: 'NovaBrand',
    },
    {
      quote: 'Clean, fast, no bloat. Exactly what a link shortener should be.',
      name: 'Priya Sharma',
      role: 'Product Designer',
      company: 'Circl',
    },
    {
      quote: "I switched from a bloated competitor and haven't looked back. Shortly just works.",
      name: 'Marcus Chen',
      role: 'Developer',
      company: 'IndieHacker',
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <div className="mb-12 max-w-lg">
          <p className="mb-2 font-[family-name:var(--font-doodle)] text-lg text-[var(--accent)]">Testimonials</p>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Trusted by people who ship links daily.
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <div className="glass-strong flex h-full flex-col rounded-2xl p-6">
              <div className="mb-3 flex gap-0.5 text-[var(--accent)]">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 border-t border-[var(--border)] pt-3">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{t.name}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{t.role} · {t.company}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── FAQ ─── */
const faqData = [
  { q: 'What is Shortly?', a: 'Shortly is a URL shortener that turns long, unwieldy links into clean, memorable short URLs. You can create, manage, and track all your links from one focused workspace.' },
  { q: 'How does URL shortening work?', a: 'Paste any long URL into Shortly and get a compact short link. You can use a custom alias or let Shortly generate one automatically.' },
  { q: 'How long do Free URLs remain active?', a: 'Free links expire after 7 days. Pro links stay active as long as your subscription is current.' },
  { q: 'What happens when a URL expires?', a: 'Expired links stop redirecting. They remain visible in your dashboard as historical records, but they no longer forward visitors.' },
  { q: 'Can I view my URL history?', a: 'Yes. Every link you create appears in your dashboard with its destination, status, click count, creation date, and expiry.' },
  { q: 'What does Pro provide?', a: 'Pro removes the 7-day expiry limit, gives you a higher active-link cap, and unlocks subscription history.' },
  { q: 'Can I track clicks?', a: 'Yes. Each link has a dedicated analytics view showing click timelines, referrer sources, browsers, devices, and visitor locations.' },
  { q: 'Can I upgrade individual URLs?', a: 'Upgrading to Pro applies to your entire account. All your links benefit from extended expiry and higher limits.' },
]

function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <Reveal>
        <div className="mb-10 text-center">
          <p className="mb-2 font-[family-name:var(--font-doodle)] text-lg text-[var(--accent)]">FAQ</p>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Frequently asked questions.
          </h2>
        </div>
      </Reveal>

      <div className="space-y-3">
        {faqData.map((item, i) => (
          <Reveal key={i} delay={i * 40}>
            <FaqItem question={item.q} answer={item.a} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--accent)]/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[var(--text-primary)]">{question}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-[var(--border)] px-5 pb-4 pt-3">
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{answer}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Final CTA ─── */
function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal>
        <div className="orange-glow relative overflow-hidden rounded-3xl border border-[var(--accent)]/15 bg-[var(--accent-muted)] p-10 text-center sm:p-14">
          <h2 className="font-[family-name:var(--font-doodle)] text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Ready to shorten your first link?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--text-secondary)]">
            Create a free account in seconds. No credit card required.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="lg">Get started free</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">Log in</Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)]">
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" aria-hidden="true">
              <path fill="currentColor" d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z" />
              <path fill="currentColor" d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z" />
            </svg>
          </span>
          <span className="text-sm font-bold text-[var(--text-primary)]">Shortly</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
          <a href="#features" className="transition-colors hover:text-[var(--text-secondary)]">Features</a>
          <a href="#pricing" className="transition-colors hover:text-[var(--text-secondary)]">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-[var(--text-secondary)]">FAQ</a>
        </div>
        <p className="text-xs text-[var(--text-muted)]">Copyright 2026 Shortly. Built for sharing.</p>
      </div>
    </footer>
  )
}

/* ─── Main Export ─── */
export default function DoodleLanding({ onAuthenticated: _onAuthenticated }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <WhatItDoes />
        <HowItWorks />
        <Features />
        <AnalyticsShowcase />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
