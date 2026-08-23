import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

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
    <section className="glass-panel rounded-[28px] p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Analytics</p>
          <h2 className="mt-1 truncate text-2xl font-bold tracking-tight">{link.shortUrl}</h2>
          <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{link.originalUrl}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border-2 border-[var(--text-primary)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-md active:translate-x-0 active:translate-y-0 active:shadow-neo-sm transition-all"
        >
          Close
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {intervals.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setInterval(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              interval === item.value
                ? 'bg-brand text-black'
                : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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

          <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <p className="text-sm font-bold">Click timeline</p>
            {timeline.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--text-muted)]">No clicks recorded for this interval yet.</p>
            ) : (
              <div className="mt-5 flex h-40 items-end gap-2">
                {timeline.map((point) => (
                  <div key={point._id} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-brand/80 transition-all"
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
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Breakdown title="Countries" items={overview.countryStats} />
            <Breakdown title="Browsers" items={overview.browserStats} />
            <Breakdown title="Devices" items={overview.deviceStats} />
            <Breakdown title="Operating systems" items={overview.osStats} />
          </div>
        </>
      )}

      <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <p className="text-sm font-bold">Recent clicks</p>
        {recentQuery.isLoading ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading recent activity…</p>
        ) : recentQuery.error ? (
          <p className="mt-4 text-sm text-red-400">{recentQuery.error.message}</p>
        ) : recentQuery.data?.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">No recent clicks yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recentQuery.data.map((click, index) => (
              <li
                key={`${click.timestamp}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {click.browser} · {click.os} · {click.device}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {[click.city, click.country].filter(Boolean).join(', ') || 'Unknown location'}
                    {click.referrer ? ` · ${click.referrer}` : ''}
                  </p>
                </div>
                <time className="text-xs text-[var(--text-muted)]">
                  {new Date(click.timestamp).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border-2 border-[var(--text-primary)] bg-[var(--bg-elevated)] p-4 shadow-neo-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">{value ?? 0}</p>
    </div>
  )
}

function Breakdown({ title, items = [] }) {
  const total = items.reduce((sum, item) => sum + (item.count || 0), 0) || 1

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <p className="text-sm font-bold">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.slice(0, 5).map((item) => (
            <li key={item._id || item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{item._id || 'Unknown'}</span>
                <span className="text-[var(--text-muted)]">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(item.count / total) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LoadingState() {
  return <p className="text-sm text-[var(--text-muted)]">Loading analytics…</p>
}

function ErrorState({ message }) {
  return <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{message}</p>
}

function formatTimelineLabel(value, interval) {
  if (!value) return ''
  if (interval === 'day') return String(value).slice(5)
  if (interval === 'week') return `W${String(value).slice(-2)}`
  return String(value)
}
