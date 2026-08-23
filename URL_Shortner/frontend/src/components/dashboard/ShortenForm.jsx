import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import CopyButton from '../ui/CopyButton'

export default function ShortenForm({ activeCount, maxActive, onCreated }) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [useAlias, setUseAlias] = useState(false)
  const [createdUrl, setCreatedUrl] = useState('')

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = { originalUrl: originalUrl.trim() }
      if (useAlias && alias.trim()) payload.alias = alias.trim()
      const response = await api('/api/url/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      return response.shortUrl
    },
    onSuccess: (shortUrl) => {
      setCreatedUrl(shortUrl)
      setOriginalUrl('')
      setAlias('')
      setUseAlias(false)
      onCreated?.()
    },
  })

  const atLimit = activeCount >= maxActive

  const submit = (event) => {
    event.preventDefault()
    createMutation.mutate()
  }

  return (
    <section className="card-neo rounded-[28px] p-5 sm:p-7 shadow-neo-md hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Create link</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Paste. Personalize. Share.</h2>
        </div>
        <UsageBadge active={activeCount} max={maxActive} />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Long URL
          </span>
          <input
            type="url"
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
            placeholder="https://your-long-link.com/page"
            required
            disabled={atLimit}
            className="w-full rounded-2xl input-neo px-4 py-3.5 outline-none transition focus:ring-4 focus:ring-[var(--glow)] disabled:opacity-60"
          />
        </label>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-muted)] p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={useAlias}
              onChange={(event) => setUseAlias(event.target.checked)}
              disabled={atLimit}
              className="h-4 w-4 rounded border-[var(--border)] accent-brand"
            />
            <span className="text-sm font-semibold">Use a custom alias</span>
          </label>

          {useAlias && (
            <div className="mt-3">
              <input
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder="my-launch"
                pattern="[a-zA-Z0-9_-]{3,30}"
                title="3–30 characters: letters, numbers, hyphens, underscores"
                required={useAlias}
                disabled={atLimit}
                className="w-full rounded-xl input-neo px-4 py-3 outline-none transition focus:ring-4 focus:ring-[var(--glow)]"
              />
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Aliases are lowercase, globally unique, and 3–30 characters.
              </p>
            </div>
          )}
        </div>

        {atLimit && (
          <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            You have reached the {maxActive}-link active limit. Delete an active link or wait for one to expire.
          </p>
        )}

        {createMutation.error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {createMutation.error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={createMutation.isPending || atLimit}
          className="w-full rounded-full py-3.5 text-sm font-bold btn-neo-primary"
        >
          {createMutation.isPending ? 'Creating…' : 'Create short link'}
        </button>
      </form>

      {createdUrl && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border-2 border-[var(--text-primary)] bg-brand/10 p-4 sm:flex-row sm:items-center sm:justify-between shadow-neo-sm">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Your new link</p>
            <a
              href={createdUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block truncate font-semibold text-[var(--text-primary)] hover:text-brand"
            >
              {createdUrl}
            </a>
          </div>
          <CopyButton value={createdUrl} className="shrink-0 bg-[var(--bg-elevated)]" />
        </div>
      )}
    </section>
  )
}

function UsageBadge({ active, max }) {
  const ratio = active / max
  const tone =
    ratio >= 1 ? 'text-red-400' : ratio >= 0.75 ? 'text-amber-300' : 'text-brand'

  return (
    <div className="rounded-full border-2 border-[var(--text-primary)] bg-[var(--bg-elevated)] px-4 py-2 text-sm shadow-neo-sm">
      <span className={`font-bold ${tone}`}>{active}</span>
      <span className="text-[var(--text-muted)]"> / {max} active links</span>
    </div>
  )
}
