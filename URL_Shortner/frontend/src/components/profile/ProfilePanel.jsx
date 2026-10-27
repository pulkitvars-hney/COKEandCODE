import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function ProfilePanel({ user }) {
  return <section className="mx-auto max-w-3xl"><h1 className="text-xl font-bold text-[var(--text-primary)]">Your profile</h1><p className="mt-1 text-sm text-[var(--text-secondary)]">A quick view of your Shortly account.</p><Card className="mt-6 overflow-hidden"><div className="bg-[var(--accent-muted)] px-6 py-7"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-bold text-white">{user?.username?.[0]?.toUpperCase() || '?'}</span><h2 className="mt-4 text-xl font-bold text-[var(--text-primary)]">@{user?.username}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{user?.email}</p></div><div className="grid gap-4 p-6 sm:grid-cols-2"><Info label="Username" value={user?.username} /><Info label="Email address" value={user?.email} /></div></Card><Card className="mt-4 p-6"><h2 className="text-base font-bold text-[var(--text-primary)]">Account</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Manage security and session controls from settings.</p><Link to="/settings"><Button variant="secondary" className="mt-4">Open settings</Button></Link></Card></section>
}

function Info({ label, value }) { return <div className="rounded-xl bg-[var(--bg-muted)] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p><p className="mt-1 break-all text-sm font-medium text-[var(--text-primary)]">{value || '—'}</p></div> }
