import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function AuthForm({ mode = 'login', onAuthenticated }) {
  const isLogin = mode === 'login'

  const [form, setForm] = useState({
    username: '',
    email: '',
    identifier: '',
    password: '',
  })
  const [notice, setNotice] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isLogin) {
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
      if (!isLogin) {
        setNotice('Account created. Log in with your email or username.')
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
    <div className="w-full max-w-md">
      {/* Back to home */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to home
      </Link>

      {/* Branding + heading */}
      <div className="mb-8">
        <Link to="/" className="mb-5 inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" aria-hidden="true">
              <path fill="currentColor" d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z" />
              <path fill="currentColor" d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z" />
            </svg>
          </span>
          <span className="text-base font-bold text-[var(--text-primary)]">Shortly</span>
        </Link>

        <h1 className="font-[family-name:var(--font-doodle)] text-3xl font-bold text-[var(--text-primary)]">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          {isLogin
            ? 'Log in to manage your links and analytics.'
            : 'Start shortening links in seconds.'}
        </p>
      </div>

      {/* Form surface */}
      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-4">
          {!isLogin && (
            <>
              <Input
                label="Username"
                name="username"
                value={form.username}
                onChange={update}
                autoComplete="username"
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                autoComplete="email"
                required
              />
            </>
          )}

          {isLogin && (
            <Input
              label="Email or username"
              name="identifier"
              value={form.identifier}
              onChange={update}
              autoComplete="username"
              placeholder="you@email.com or yourname"
              helperText="Use the email address or username you registered with."
              required
            />
          )}

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />

          {mutation.error && (
            <p className="rounded-md border border-[var(--danger)] bg-[var(--danger-muted)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
              {mutation.error.message}
            </p>
          )}
          {notice && (
            <p className="rounded-md border border-[var(--accent)] bg-[var(--accent-muted)] px-3 py-2 text-sm text-[var(--accent)]">
              {notice}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={mutation.isPending}
            disabled={mutation.isPending}
            className="mt-2"
          >
            {mutation.isPending ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
          </Button>
        </form>

        {/* Cross-link */}
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          {isLogin ? (
            <>
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
