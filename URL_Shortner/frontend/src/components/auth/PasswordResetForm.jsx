import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function PasswordResetForm({ mode, token }) {
  const isRequest = mode === 'request'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const mutation = useMutation({
    mutationFn: () => isRequest
      ? api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email.trim() }) })
      : api(`/api/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),
    onSuccess: () => {
      if (!isRequest) navigate('/login', { replace: true })
    },
  })

  const submit = (event) => {
    event.preventDefault()
    if (!isRequest && password !== confirmation) return
    mutation.mutate()
  }

  const mismatch = !isRequest && confirmation && password !== confirmation
  const message = mutation.data?.message

  return (
    <div className="w-full max-w-md">
      <Link to="/login" className="mb-5 inline-flex text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)]">← Back to login</Link>
      <section className="rounded-3xl border-2 border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-xl shadow-[rgba(107,39,55,0.12)] sm:p-8">
        <Link to="/" className="text-base font-bold text-[var(--text-primary)]">Shortly</Link>
        <h1 className="mt-7 text-2xl font-bold text-[var(--text-primary)]">{isRequest ? 'Reset your password' : 'Choose a new password'}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{isRequest ? 'Enter your email to request a secure reset link.' : 'Use a strong password you have not used elsewhere.'}</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {isRequest ? <Input label="Email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /> : <>
            <Input label="New password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" helperText="At least 8 characters with upper- and lowercase letters, a number, and a symbol." required />
            <Input label="Confirm new password" name="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" error={mismatch ? 'Passwords do not match' : undefined} required />
          </>}
          {mutation.error && <p className="rounded-lg border border-[var(--danger)] bg-[var(--danger-muted)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">{mutation.error.message}</p>}
          {message && <p className="rounded-lg border border-[var(--success)] bg-[var(--success-muted)] px-3 py-2 text-sm text-[var(--success)]">{message}</p>}
          <Button type="submit" variant="primary" fullWidth size="lg" loading={mutation.isPending} disabled={mutation.isPending || mismatch}>{isRequest ? 'Send reset link' : 'Save new password'}</Button>
        </form>
      </section>
    </div>
  )
}
