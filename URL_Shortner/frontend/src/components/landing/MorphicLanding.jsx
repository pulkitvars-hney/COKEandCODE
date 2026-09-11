import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Badge from '../ui/Badge'


const faqItems = [
  {
    q: 'What is Shortly?',
    a: 'Shortly is a URL shortener that turns long, unwieldy links into clean, memorable short URLs. You can create, manage, and track all your links from one focused workspace.',
  },
  {
    q: 'How does URL expiration work?',
    a: 'Free links expire after 7 days. Pro links stay active as long as your subscription is current. You can always see when each link expires in your dashboard.',
  },
  {
    q: 'What does Pro provide?',
    a: 'Pro removes the 7-day expiry limit, gives you a higher active-link cap, and unlocks subscription history. Upgrade anytime from your workspace.',
  },
  {
    q: 'Can I view URL history?',
    a: 'Yes. Every link you create appears in your dashboard with its destination, status, click count, creation date, and expiry. You can filter and search across all of them.',
  },
  {
    q: 'Can I track clicks?',
    a: 'Yes. Each link has a dedicated analytics view showing click timelines, referrer sources, browsers, devices, and visitor locations. Data is available in daily, weekly, monthly, and yearly intervals.',
  },
]

const testimonials = [
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
    quote: 'I switched from a bloated competitor and haven\'t looked back. Shortly just works.',
    name: 'Marcus Chen',
    role: 'Developer',
    company: 'IndieHacker',
  },
]

function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

function RevealSection({ children, className = '', delay = 0 }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

function ProductMockup() {
  const [activeTab, setActiveTab] = useState('links')

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -inset-12 -z-10 rounded-full bg-gradient-to-br from-blue-500/15 via-cyan-400/10 to-transparent blur-3xl" />

      <GlassCard className="overflow-hidden shadow-2xl shadow-blue-500/5">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="ml-3 font-mono text-[11px] text-white/30">app.shortly.io</span>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-white/[0.06] px-4 pt-3">
          {['links', 'analytics', 'subscription'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white/[0.08] text-white/90'
                  : 'text-white/35 hover:text-white/55'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="p-5">
          {activeTab === 'links' && <LinksTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'subscription' && <SubscriptionTab />}
        </div>
      </GlassCard>
    </div>
  )
}

function LinksTab() {
  const rows = [
    { short: 'sho.rt/launch26', dest: 'https://example.com/products/summer-launch-collection-2026', clicks: 1842, status: 'active', plan: 'Pro' },
    { short: 'sho.rt/promo', dest: 'https://example.com/promo/limited-offer', clicks: 639, status: 'active', plan: 'Free' },
    { short: 'sho.rt/docs', dest: 'https://docs.example.com/api/v2/reference', clicks: 271, status: 'active', plan: 'Pro' },
    { short: 'sho.rt/blog1', dest: 'https://blog.example.com/getting-started-guide', clicks: 94, status: 'expired', plan: 'Free' },
  ]

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06]">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] uppercase tracking-wider text-white/35">
            <th className="px-3 py-2 font-semibold">Short URL</th>
            <th className="hidden px-3 py-2 font-semibold sm:table-cell">Destination</th>
            <th className="px-3 py-2 text-right font-semibold">Clicks</th>
            <th className="px-3 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.short} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]">
              <td className="px-3 py-2.5 font-mono text-blue-300">{r.short}</td>
              <td className="hidden max-w-[200px] truncate px-3 py-2.5 text-white/40 sm:table-cell">{r.dest}</td>
              <td className="px-3 py-2.5 text-right font-mono text-white/70">{r.clicks.toLocaleString()}</td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  r.status === 'active'
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'bg-red-400/15 text-red-300'
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

function AnalyticsTab() {
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
          <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/35">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-white/90">{s.value}</p>
          </div>
        ))}
      </div>

      {/* bar chart */}
      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {months.map((m, i) => (
          <div key={m} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="w-full rounded-t-sm bg-gradient-to-t from-blue-500/60 to-cyan-400/50 transition-all duration-500"
              style={{ height: `${(values[i] / max) * 100}%`, minHeight: 4 }}
            />
            <span className="text-[10px] text-white/30">{m}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SubscriptionTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-400/20 bg-blue-400/[0.06] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white/80">Pro Plan</p>
            <p className="mt-0.5 text-[11px] text-white/40">Active until Dec 2026</p>
          </div>
          <span className="inline-flex rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
            Active
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
        <p className="mb-3 text-[11px] uppercase tracking-wider text-white/35">Recent billing</p>
        <div className="space-y-2">
          {[
            { date: 'Sep 1, 2026', amount: '$9.00', status: 'Paid' },
            { date: 'Aug 1, 2026', amount: '$9.00', status: 'Paid' },
            { date: 'Jul 1, 2026', amount: '$9.00', status: 'Paid' },
          ].map((row) => (
            <div key={row.date} className="flex items-center justify-between text-xs">
              <span className="text-white/50">{row.date}</span>
              <span className="font-mono text-white/70">{row.amount}</span>
              <span className="text-emerald-400/70">{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepDiagram() {
  const steps = [
    { num: '01', label: 'Create', desc: 'Paste any URL and get a clean short link instantly.' },
    { num: '02', label: 'Share', desc: 'Distribute your link anywhere — social, email, print.' },
    { num: '03', label: 'Analyze', desc: 'Watch real-time clicks, sources, and visitor insights.' },
  ]

  return (
    <div className="relative grid gap-6 md:grid-cols-3">
      {/* connecting line (desktop) */}
      <div className="pointer-events-none absolute top-10 left-[16.66%] right-[16.66%] hidden h-px bg-gradient-to-r from-blue-500/0 via-blue-400/30 to-blue-500/0 md:block" />

      {steps.map((step, i) => (
        <RevealSection key={step.num} delay={i * 120}>
          <div className="relative text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
              <span className="font-mono text-lg font-bold text-blue-300">{step.num}</span>
            </div>
            <h3 className="text-base font-semibold text-white/90">{step.label}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/45">{step.desc}</p>
          </div>
        </RevealSection>
      ))}
    </div>
  )
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/10 text-blue-300 transition-colors group-hover:bg-blue-400/15">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white/85">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/40">{desc}</p>
    </div>
  )
}

export default function MorphicLanding({ onAuthenticated: _onAuthenticated }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080c14] text-white">
      {/* global ambient gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full bg-blue-800/[0.05] blur-[100px]" />
      </div>

      {/* ─── NAVBAR ─── */}
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative mx-auto max-w-6xl px-5 pt-24 pb-16 sm:px-8 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="pro" className="mb-6 inline-flex !border-blue-400/20 !bg-blue-400/10 !text-blue-300">
            Link management, refined
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Make every link{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              pull its weight
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg">
            Create clean short URLs, manage your link portfolio, and see the story behind every click — all from one focused workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button
                variant="primary"
                size="lg"
                className="!bg-gradient-to-r !from-blue-500 !to-blue-600 !shadow-lg !shadow-blue-500/20 hover:!from-blue-400 hover:!to-blue-500"
              >
                Get started free
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="ghost"
                size="lg"
                className="!border !border-white/10 !bg-white/[0.04] !text-white/70 hover:!border-white/20 hover:!text-white"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>

        {/* product mockup below hero */}
        <RevealSection className="mt-16 sm:mt-20">
          <ProductMockup />
        </RevealSection>
      </section>

      {/* ─── WHAT SHORTLY DOES ─── */}
      <RevealSection>
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mb-12 max-w-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400/70">What Shortly does</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Everything you need to shorten, share, and track.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureItem
              icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>}
              title="Shorten URLs"
              desc="Turn any long link into a clean, shareable short URL in milliseconds."
            />
            <FeatureItem
              icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>}
              title="Custom aliases"
              desc="Choose memorable, branded slugs that match your identity."
            />
            <FeatureItem
              icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
              title="Track clicks"
              desc="See exactly who is clicking, when, and from where."
            />
            <FeatureItem
              icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>}
              title="View analytics"
              desc="Timelines, referrers, browsers, devices, and locations — all in one view."
            />
            <FeatureItem
              icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>}
              title="Manage subscriptions"
              desc="Upgrade to Pro, track your billing, and control your plan from your workspace."
            />
            <FeatureItem
              icon={<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
              title="Secure & private"
              desc="Your links and analytics data are protected with industry-standard security."
            />
          </div>
        </section>
      </RevealSection>

      {/* ─── HOW IT WORKS ─── */}
      <RevealSection>
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mb-12 max-w-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400/70">How it works</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Three steps to link clarity.</h2>
            <p className="mt-3 text-white/45">No complexity. No setup. Just paste, share, and watch.</p>
          </div>
          <StepDiagram />
        </section>
      </RevealSection>

      {/* ─── ANALYTICS SHOWCASE ─── */}
      <RevealSection>
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400/70">Analytics</p>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">See the story behind every click.</h2>
              <p className="mt-4 text-white/45 leading-relaxed">
                Each link gets its own analytics dashboard. View click timelines, visitor geography, referrer sources, browsers, devices, and operating systems — all updated in real time.
              </p>
              <ul className="mt-6 space-y-3">
                {['Click timelines by day, week, month, or year', 'Top referrers with click counts', 'Browser, device, and OS breakdowns', 'Visitor location data'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/55">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <GlassCard className="p-5">
                <AnalyticsTab />
              </GlassCard>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── FEATURES ─── */}
      <RevealSection>
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mb-12 max-w-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400/70">Features</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Built for people who share a lot of links.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Instant shortening', desc: 'Paste a URL, get a short link. No waiting.' },
              { title: 'Custom aliases', desc: 'Brand your links with memorable slugs.' },
              { title: 'Click analytics', desc: 'Real-time data on every click.' },
              { title: 'Link management', desc: 'Edit, delete, and organize your portfolio.' },
              { title: 'Expiry control', desc: 'Free links last 7 days. Pro links last indefinitely.' },
              { title: 'Plan flexibility', desc: 'Upgrade or downgrade anytime.' },
              { title: 'Dark mode', desc: 'A focused workspace that is easy on the eyes.' },
              { title: 'Responsive design', desc: 'Manage links from any device.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]">
                <h3 className="text-sm font-semibold text-white/85">{f.title}</h3>
                <p className="mt-1 text-[13px] text-white/40">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ─── PRICING ─── */}
      <RevealSection>
        <div className="[&_section]:!bg-transparent [&_*]:!text-inherit">
          <MorphicPricing />
        </div>
      </RevealSection>

      {/* ─── TESTIMONIALS ─── */}
      <RevealSection>
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mb-12 max-w-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400/70">Testimonials</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Trusted by people who ship links daily.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <GlassCard key={t.name} className="flex flex-col p-6">
                <div className="mb-3 flex gap-0.5 text-blue-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-white/60">"{t.quote}"</p>
                <div className="mt-4 border-t border-white/[0.06] pt-3">
                  <p className="text-xs font-semibold text-white/80">{t.name}</p>
                  <p className="text-[11px] text-white/35">{t.role} · {t.company}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ─── FAQ ─── */}
      <RevealSection>
        <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400/70">FAQ</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Frequently asked questions.</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ─── FINAL CTA ─── */}
      <RevealSection>
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <GlassCard className="relative overflow-hidden p-10 text-center sm:p-14">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[80px]" />
            <h2 className="relative text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to shorten your first link?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/45">
              Create a free account in seconds. No credit card required.
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup">
                <Button
                  variant="primary"
                  size="lg"
                  className="!bg-gradient-to-r !from-blue-500 !to-blue-600 !shadow-lg !shadow-blue-500/20 hover:!from-blue-400 hover:!to-blue-500"
                >
                  Get started free
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="lg"
                  className="!border !border-white/10 !bg-white/[0.04] !text-white/70 hover:!border-white/20 hover:!text-white"
                >
                  Log in
                </Button>
              </Link>
            </div>
          </GlassCard>
        </section>
      </RevealSection>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20">
              <svg viewBox="0 0 24 24" className="h-3 w-3 text-blue-300" aria-hidden="true">
                <path fill="currentColor" d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z" />
                <path fill="currentColor" d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-white/70">Shortly</span>
          </div>
          <p className="text-xs text-white/30">Copyright 2026 Shortly. Built for sharing.</p>
        </div>
      </footer>
    </div>
  )
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-blue-300" aria-hidden="true">
              <path fill="currentColor" d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z" />
              <path fill="currentColor" d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z" />
            </svg>
          </span>
          <span className="text-sm font-bold text-white/90">Shortly</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/45 md:flex" aria-label="Landing navigation">
          <a href="#features" className="transition-colors hover:text-white/80">Features</a>
          <a href="#pricing" className="transition-colors hover:text-white/80">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-white/80">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button
              variant="ghost"
              size="sm"
              className="!text-white/60 hover:!text-white hover:!bg-white/[0.06]"
            >
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              variant="primary"
              size="sm"
              className="!bg-blue-500 hover:!bg-blue-400"
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─── FaqItem ─── */
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/[0.1]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-white/80">{question}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-white/[0.04] px-5 pb-4 pt-3">
          <p className="text-[13px] leading-relaxed text-white/45">{answer}</p>
        </div>
      )}
    </div>
  )
}

/* ─── MorphicPricing (restyled PricingSection for dark morphic context) ─── */
function MorphicPricing() {
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
      <div className="mb-12 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400/70">Simple plans</p>
        <h2 id="pricing-title" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Pick the pace that fits your links.</h2>
        <p className="mt-3 text-white/45">Everything begins with a free account. Upgrade to Pro when you are ready.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <GlassCard
            key={plan.name}
            className={`relative flex flex-col p-6 transition-all duration-300 ${
              plan.featured
                ? 'border-blue-400/25 bg-blue-400/[0.06] shadow-lg shadow-blue-500/5'
                : 'hover:border-white/[0.12]'
            }`}
          >
            {plan.featured && (
              <Badge variant="pro" className="absolute right-4 top-4 !border-blue-400/20 !bg-blue-400/10 !text-blue-300">
                Popular
              </Badge>
            )}
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/35">{plan.eyebrow}</p>
            <h3 className="text-lg font-bold text-white/90">{plan.name}</h3>
            <p className="mt-1 text-3xl font-bold text-white/90">
              {plan.price}
              {plan.period && <span className="text-sm font-normal text-white/40">{plan.period}</span>}
            </p>
            <p className="mt-2 text-sm text-white/45">{plan.detail}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-white/55">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link to={plan.cta.to}>
                <Button
                  variant={plan.featured ? 'primary' : 'secondary'}
                  fullWidth
                  className={
                    plan.featured
                      ? '!bg-gradient-to-r !from-blue-500 !to-blue-600 !shadow-lg !shadow-blue-500/20 hover:!from-blue-400 hover:!to-blue-500'
                      : '!border-white/10 !bg-white/[0.04] !text-white/80 hover:!border-white/20 hover:!bg-white/[0.08]'
                  }
                >
                  {plan.cta.label}
                </Button>
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
