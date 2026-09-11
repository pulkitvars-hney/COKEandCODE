export default function Card({ header, children, className = '', ...props }) {
  return (
    <div
      className={[
        'rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]',
        className,
      ].join(' ')}
      {...props}
    >
      {header && (
        <div className="border-b border-[var(--border)] px-6 py-4">
          {header}
        </div>
      )}
      {children}
    </div>
  )
}
