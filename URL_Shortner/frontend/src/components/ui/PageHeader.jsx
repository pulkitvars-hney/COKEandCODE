export default function PageHeader({ title, description, action, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className,
      ].join(' ')}
    >
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
