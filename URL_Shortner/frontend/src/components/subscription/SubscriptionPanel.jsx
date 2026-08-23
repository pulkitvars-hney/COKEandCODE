import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function SubscriptionPanel() {
  const queryClient = useQueryClient()

  const currentQuery = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: async () => (await api('/api/subscription/current')).data,
  })

  const historyQuery = useQuery({
    queryKey: ['subscription', 'history'],
    queryFn: async () => (await api('/api/subscription/history')).data,
  })

  const upgradeMutation = useMutation({
    mutationFn: async (plan) =>
      api('/api/subscription/upgrade', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
  })

  const current = currentQuery.data
  const isPro = current?.plan === 'pro'

  return (
    <section className="subscription-panel glass-panel rounded-[28px] p-5 sm:p-7">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Your plan</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">Choose your momentum</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Free links expire after seven days and stay capped at seven active URLs. Pro is ready when you want more
          room to grow.
        </p>
      </div>

      {/* Visual Toggle for future Annual Billing */}
      <div className="flex items-center gap-3 mb-6 bg-[var(--bg-muted)] border-2 border-[var(--text-primary)] rounded-2xl p-4 max-w-md">
        <span className="text-sm font-bold">Monthly Billing</span>
        <button 
          type="button" 
          disabled 
          className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-[var(--text-primary)] bg-[var(--bg-elevated)] transition-colors duration-200 focus:outline-none opacity-60"
        >
          <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--text-primary)] shadow transition duration-200 ease-in-out" />
        </button>
        <span className="text-sm text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
          Annual Billing 
          <span className="text-[10px] bg-brand text-black font-extrabold uppercase px-1.5 py-0.5 rounded border border-black font-mono">Soon</span>
        </span>
      </div>

      {currentQuery.isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading subscription…</p>
      ) : currentQuery.error ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {currentQuery.error.message}
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <PlanCard
            name="Free"
            price="$0"
            description="A focused home for your first links."
            features={['7 active links', '7-day expiry', 'Full analytics', 'Custom aliases']}
            active={!isPro}
          />
          <PlanCard
            name="Pro"
            price="Available now"
            description="Step up when your creative work needs more room."
            features={['Priority workspace', 'Upgrade via API', 'History preserved', 'One-click switch']}
            active={isPro}
            action={
              !isPro ? (
                <button
                  type="button"
                  disabled={upgradeMutation.isPending}
                  onClick={() => upgradeMutation.mutate('pro')}
                  className="mt-5 w-full rounded-full py-3 text-sm font-bold btn-neo-primary"
                >
                  {upgradeMutation.isPending ? 'Upgrading…' : 'Upgrade to Pro'}
                </button>
              ) : (
                <p className="mt-5 rounded-full border-2 border-[var(--text-primary)] bg-brand/15 px-4 py-3 text-center text-sm font-bold text-[var(--text-primary)]">
                  Current plan
                </p>
              )
            }
          />
        </div>
      )}

      {upgradeMutation.error && (
        <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {upgradeMutation.error.message}
        </p>
      )}

      {current && (
        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
          <p className="text-sm font-bold">Current billing period</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Status: <span className="font-semibold capitalize text-[var(--text-primary)]">{current.status}</span>
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Renews:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {new Date(current.currentPeriodEnd).toLocaleDateString()}
            </span>
          </p>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <p className="text-sm font-bold">History</p>
        {historyQuery.isLoading ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">Loading history…</p>
        ) : historyQuery.error ? (
          <p className="mt-3 text-sm text-red-400">{historyQuery.error.message}</p>
        ) : historyQuery.data?.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">No subscription history yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {historyQuery.data.map((entry) => (
              <li
                key={entry._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold capitalize">{entry.plan}</p>
                  <p className="text-xs capitalize text-[var(--text-muted)]">{entry.status}</p>
                </div>
                <time className="text-xs text-[var(--text-muted)]">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function PlanCard({ name, price, description, features, active, action }) {
  return (
    <div
      className={`rounded-3xl border-2 border-[var(--text-primary)] p-6 transition-all duration-150 ${
        active 
          ? 'bg-brand/5 shadow-[4px_4px_0px_0px_var(--color-brand)]' 
          : 'bg-[var(--bg-elevated)] shadow-[4px_4px_0px_0px_var(--text-primary)]'
      } hover:translate-x-[-2px] hover:translate-y-[-2px]`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">{name}</h3>
        {active && (
          <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-black border border-[var(--text-primary)] shadow-[1px_1px_0px_0px_var(--text-primary)]">
            Active
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-[var(--text-secondary)] font-bold">{price}</p>
      <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
      <ul className="mt-5 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 text-brand border border-brand/40 font-bold text-xs">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      {action}
    </div>
  )
}
