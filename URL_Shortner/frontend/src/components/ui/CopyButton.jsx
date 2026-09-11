import { useState } from 'react'

export default function CopyButton({ value, className = '', label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}
