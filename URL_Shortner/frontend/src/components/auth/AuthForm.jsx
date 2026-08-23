import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    username: '',
    email: '',
    identifier: '',
    password: '',
  })
  const [notice, setNotice] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'signup') {
        return api('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        })
      }
      return api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: form.identifier.trim(),
          password: form.password,
        }),
      })
    },
    onSuccess: (response) => {
      if (mode === 'signup') {
        setNotice('Account created. Log in with your email or username.')
        setMode('login')
        setForm((current) => ({ ...current, password: '' }))
        return
      }
      onAuthenticated(response.data.user)
    },
  })

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const submit = (event) => {
    event.preventDefault()
    setNotice('')
    mutation.mutate()
  }

  return (
    <section className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8" aria-label="Authentication">
      <div className="mb-6 flex rounded-full bg-[var(--bg-muted)] p-1">
        {['login', 'signup'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setMode(tab)
              setNotice('')
            }}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              mode === tab
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab === 'login' ? 'Log in' : 'Sign up free'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <Field label="Username" name="username" value={form.username} onChange={update} autoComplete="username" required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
          </>
        )}

        {mode === 'login' && (
          <div>
            <Field
              label="Email or username"
              name="identifier"
              value={form.identifier}
              onChange={update}
              autoComplete="username"
              placeholder="you@email.com or yourname"
              required
            />
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Use the email address or username you registered with.
            </p>
          </div>
        )}

        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={update}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
        />

        {mutation.error && <Alert tone="error">{mutation.error.message}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="brand-gradient pulse-glow mt-2 w-full rounded-full py-3.5 text-sm font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </section>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3.5 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-brand/60 focus:ring-4 focus:ring-[var(--glow)]"
      />
    </label>
  )
}

function Alert({ tone, children }) {
  const styles =
    tone === 'error'
      ? 'border-red-500/20 bg-red-500/10 text-red-400'
      : 'border-brand/20 bg-brand/10 text-brand'
  return <p className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{children}</p>
}
