import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const plans = [
  {
    name: 'Free',
    eyebrow: 'For fresh ideas',
    price: '$0',
    period: '/ month',
    detail: 'Start sharing in seconds',
    features: ['7 active links', 'Custom aliases', 'Click analytics'],
    cta: { label: 'Create free account', to: '/signup' },
  },
  {
    name: 'Pro',
    eyebrow: 'For serious creators',
    price: 'Pro',
    period: '',
    detail: 'The upgrade available today',
    features: ['Priority workspace', 'Subscription history', 'Upgrade through the app'],
    cta: { label: 'Explore Pro', to: '/signup' },
    featured: true,
  },
  {
    name: 'Studio',
    eyebrow: 'For growing teams',
    price: 'Soon',
    period: '',
    detail: 'Designed for your next chapter',
    features: ['Team-ready workflow', 'Expanded controls', 'Future release access'],
    unavailable: true,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-5 py-16 sm:px-8" aria-labelledby="pricing-title">
      <div className="mb-12 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Simple plans</p>
        <h2 id="pricing-title" className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Pick the pace that fits your links.</h2>
        <p className="mt-3 text-[var(--text-secondary)]">Everything begins with a free account. Upgrade to Pro from your workspace when you are ready.</p>
      </div>

      <div className="mb-10 flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--text-primary)]">Monthly Billing</span>
        <button
          type="button"
          disabled
          className="relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border border-[var(--border)] bg-[var(--bg-muted)] opacity-60 transition-colors"
          aria-label="Annual billing toggle (disabled)"
        >
          <span className="pointer-events-none inline-block h-4 w-4 translate-x-0 transform rounded-full bg-[var(--text-muted)] transition duration-200 ease-in-out mt-0.5 ml-0.5" />
        </button>
        <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
          Annual Billing
          <Badge variant="pro">Soon</Badge>
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col p-6 ${plan.featured ? 'border-[var(--accent)]' : ''}`}
          >
            {plan.featured && (
              <Badge variant="pro" className="absolute right-4 top-4">Popular</Badge>
            )}
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{plan.eyebrow}</p>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
            <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
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
              {plan.unavailable ? (
                <Button variant="secondary" fullWidth disabled>Coming soon</Button>
              ) : (
                <Link to={plan.cta.to}>
                  <Button variant={plan.featured ? 'primary' : 'secondary'} fullWidth>{plan.cta.label}</Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
