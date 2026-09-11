export default function Table({ children, className = '' }) {
  return (
    <div className={['overflow-x-auto', className].join(' ')}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function Thead({ children, className = '' }) {
  return (
    <thead
      className={[
        'border-b-2 border-[var(--border)] bg-[var(--bg-muted)]',
        className,
      ].join(' ')}
    >
      {children}
    </thead>
  )
}

export function Tbody({ children }) {
  return <tbody>{children}</tbody>
}

export function Tr({ selected = false, className = '', ...props }) {
  return (
    <tr
      className={[
        'border-b border-[var(--border)] transition-colors',
        selected ? 'bg-[var(--accent-muted)]' : 'hover:bg-[var(--bg-hover)]',
        className,
      ].join(' ')}
      {...props}
    >
      {props.children}
    </tr>
  )
}

export function Th({ className = '', ...props }) {
  return (
    <th
      className={[
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]',
        className,
      ].join(' ')}
      {...props}
    />
  )
}

export function Td({ className = '', ...props }) {
  return (
    <td
      className={['px-4 py-3 text-[var(--text-primary)]', className].join(' ')}
      {...props}
    />
  )
}
