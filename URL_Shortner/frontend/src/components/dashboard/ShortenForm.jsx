import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
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
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-doodle)] text-sm text-[var(--accent)]">Create link</p>
          <h2 className="mt-0.5 text-lg font-bold text-[var(--text-primary)]">Paste. Personalize. Share.</h2>
        </div>
        <UsageBadge active={activeCount} max={maxActive} />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Long URL"
          type="url"
          value={originalUrl}
          onChange={(event) => setOriginalUrl(event.target.value)}
          placeholder="https://your-long-link.com/page"
          required
          disabled={atLimit}
        />

        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-muted)] p-3">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={useAlias}
              onChange={(event) => setUseAlias(event.target.checked)}
              disabled={atLimit}
              className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
            />
            <span className="text-sm font-medium text-[var(--text-primary)]">Use a custom alias</span>
          </label>

          {useAlias && (
            <div className="mt-3">
              <Input
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder="my-launch"
                pattern="[a-zA-Z0-9_-]{3,30}"
                title="3–30 characters: letters, numbers, hyphens, underscores"
                required={useAlias}
                disabled={atLimit}
                helperText="Aliases are lowercase, globally unique, and 3–30 characters."
              />
            </div>
          )}
        </div>

        {atLimit && (
          <p className="rounded-md border border-[var(--warning)] bg-[var(--warning-muted)] px-3 py-2 text-sm text-[var(--warning)]">
            You have reached the {maxActive}-link active limit. Delete an active link or wait for one to expire.
          </p>
        )}

        {createMutation.error && (
          <p className="rounded-md border border-[var(--danger)] bg-[var(--danger-muted)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
            {createMutation.error.message}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={createMutation.isPending}
          disabled={createMutation.isPending || atLimit}
        >
          {createMutation.isPending ? 'Creating…' : 'Create short link'}
        </Button>
      </form>

      {createdUrl && (
        <Card className="mt-5 border-[var(--accent)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Your new link</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={createdUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 truncate font-mono text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
            >
              {createdUrl}
            </a>
            <CopyButton value={createdUrl} className="shrink-0" />
          </div>
        </Card>
      )}
    </Card>
  )
}

function UsageBadge({ active, max }) {
  const ratio = active / max
  const variant = ratio >= 1 ? 'expired' : ratio >= 0.75 ? 'warning' : 'active'

  return (
    <Badge variant={variant}>
      {active} / {max} active
    </Badge>
  )
}
