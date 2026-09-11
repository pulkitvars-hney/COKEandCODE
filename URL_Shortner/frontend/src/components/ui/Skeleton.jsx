export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={['animate-pulse rounded-md bg-[var(--bg-muted)]', className].join(' ')}
      aria-hidden="true"
      {...props}
    />
  )
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={['space-y-2', className].join(' ')} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={[
        'rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6',
        className,
      ].join(' ')}
      aria-hidden="true"
    >
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-2 h-6 w-48" />
      <SkeletonText lines={2} className="mt-4" />
    </div>
  )
}
