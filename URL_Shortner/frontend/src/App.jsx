import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import './App.css'

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
  return data
}

const getCurrentUser = async () => {
  try {
    const response = await api('/api/auth/me')
    return response.data.user
  } catch (error) {
    if (error.message === 'Unauthorized Request' || error.message === 'Invalid or expired access token') return null
    throw error
  }
}

function LinkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a5 5 0 0 0 7.07.01l2.12-2.12a5 5 0 0 0-7.07-7.07l-1.21 1.2" /><path d="M13.4 10.6a5 5 0 0 0-7.07-.01L4.21 12.7a5 5 0 0 0 7.07 7.07l1.2-1.2" /></svg>
}

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', identifier: '', password: '' })
  const [notice, setNotice] = useState('')
  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'signup') return api('/api/auth/signup', { method: 'POST', body: JSON.stringify({ username: form.username, email: form.email, password: form.password }) })
      return api('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier: form.identifier, password: form.password }) })
    },
    onSuccess: (response) => {
      if (mode === 'signup') {
        setNotice('Account created. Please log in to continue.')
        setMode('login')
        setForm((current) => ({ ...current, password: '' }))
      } else onAuthenticated(response.data.user)
    },
  })
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = (event) => { event.preventDefault(); setNotice(''); mutation.mutate() }

  return <section className="auth-card" aria-label="Authentication">
    <div className="auth-toggle"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setNotice('') }}>Log in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setNotice('') }}>Create account</button></div>
    <form onSubmit={submit}>
      {mode === 'signup' && <><label>Username<input name="username" value={form.username} onChange={update} autoComplete="username" required /></label><label>Email<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label></>}
      {mode === 'login' && <label>Email or username<input name="identifier" value={form.identifier} onChange={update} autoComplete="username" required /></label>}
      <label>Password<input name="password" type="password" value={form.password} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
      {mutation.error && <p className="error">{mutation.error.message}</p>}{notice && <p className="success">{notice}</p>}
      <button className="primary-button" disabled={mutation.isPending}>{mutation.isPending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
    </form>
  </section>
}

function Dashboard({ user, onLogout }) {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()
  const urlsQuery = useQuery({ queryKey: ['urls'], queryFn: async () => (await api('/api/url/myurls')).data })
  const createMutation = useMutation({ mutationFn: async (originalUrl) => (await api('/api/url/create', { method: 'POST', body: JSON.stringify({ originalUrl }) })).shortUrl, onSuccess: (created) => { setShortUrl(created); setUrl(''); queryClient.invalidateQueries({ queryKey: ['urls'] }) } })
  const deleteMutation = useMutation({ mutationFn: (id) => api(`/api/url/${id}`, { method: 'DELETE' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['urls'] }) })
  const submit = (event) => { event.preventDefault(); createMutation.mutate(url.trim()) }
  const copy = async (value) => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }

  return <>
    <section className="dashboard-intro"><div><p className="eyebrow"><span /> YOUR LINK WORKSPACE</p><h1>Welcome back,<br /><em>{user.username}.</em></h1><p className="hero-copy">Create short, shareable links and keep your collection in one place.</p></div><button className="text-button" onClick={onLogout}>Log out</button></section>
    <section className="workspace">
      <form className="shorten-card" onSubmit={submit}><label htmlFor="url-input">Paste a long URL</label><div className="input-row"><input id="url-input" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://your-long-link.com/..." required /><button disabled={createMutation.isPending}>{createMutation.isPending ? 'Shortening…' : 'Shorten link →'}</button></div>{createMutation.error && <p className="error">{createMutation.error.message}</p>}{shortUrl && <div className="result"><div><span className="result-label">YOUR SHORT LINK</span><a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a></div><button className="copy-button" type="button" onClick={() => copy(shortUrl)}>{copied ? 'Copied!' : 'Copy link'}</button></div>}</form>
      <section className="links-panel"><div className="panel-heading"><h2>Your links</h2><span>{urlsQuery.data?.length || 0} total</span></div>{urlsQuery.isLoading ? <p className="muted">Loading your links…</p> : urlsQuery.error ? <p className="error">{urlsQuery.error.message}</p> : urlsQuery.data?.length === 0 ? <p className="muted">Your shortened links will appear here.</p> : <ul className="link-list">{urlsQuery.data.map((item) => { const link = item.shortUrl; return <li key={item._id}><div><a href={link} target="_blank" rel="noreferrer">{link}</a><p title={item.originalUrl}>{item.originalUrl}</p></div><div className="link-actions"><span>{item.clicks} clicks</span><button onClick={() => copy(link)}>Copy</button><button className="delete" onClick={() => deleteMutation.mutate(item._id)} disabled={deleteMutation.isPending}>Delete</button></div></li> })}</ul>}</section>
    </section>
  </>
}

function App() {
  const queryClient = useQueryClient()
  const userQuery = useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser })
  const logout = useMutation({ mutationFn: () => api('/api/auth/logout', { method: 'POST' }), onSettled: () => { queryClient.setQueryData(['currentUser'], null); queryClient.removeQueries({ queryKey: ['urls'] }) } })
  const user = userQuery.data
  return <main className="page-shell"><nav className="nav"><a className="brand" href="#top"><span className="brand-mark"><LinkIcon /></span>shortly</a>{user && <span className="user-name">@{user.username}</span>}</nav>{userQuery.isLoading ? <p className="loading">Checking your session…</p> : user ? <Dashboard user={user} onLogout={() => logout.mutate()} /> : <section className="hero" id="top"><p className="eyebrow"><span /> SIMPLE LINKS, BIG IMPACT</p><h1>Make every link<br /><em>count.</em></h1><p className="hero-copy">Turn long, messy URLs into short links that are easy to share and simple to manage.</p><AuthForm onAuthenticated={(loggedInUser) => queryClient.setQueryData(['currentUser'], loggedInUser)} /></section>}<footer>© 2026 shortly <span>·</span> Built for sharing</footer></main>
}

export default App
