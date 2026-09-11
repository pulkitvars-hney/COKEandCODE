import { useId } from 'react'

export default function Input({
  label,
  helperText,
  error,
  compact = false,
  className = '',
  ...props
}) {
  const id = useId()
  const errorId = useId()
  const helperId = useId()

  return (
    <label htmlFor={id} className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={[
          'w-full rounded-md border bg-[var(--bg-surface)] px-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
          'outline-none transition-colors',
          'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] focus:ring-offset-1 focus:ring-offset-[var(--bg-surface)]',
          compact ? 'h-8 text-xs' : 'h-9 text-[13px]',
          error
            ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger-muted)]'
            : 'border-[var(--border)] hover:border-[var(--border-strong)]',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1 text-xs text-[var(--text-muted)]">
          {helperText}
        </p>
      )}
    </label>
  )
}
