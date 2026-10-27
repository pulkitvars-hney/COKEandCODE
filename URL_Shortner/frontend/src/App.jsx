import { useState } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, countActiveUrls, getCurrentUser, MAX_ACTIVE_URLS } from './lib/api'
import AuthForm from './components/auth/AuthForm'
import LandingHero from './components/landing/DoodleLanding'
import ShortenForm from './components/dashboard/ShortenForm'
import LinkList from './components/dashboard/LinkList'
import AnalyticsPanel from './components/analytics/AnalyticsPanel'
import SubscriptionPanel from './components/subscription/SubscriptionPanel'
import ExpiredPage from './components/ui/ExpiredPage'
import TopBar from './components/layout/TopBar'
import SettingsPanel from './components/settings/SettingsPanel'
import ProfilePanel from './components/profile/ProfilePanel'
import PasswordResetForm from './components/auth/PasswordResetForm'

export default function App() {
  const queryClient = useQueryClient()

  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  })

  const logout = useMutation({
    mutationFn: () => api('/api/auth/logout', { method: 'POST' }),
    onSettled: () => {
      queryClient.setQueryData(['currentUser'], null)
      queryClient.removeQueries({ queryKey: ['urls'] })
      queryClient.removeQueries({ queryKey: ['analytics'] })
      queryClient.removeQueries({ queryKey: ['subscription'] })
    },
  })

  if (userQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <p className="text-sm text-[var(--text-muted)]">Checking your session…</p>
      </div>
    )
  }

  const user = userQuery.data

  return (
    <Routes>
      <Route element={<PublicRoute user={user} />}>
        <Route path="/" element={<LandingHeroWrapper />} />
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/signup" element={<SignupPageWrapper />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute user={user} />}>
        <Route element={<AppShell user={user} onLogout={() => logout.mutate()} loggingOut={logout.isPending} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/analytics/:id" element={<AnalyticsPage />} />
          <Route path="/analytics" element={<AnalyticsIndex />} />
          <Route path="/subscription" element={<SubscriptionPanel />} />
          <Route path="/profile" element={<ProfilePanel user={user} />} />
          <Route path="/settings" element={<SettingsPanel user={user} onLogout={() => logout.mutate()} loggingOut={logout.isPending} />} />
        </Route>
      </Route>

      <Route path="/expired" element={<ExpiredPage onGoHome={() => {}} />} />
      <Route path="/404" element={<ExpiredPage onGoHome={() => {}} />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

function PublicRoute({ user }) {
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function ProtectedRoute({ user }) {
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function LandingHeroWrapper() {
  const queryClient = useQueryClient()
  return (
    <LandingHero
      onAuthenticated={(loggedInUser) => {
        queryClient.setQueryData(['currentUser'], loggedInUser)
      }}
    />
  )
}

function LoginPageWrapper() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4">
      <AuthForm
        mode="login"
        onAuthenticated={(loggedInUser) => {
          queryClient.setQueryData(['currentUser'], loggedInUser)
          navigate('/dashboard', { replace: true })
        }}
      />
    </div>
  )
}

function SignupPageWrapper() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4">
      <AuthForm
        mode="signup"
        onAuthenticated={(loggedInUser) => {
          queryClient.setQueryData(['currentUser'], loggedInUser)
          navigate('/dashboard', { replace: true })
        }}
      />
    </div>
  )
}

function ForgotPasswordPage() {
  return <AuthPage><PasswordResetForm mode="request" /></AuthPage>
}

function ResetPasswordPage() {
  const { token } = useParams()
  return <AuthPage><PasswordResetForm mode="reset" token={token} /></AuthPage>
}

function AuthPage({ children }) {
  return <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 py-10">{children}</div>
}

function AppShell({ user, onLogout, loggingOut }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)]">
      <TopBar user={user} onLogout={onLogout} loggingOut={loggingOut} />
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"><Outlet /></main>
    </div>
  )
}

function DashboardPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState(null)

  const urlsQuery = useQuery({
    queryKey: ['urls'],
    queryFn: async () => (await api('/api/url/myurls')).data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api(`/api/url/${id}`, { method: 'DELETE' }),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] })
    },
  })

  const urls = urlsQuery.data || []
  const activeCount = countActiveUrls(urls)

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <div id="shorten" className="scroll-mt-24"><ShortenForm activeCount={activeCount} maxActive={MAX_ACTIVE_URLS} onCreated={() => queryClient.invalidateQueries({ queryKey: ['urls'] })} /></div>
      {urlsQuery.isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading your links…</p>
      ) : urlsQuery.error ? (
        <p className="rounded-md border border-[var(--danger)] bg-[var(--danger-muted)] px-4 py-3 text-sm text-[var(--danger)]">
          {urlsQuery.error.message}
        </p>
      ) : (
        <LinkList
          urls={urls}
          selectedId={null}
          deletingId={deletingId}
          onDelete={(id) => deleteMutation.mutate(id)}
          onSelectAnalytics={(link) => navigate(`/dashboard/analytics/${link._id}`)}
        />
      )}
    </div>
  )
}

function AnalyticsIndex() {
  const navigate = useNavigate()
  const urlsQuery = useQuery({ queryKey: ['urls'], queryFn: async () => (await api('/api/url/myurls')).data })
  if (urlsQuery.isLoading) return <p className="text-sm text-[var(--text-muted)]">Loading your links…</p>
  if (urlsQuery.error) return <p className="rounded-md border border-[var(--danger)] bg-[var(--danger-muted)] px-4 py-3 text-sm text-[var(--danger)]">{urlsQuery.error.message}</p>
  const urls = urlsQuery.data || []
  return <section className="mx-auto max-w-4xl"><h1 className="text-xl font-bold text-[var(--text-primary)]">Analytics</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">Choose a link to explore clicks, visitors, and engagement details.</p>{urls.length === 0 ? <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-secondary)]">Create a short link first to begin collecting analytics.</p> : <div className="mt-6 grid gap-3 sm:grid-cols-2">{urls.map((url) => <button key={url._id} type="button" onClick={() => navigate(`/dashboard/analytics/${url._id}`)} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"><p className="truncate font-mono text-sm font-semibold text-[var(--accent)]">{url.shortCode || url.shortUrl}</p><p className="mt-2 truncate text-sm text-[var(--text-secondary)]">{url.originalUrl}</p><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{url.clicks || 0} clicks</p></button>)}</div>}</section>
}

function AnalyticsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const urlsQuery = useQuery({
    queryKey: ['urls'],
    queryFn: async () => (await api('/api/url/myurls')).data,
  })

  if (urlsQuery.isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading…</p>
  }

  const urls = urlsQuery.data || []
  const link = urls.find((u) => u._id === id)

  if (!link) {
    return <Navigate to="/dashboard" replace />
  }

  return <AnalyticsPanel link={link} onClose={() => navigate('/dashboard')} />
}
