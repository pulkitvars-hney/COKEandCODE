const plans = [
  { name: 'Free', eyebrow: 'For fresh ideas', price: '$0', detail: 'Start sharing in seconds', features: ['7 active links', 'Custom aliases', 'Click analytics'], action: 'Create free account' },
  { name: 'Pro', eyebrow: 'For serious creators', price: 'Pro', detail: 'The upgrade available today', features: ['Priority workspace', 'Subscription history', 'Upgrade through the app'], action: 'Explore Pro', featured: true },
  { name: 'Studio', eyebrow: 'For growing teams', price: 'Soon', detail: 'Designed for your next chapter', features: ['Team-ready workflow', 'Expanded controls', 'Future release access'], action: 'Coming soon', unavailable: true },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="landing-pricing mx-auto max-w-6xl px-5 py-20 sm:px-8" aria-labelledby="pricing-title">
      <div className="landing-section-heading">
        <p className="landing-eyebrow">Simple plans, real momentum</p>
        <h2 id="pricing-title" className="text-3xl font-extrabold tracking-tight mt-2 text-gradient">Pick the pace that fits your links.</h2>
        <p className="mt-4">Everything begins with a free account. Upgrade to Pro from your workspace when you are ready.</p>
      </div>

      {/* Visual Toggle for future Annual Billing */}
      <div className="flex justify-center items-center gap-3 mb-10">
        <span className="text-sm font-bold">Monthly Billing</span>
        <button 
          type="button" 
          disabled 
          className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-[var(--text-primary)] bg-[var(--bg-muted)] transition-colors duration-200 focus:outline-none opacity-60"
          aria-label="Annual billing toggle (disabled)"
        >
          <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--text-primary)] shadow transition duration-200 ease-in-out" />
        </button>
        <span className="text-sm text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
          Annual Billing 
          <span className="text-[10px] bg-brand text-black font-extrabold uppercase px-1.5 py-0.5 rounded border border-black font-mono">Soon</span>
        </span>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article key={plan.name} className={`pricing-card ${plan.featured ? 'pricing-card--featured' : ''}`}>
            {plan.featured && <span className="pricing-card__popular">Popular</span>}
            <div className="pricing-card__icon" aria-hidden="true">{plan.name === 'Free' ? '↗' : plan.name === 'Pro' ? '✦' : '◌'}</div>
            <p className="pricing-card__eyebrow">{plan.eyebrow}</p>
            <h3>{plan.name}</h3>
            <p className="pricing-card__price">{plan.price}<span>{plan.price === '$0' ? '/ month' : ''}</span></p>
            <p className="pricing-card__detail">{plan.detail}</p>
            <ul>{plan.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
            {plan.unavailable ? <span className="pricing-card__disabled">{plan.action}</span> : <a href="#join" className="pricing-card__action">{plan.action}</a>}
          </article>
        ))}
      </div>
    </section>
  )
}
