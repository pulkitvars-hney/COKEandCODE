const variants = {
  free: 'bg-[var(--bg-muted)] text-[var(--text-secondary)]',
  pro: 'bg-[var(--accent-muted)] text-[var(--accent)]',
  active: 'bg-[var(--success-muted)] text-[var(--success)]',
  expired: 'bg-[var(--danger-muted)] text-[var(--danger)]',
  warning: 'bg-[var(--warning-muted)] text-[var(--warning)]',
}

export default function Badge({ variant = 'free', children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
