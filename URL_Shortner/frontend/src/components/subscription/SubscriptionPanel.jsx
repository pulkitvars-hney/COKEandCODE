import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Skeleton from '../ui/Skeleton'

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
    <section>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Your plan</p>
        <h2 className="mt-1 text-lg font-bold text-[var(--text-primary)]">Subscription</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Free links expire after seven days and stay capped at seven active URLs. Pro is ready when you want more room to grow.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-muted)] p-0.5 max-w-md">
        <span className="px-3 py-1.5 text-sm font-medium text-[var(--text-primary)]">Monthly Billing</span>
        <button
          type="button"
          disabled
          className="relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border border-[var(--border)] bg-[var(--bg-surface)] opacity-60 transition-colors"
          aria-label="Annual billing toggle (disabled)"
        >
          <span className="pointer-events-none inline-block h-4 w-4 translate-x-0 transform rounded-full bg-[var(--text-muted)] transition duration-200 ease-in-out mt-0.5 ml-0.5" />
        </button>
        <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
          Annual Billing
          <Badge variant="pro">Soon</Badge>
        </span>
      </div>

      {currentQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[280px] rounded-lg" />
          <Skeleton className="h-[280px] rounded-lg" />
        </div>
      ) : currentQuery.error ? (
        <p className="rounded-md border border-[var(--danger)] bg-[var(--danger-muted)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
          {currentQuery.error.message}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
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
                <Button
                  variant="primary"
                  fullWidth
                  loading={upgradeMutation.isPending}
                  disabled={upgradeMutation.isPending}
                  onClick={() => upgradeMutation.mutate('pro')}
                  className="mt-4"
                >
                  {upgradeMutation.isPending ? 'Upgrading…' : 'Upgrade to Pro'}
                </Button>
              ) : (
                <Badge variant="active" className="mt-4">Current plan</Badge>
              )
            }
          />
        </div>
      )}

      {upgradeMutation.error && (
        <p className="mt-4 rounded-md border border-[var(--danger)] bg-[var(--danger-muted)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
          {upgradeMutation.error.message}
        </p>
      )}

      {current && (
        <Card className="mt-6 p-5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Current billing period</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--text-secondary)]">
            <span>
              Status: <span className="font-medium capitalize text-[var(--text-primary)]">{current.status}</span>
            </span>
            <span>
              Renews: <span className="font-medium text-[var(--text-primary)]">{new Date(current.currentPeriodEnd).toLocaleDateString()}</span>
            </span>
          </div>
        </Card>
      )}

      <Card className="mt-6 p-5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">History</p>
        {historyQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : historyQuery.error ? (
          <p className="mt-4 text-sm text-[var(--danger)]" role="alert">{historyQuery.error.message}</p>
        ) : historyQuery.data?.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">No subscription history yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="pb-2 pr-4">Plan</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {historyQuery.data.map((entry) => (
                  <tr key={entry._id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-4 font-medium capitalize text-[var(--text-primary)]">{entry.plan}</td>
                    <td className="py-2.5 pr-4 capitalize text-[var(--text-secondary)]">{entry.status}</td>
                    <td className="whitespace-nowrap py-2.5 text-right text-xs text-[var(--text-muted)]">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  )
}

function PlanCard({ name, price, description, features, active, action }) {
  return (
    <Card className={`p-6 ${active ? 'border-[var(--accent)]' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-[var(--text-primary)]">{name}</h3>
        {active && <Badge variant="active">Active</Badge>}
      </div>
      <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{price}</p>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{description}</p>
      <ul className="mt-4 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      {action}
    </Card>
  )
}
