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
import Sidebar from './components/layout/Sidebar'

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
      </Route>

      <Route element={<ProtectedRoute user={user} />}>
        <Route element={<AppShell user={user} onLogout={() => logout.mutate()} loggingOut={logout.isPending} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/analytics/:id" element={<AnalyticsPage />} />
          <Route path="/subscription" element={<SubscriptionPanel />} />
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

function AppShell({ user, onLogout, loggingOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)]">
      <TopBar
        user={user}
        onLogout={onLogout}
        loggingOut={loggingOut}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
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
      <ShortenForm
        activeCount={activeCount}
        maxActive={MAX_ACTIVE_URLS}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['urls'] })}
      />
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
