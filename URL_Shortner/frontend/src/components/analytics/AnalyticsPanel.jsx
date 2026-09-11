import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'

const intervals = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
]

export default function AnalyticsPanel({ link, onClose }) {
  const [interval, setInterval] = useState('day')

  const overviewQuery = useQuery({
    queryKey: ['analytics', link._id, 'overview', interval],
    queryFn: async () => (await api(`/api/analytics/${link._id}/overview?interval=${interval}`)).data,
    enabled: Boolean(link?._id),
  })

  const recentQuery = useQuery({
    queryKey: ['analytics', link._id, 'recent'],
    queryFn: async () => (await api(`/api/analytics/${link._id}/recent?limit=12`)).data,
    enabled: Boolean(link?._id),
  })

  const overview = overviewQuery.data
  const timeline = overview?.timeline || []
  const maxTimeline = Math.max(...timeline.map((point) => point.clicks || 0), 1)

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Analytics</p>
          <h2 className="mt-1 truncate text-lg font-bold text-[var(--text-primary)]">{link.shortUrl}</h2>
          <p className="mt-0.5 truncate text-sm text-[var(--text-muted)]">{link.originalUrl}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Back to links
        </Button>
      </div>

      <div className="mb-5 flex rounded-md border border-[var(--border)] bg-[var(--bg-muted)] p-0.5">
        {intervals.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setInterval(item.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              interval === item.value
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {overviewQuery.isLoading ? (
        <LoadingState />
      ) : overviewQuery.error ? (
        <ErrorState message={overviewQuery.error.message} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total clicks" value={overview.totalClicks} />
            <StatCard label="Unique visitors" value={overview.uniqueVisitors} />
            <StatCard label="Repeat visitors" value={overview.repeatVisitors} />
            <StatCard label="Timeline points" value={timeline.length} />
          </div>

          <Card className="mt-6 p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Click timeline</p>
            {timeline.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--text-muted)]">No clicks recorded for this interval yet.</p>
            ) : (
              <div className="mt-4 flex h-40 items-end gap-1.5">
                {timeline.map((point) => (
                  <div key={point._id} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t bg-[var(--accent)] transition-all"
                      style={{ height: `${Math.max(8, ((point.clicks || 0) / maxTimeline) * 100)}%` }}
                      title={`${point.clicks || 0} clicks`}
                    />
                    <span className="max-w-full truncate text-[10px] text-[var(--text-muted)]">
                      {formatTimelineLabel(point._id, interval)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Breakdown title="Countries" items={overview.countryStats} />
            <Breakdown title="Browsers" items={overview.browserStats} />
            <Breakdown title="Devices" items={overview.deviceStats} />
            <Breakdown title="Operating systems" items={overview.osStats} />
          </div>
        </>
      )}

      <Card className="mt-6 p-5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Recent clicks</p>
        {recentQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : recentQuery.error ? (
          <p className="mt-4 text-sm text-[var(--danger)]" role="alert">{recentQuery.error.message}</p>
        ) : recentQuery.data?.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">No recent clicks yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="pb-2 pr-4">Device</th>
                  <th className="pb-2 pr-4">Location</th>
                  <th className="hidden pb-2 pr-4 sm:table-cell">Referrer</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentQuery.data.map((click, index) => (
                  <tr key={`${click.timestamp}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-[var(--text-primary)]">{click.browser}</span>
                      <span className="text-[var(--text-muted)]"> · {click.os} · {click.device}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--text-secondary)]">
                      {[click.city, click.country].filter(Boolean).join(', ') || 'Unknown'}
                    </td>
                    <td className="hidden max-w-[160px] truncate py-2.5 pr-4 font-mono text-xs text-[var(--text-muted)] sm:table-cell">
                      {click.referrer || '—'}
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right text-xs text-[var(--text-muted)]">
                      {new Date(click.timestamp).toLocaleString()}
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-[var(--text-primary)]">{value ?? 0}</p>
    </div>
  )
}

function Breakdown({ title, items = [] }) {
  const total = items.reduce((sum, item) => sum + (item.count || 0), 0) || 1

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.slice(0, 5).map((item) => (
            <li key={item._id || item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--text-primary)]">{item._id || 'Unknown'}</span>
                <span className="text-[var(--text-muted)]">{item.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${(item.count / total) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-[72px] rounded-lg" />
        <Skeleton className="h-[72px] rounded-lg" />
        <Skeleton className="h-[72px] rounded-lg" />
        <Skeleton className="h-[72px] rounded-lg" />
      </div>
      <Skeleton className="h-[220px] rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[160px] rounded-lg" />
        <Skeleton className="h-[160px] rounded-lg" />
        <Skeleton className="h-[160px] rounded-lg" />
        <Skeleton className="h-[160px] rounded-lg" />
      </div>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <p className="rounded-md border border-[var(--danger)] bg-[var(--danger-muted)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
      {message}
    </p>
  )
}

function formatTimelineLabel(value, interval) {
  if (!value) return ''
  if (interval === 'day') return String(value).slice(5)
  if (interval === 'week') return `W${String(value).slice(-2)}`
  return String(value)
}
