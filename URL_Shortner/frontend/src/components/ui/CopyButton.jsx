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
      className={`rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-brand/50 hover:text-brand ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}
