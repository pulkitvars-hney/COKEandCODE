import { isActiveUrl } from '../../lib/api'
import Table, { Thead, Tbody, Tr, Th, Td } from '../ui/Table'
import Badge from '../ui/Badge'
import CopyButton from '../ui/CopyButton'
import EmptyState from '../ui/EmptyState'

export default function LinkList({ urls, onDelete, onSelectAnalytics, deletingId }) {
  if (!urls?.length) {
    return (
      <EmptyState
        title="No links yet"
        description="Your shortened links will show up here with expiry status and click counts."
      />
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-doodle)] text-lg font-bold text-[var(--text-primary)]">Your links</h2>
        <span className="text-xs text-[var(--text-muted)]">{urls.length} total</span>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Short URL</Th>
            <Th className="hidden sm:table-cell">Destination</Th>
            <Th className="text-right">Clicks</Th>
            <Th className="hidden md:table-cell">Plan</Th>
            <Th>Status</Th>
            <Th className="hidden lg:table-cell">Expires</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {urls.map((item) => (
            <LinkRow
              key={item._id}
              item={item}
              deleting={deletingId === item._id}
              onDelete={() => onDelete(item._id)}
              onAnalytics={() => onSelectAnalytics(item)}
            />
          ))}
        </Tbody>
      </Table>
    </section>
  )
}

function LinkRow({ item, deleting, onDelete, onAnalytics }) {
  const active = isActiveUrl(item)
  const expiry = item.expiresAt ? new Date(item.expiresAt) : null

  return (
    <Tr>
      <Td>
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-sm font-medium text-[var(--accent)] hover:underline"
        >
          {item.shortCode || item.shortUrl}
        </a>
      </Td>
      <Td className="hidden max-w-[200px] sm:table-cell">
        <span className="block truncate text-sm text-[var(--text-secondary)]" title={item.originalUrl}>
          {item.originalUrl}
        </span>
      </Td>
      <Td className="text-right font-mono text-sm text-[var(--text-primary)]">
        {item.clicks}
      </Td>
      <Td className="hidden md:table-cell">
        <Badge variant={item.plan === 'pro' ? 'pro' : 'free'}>{item.plan}</Badge>
      </Td>
      <Td>
        <StatusBadge active={active} expiresAt={item.expiresAt} />
      </Td>
      <Td className="hidden text-sm text-[var(--text-muted)] lg:table-cell">
        {expiry
          ? active
            ? expiry.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : 'Expired'
          : '—'}
      </Td>
      <Td>
        <div className="flex items-center justify-end gap-1.5">
          <CopyButton value={item.shortUrl} label="Copy" />
          <button
            type="button"
            onClick={onAnalytics}
            className="inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-muted)]"
          >
            Details
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-muted)] disabled:opacity-50"
          >
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </Td>
    </Tr>
  )
}

function StatusBadge({ active, expiresAt }) {
  if (!expiresAt) {
    return <Badge variant="free">Unknown</Badge>
  }

  return <Badge variant={active ? 'active' : 'expired'}>{active ? 'Active' : 'Expired'}</Badge>
}
