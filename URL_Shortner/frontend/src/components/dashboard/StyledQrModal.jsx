import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'

const styles = ['minimal', 'geometric', 'nature', 'abstract']

export default function StyledQrModal({ link, onClose }) {
  const [style, setStyle] = useState('minimal')
  const [prompt, setPrompt] = useState('')
  const [foregroundColor, setForegroundColor] = useState('#111827')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [qrCode, setQrCode] = useState(null)
  const [creating, setCreating] = useState(false)

  const saved = useQuery({
    queryKey: ['styledQrCodes', link._id],
    queryFn: async () => (await api(`/api/url/${link._id}/qr/styled`)).data.qrCodes,
  })

  const generate = useMutation({
    mutationFn: () => api(`/api/url/${link._id}/qr/styled`, {
      method: 'POST',
      body: JSON.stringify({ style, prompt: prompt.trim(), foregroundColor, backgroundColor }),
    }),
    onSuccess: (response) => setQrCode(response.data.qrCode),
  })

  const savedQrCode = saved.data?.[saved.data.length - 1]
  const visibleQrCode = qrCode || (!creating ? savedQrCode : null)

  return (
    <Modal open={Boolean(link)} onClose={onClose} title="Styled QR code" className="max-w-lg">
      {saved.isLoading ? <p className="text-sm text-[var(--text-muted)]">Loading saved QR designs…</p> : visibleQrCode ? (
        <div className="space-y-4">
          <img src={visibleQrCode.url} alt={`Styled QR code for ${link.shortCode}`} className="mx-auto aspect-square w-full max-w-sm" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setCreating(true); setQrCode(null) }} className="inline-flex h-9 items-center rounded-md border border-[var(--border)] px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">Create another</button>
            <a href={visibleQrCode.url} download="shortly-styled-qr.png" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-md border border-[var(--border)] px-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">Download PNG</a>
            <Button type="button" onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); generate.mutate() }}>
          <p className="text-sm text-[var(--text-secondary)]">Artwork decorates the frame only. The center remains a verified, scannable QR code.</p>
          <label className="block text-sm font-medium text-[var(--text-primary)]">Style
            <select value={style} onChange={(event) => setStyle(event.target.value)} className="mt-1 block h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-sm">
              {styles.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <Input label="Artwork prompt (optional)" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={160} placeholder="e.g. navy and silver geometric artwork" />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-[var(--text-primary)]">Foreground<input type="color" value={foregroundColor} onChange={(event) => setForegroundColor(event.target.value.toUpperCase())} className="mt-1 block h-9 w-full" /></label>
            <label className="text-sm font-medium text-[var(--text-primary)]">Background<input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value.toUpperCase())} className="mt-1 block h-9 w-full" /></label>
          </div>
          {generate.error && <p role="alert" className="rounded-md border border-[var(--danger)] bg-[var(--danger-muted)] px-3 py-2 text-sm text-[var(--danger)]">{generate.error.message}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={generate.isPending} disabled={generate.isPending}>{generate.isPending ? 'Generating…' : 'Generate styled QR'}</Button></div>
        </form>
      )}
    </Modal>
  )
}
