import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, countActiveUrls, getCurrentUser, MAX_ACTIVE_URLS } from './lib/api'
import LandingHero from './components/landing/LandingHero'
import ShortenForm from './components/dashboard/ShortenForm'
import LinkList from './components/dashboard/LinkList'
import AnalyticsPanel from './components/analytics/AnalyticsPanel'
import SubscriptionPanel from './components/subscription/SubscriptionPanel'
import ThemeToggle from './components/ui/ThemeToggle'
import ExpiredPage from './components/ui/ExpiredPage'

const tabs = [
  { id: 'links', label: 'Links', icon: '⌁' },
  { id: 'plan', label: 'Plan', icon: '◈' },
]

export default function App() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('links')
  const [selectedLink, setSelectedLink] = useState(null)
  const [isExpiredPage, setIsExpiredPage] = useState(() => 
    window.location.pathname === '/expired' || window.location.pathname === '/404'
  )

  useEffect(() => {
    const handlePopState = () => {
      setIsExpiredPage(window.location.pathname === '/expired' || window.location.pathname === '/404')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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
      setSelectedLink(null)
      setActiveTab('links')
    },
  })

  const user = userQuery.data

  if (isExpiredPage) {
    return (
      <ExpiredPage
        onGoHome={() => {
          window.history.pushState({}, '', '/')
          setIsExpiredPage(false)
        }}
      />
    )
  }

  if (userQuery.isLoading) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Checking your session…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <LandingHero
        onAuthenticated={(loggedInUser) => {
          queryClient.setQueryData(['currentUser'], loggedInUser)
        }}
      />
    )
  }

  return (
    <Dashboard
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedLink={selectedLink}
      onSelectLink={setSelectedLink}
      onLogout={() => logout.mutate()}
      loggingOut={logout.isPending}
    />
  )
}

function Dashboard({ user, activeTab, onTabChange, selectedLink, onSelectLink, onLogout, loggingOut }) {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState(null)

  const urlsQuery = useQuery({
    queryKey: ['urls'],
    queryFn: async () => (await api('/api/url/myurls')).data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api(`/api/url/${id}`, { method: 'DELETE' }),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: (_, id) => {
      if (selectedLink?._id === id) onSelectLink(null)
      queryClient.invalidateQueries({ queryKey: ['urls'] })
    },
  })

  const urls = urlsQuery.data || []
  const activeCount = countActiveUrls(urls)

  return (
    <div className="page-bg min-h-screen lg:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-glass)] px-5 py-6 backdrop-blur-xl lg:flex">
        <Brand />
        <nav className="mt-8 space-y-2">
          {tabs.map((tab) => (
            <SidebarButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => {
                onTabChange(tab.id)
                if (tab.id !== 'links') onSelectLink(null)
              }}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </SidebarButton>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Signed in</p>
            <p className="mt-1 truncate text-sm font-bold">@{user.username}</p>
            <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="flex-1 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:opacity-60"
            >
              {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg-glass)] px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Workspace</p>
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {activeTab === 'plan' ? 'Your subscription' : selectedLink ? 'Link analytics' : 'Your link studio'}
              </h1>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]"
              >
                Exit
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2 lg:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onTabChange(tab.id)
                  if (tab.id !== 'links') onSelectLink(null)
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-100 ${
                  activeTab === tab.id
                    ? 'bg-brand text-black border-2 border-[var(--text-primary)] shadow-neo-sm translate-x-[-1px] translate-y-[-1px]'
                    : 'border-2 border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          {activeTab === 'plan' ? (
            <SubscriptionPanel />
          ) : selectedLink ? (
            <AnalyticsPanel link={selectedLink} onClose={() => onSelectLink(null)} />
          ) : (
            <div className="mx-auto grid max-w-6xl gap-6">
              <ShortenForm
                activeCount={activeCount}
                maxActive={MAX_ACTIVE_URLS}
                onCreated={() => queryClient.invalidateQueries({ queryKey: ['urls'] })}
              />
              {urlsQuery.isLoading ? (
                <p className="text-sm text-[var(--text-muted)]">Loading your links…</p>
              ) : urlsQuery.error ? (
                <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {urlsQuery.error.message}
                </p>
              ) : (
                <LinkList
                  urls={urls}
                  selectedId={selectedLink?._id}
                  deletingId={deletingId}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onSelectAnalytics={(link) => onSelectLink(link)}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function Brand({ compact = false }) {
  return (
    <a href="#top" className={`flex items-center gap-3 font-extrabold tracking-tight ${compact ? 'text-base' : 'text-lg'}`}>
      <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-black">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M10.59 13.41a1 1 0 0 0 1.42 0l2.83-2.83a4 4 0 1 0-5.66-5.66l-1.42 1.41a1 1 0 1 0 1.42 1.42l1.41-1.41a2 2 0 1 1 2.83 2.83l-2.83 2.83a1 1 0 0 0 0 1.42Z"
          />
          <path
            fill="currentColor"
            d="M13.41 10.59a1 1 0 0 0-1.42 0L9.16 13.42a4 4 0 1 0 5.66 5.66l1.42-1.41a1 1 0 0 0-1.42-1.42l-1.41 1.41a2 2 0 1 1-2.83-2.83l2.83-2.83a1 1 0 0 0 0-1.42Z"
          />
        </svg>
      </span>
      shortly
    </a>
  )
}

function SidebarButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-100 border-2 ${
        active
          ? 'bg-brand text-black border-[var(--text-primary)] shadow-neo-sm translate-x-[-1px] translate-y-[-1px]'
          : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--text-primary)] hover:shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px]'
      }`}
    >
      {children}
    </button>
  )
}
