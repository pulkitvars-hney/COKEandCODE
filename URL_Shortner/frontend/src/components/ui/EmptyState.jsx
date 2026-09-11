export default function EmptyState({ title, description, action, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center py-16 text-center',
        className,
      ].join(' ')}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-muted)]">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-[var(--text-muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
