import { isActiveUrl } from '../../lib/api'
import CopyButton from '../ui/CopyButton'

export default function LinkList({ urls, onDelete, onSelectAnalytics, deletingId, selectedId }) {
  if (!urls?.length) {
    return (
      <section className="glass-panel rounded-[28px] p-8 text-center">
        <p className="text-lg font-bold">No links yet</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Your shortened links will show up here with expiry status and click counts.
        </p>
      </section>
    )
  }

  return (
    <section className="glass-panel rounded-[28px] p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Library</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Your links</h2>
        </div>
        <span className="rounded-full bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          {urls.length} total
        </span>
      </div>

      <ul className="space-y-3">
        {urls.map((item) => (
          <LinkRow
            key={item._id}
            item={item}
            selected={selectedId === item._id}
            deleting={deletingId === item._id}
            onDelete={() => onDelete(item._id)}
            onAnalytics={() => onSelectAnalytics(item)}
          />
        ))}
      </ul>
    </section>
  )
}

function LinkRow({ item, selected, deleting, onDelete, onAnalytics }) {
  const active = isActiveUrl(item)

  return (
    <li
      className={`rounded-3xl border p-4 transition sm:p-5 ${
        selected
          ? 'border-brand/40 bg-brand/5'
          : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-brand/25'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge active={active} expiresAt={item.expiresAt} />
            {item.shortCode && (
              <span className="rounded-full bg-[var(--bg-muted)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                /{item.shortCode}
              </span>
            )}
          </div>

          <a
            href={item.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block truncate text-base font-bold hover:text-brand"
          >
            {item.shortUrl}
          </a>
          <p className="mt-1 truncate text-sm text-[var(--text-muted)]" title={item.originalUrl}>
            {item.originalUrl}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className="rounded-full bg-[var(--bg-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            {item.clicks} clicks
          </span>
          <CopyButton value={item.shortUrl} label="Copy" />
          <button
            type="button"
            onClick={onAnalytics}
            className="rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/20"
          >
            Analytics
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-full border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </li>
  )
}

function StatusBadge({ active, expiresAt }) {
  if (!expiresAt) {
    return (
      <span className="rounded-full bg-[var(--bg-muted)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        Unknown
      </span>
    )
  }

  const expiry = new Date(expiresAt)
  const label = active
    ? `Expires ${expiry.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : 'Expired'

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
        active
          ? 'bg-brand/15 text-brand'
          : 'bg-red-500/10 text-red-400'
      }`}
    >
      {label}
    </span>
  )
}
