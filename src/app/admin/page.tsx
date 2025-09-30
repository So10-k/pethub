import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import UserSearchModal from '@/components/admin/user-search-modal'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const role = (session.user as any).role
  if (role !== 'SUPERADMIN') return notFound()

  const [users, workspaces, pets, logs, invites, recentUsers, recentLogs, allWorkspaces] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.pet.count(),
    prisma.petLog.count(),
    prisma.invite.count(),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.petLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { name: true, email: true } }, pet: { select: { name: true } } } }),
    prisma.workspace.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true, owner: { select: { email: true, name: true } }, pets: { select: { id: true } } } }),
  ])

  return (
    <div className="portal-container">
      <div className="portal-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="portal-muted text-sm mt-1">Platform overview and tools</p>
          </div>
          <UserSearchModal />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
          <StatCard label="Users" value={users} />
          <StatCard label="Households" value={workspaces} />
          <StatCard label="Pets" value={pets} />
          <StatCard label="Logs" value={logs} />
          <StatCard label="Invites" value={invites} />
        </div>
        <div className="mt-4">
          <Link href="/admin/maintenance" className="inline-block px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700">
            🔧 Maintenance Mode
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="portal-card">
          <h2 className="portal-section-title">Recent signups</h2>
          <ul className="mt-2 space-y-2">
            {recentUsers.map(u => (
              <li key={u.id} className="flex items-center justify-between border rounded bg-white p-3">
                <div>
                  <div className="font-medium">{u.name || u.email || u.id}</div>
                  <div className="text-xs portal-muted">{new Date(u.createdAt).toLocaleString()}</div>
                </div>
              </li>
            ))}
            {recentUsers.length === 0 && <li className="text-sm portal-muted">No users yet.</li>}
          </ul>
        </div>
        <div className="portal-card">
          <h2 className="portal-section-title">Recent logs</h2>
          <ul className="mt-2 space-y-2">
            {recentLogs.map(l => (
              <li key={l.id} className="flex items-center justify-between border rounded bg-white p-3">
                <div>
                  <div className="font-medium">{l.type} · {l.pet?.name}</div>
                  <div className="text-xs portal-muted">{l.user?.name || l.user?.email} · {new Date(l.createdAt).toLocaleString()}</div>
                </div>
              </li>
            ))}
            {recentLogs.length === 0 && <li className="text-sm portal-muted">No logs yet.</li>}
          </ul>
        </div>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">Households</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left portal-muted">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Owner</th>
                <th className="py-2 pr-4">Pets</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allWorkspaces.map(w => (
                <tr key={w.id} className="border-t">
                  <td className="py-2 pr-4">{w.name}</td>
                  <td className="py-2 pr-4">{w.owner.name || w.owner.email}</td>
                  <td className="py-2 pr-4">{w.pets.length}</td>
                  <td className="py-2 pr-4">
                    <Link href={`/admin/workspaces/${w.id}`} className="text-blue-700 underline">View</Link>
                  </td>
                </tr>
              ))}
              {allWorkspaces.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-2 portal-muted">No households found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded bg-white p-4">
      <div className="text-sm portal-muted">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
