import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ConfirmButton from '@/components/admin/confirm-button'

export default async function AdminUserProfilePage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const role = (session.user as any).role
  if (role !== 'SUPERADMIN') return notFound()

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      ownedWorkspaces: {
        select: {
          id: true,
          name: true,
          plan: true,
          planExpiresAt: true,
          pets: { select: { id: true } },
          members: { select: { id: true } },
        },
      },
      workspaces: {
        select: {
          id: true,
          name: true,
          owner: { select: { name: true, email: true } },
        },
      },
      tickets: {
        select: { id: true, subject: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      petLogs: {
        select: { id: true },
      },
    },
  })

  if (!user) return notFound()

  return (
    <div className="portal-container">
      <div className="portal-card">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Back to admin</Link>
        <div className="mt-4">
          <h1 className="text-2xl font-semibold">{user.name || 'Unnamed User'}</h1>
          <p className="portal-muted text-sm mt-1">{user.email}</p>
          <div className="flex gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
              {user.role}
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
              {user.ownedWorkspaces.length} household{user.ownedWorkspaces.length !== 1 ? 's' : ''}
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
              {user.petLogs.length} logs
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="md:col-span-2 space-y-4">
          <div className="portal-card">
            <h2 className="portal-section-title">Owned Households</h2>
            {user.ownedWorkspaces.length === 0 ? (
              <p className="text-sm portal-muted mt-2">No households owned</p>
            ) : (
              <div className="mt-3 space-y-2">
                {user.ownedWorkspaces.map(ws => (
                  <Link
                    key={ws.id}
                    href={`/admin/workspaces/${ws.id}`}
                    className="block border rounded bg-white p-3 hover:bg-neutral-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{ws.name}</div>
                        <div className="text-xs portal-muted mt-1">
                          {ws.pets.length} pets · {ws.members.length} members
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${ws.plan === 'PREMIUM' && (!ws.planExpiresAt || new Date(ws.planExpiresAt) > new Date()) ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {ws.plan === 'PREMIUM' && (!ws.planExpiresAt || new Date(ws.planExpiresAt) > new Date()) ? '⭐ PREMIUM' : 'FREE'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="portal-card">
            <h2 className="portal-section-title">Member Of</h2>
            {user.workspaces.length === 0 ? (
              <p className="text-sm portal-muted mt-2">Not a member of any households</p>
            ) : (
              <div className="mt-3 space-y-2">
                {user.workspaces.map(ws => (
                  <div key={ws.id} className="border rounded bg-white p-3">
                    <div className="font-medium">{ws.name}</div>
                    <div className="text-xs portal-muted mt-1">
                      Owner: {ws.owner.name || ws.owner.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="portal-card">
            <h2 className="portal-section-title">Recent Support Tickets</h2>
            {user.tickets.length === 0 ? (
              <p className="text-sm portal-muted mt-2">No support tickets</p>
            ) : (
              <div className="mt-3 space-y-2">
                {user.tickets.map(ticket => (
                  <Link
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="block border rounded bg-white p-3 hover:bg-neutral-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{ticket.subject}</div>
                        <div className="text-xs portal-muted mt-1">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ml-2 ${
                        ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'WAITING_USER' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'RESOLVED' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="portal-card">
            <h2 className="portal-section-title">User Details</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <div className="portal-muted">User ID</div>
                <div className="font-mono text-xs">{user.id}</div>
              </div>
              <div>
                <div className="portal-muted">Email</div>
                <div>{user.email}</div>
              </div>
              <div>
                <div className="portal-muted">Name</div>
                <div>{user.name || 'Not set'}</div>
              </div>
              <div>
                <div className="portal-muted">Role</div>
                <div>{user.role}</div>
              </div>
              <div>
                <div className="portal-muted">Joined</div>
                <div>{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="portal-muted">Has Password</div>
                <div>{user.passwordHash ? 'Yes' : 'No (OAuth only)'}</div>
              </div>
            </div>
          </div>

          <div className="portal-card">
            <h2 className="portal-section-title">User Actions</h2>
            <div className="mt-3 space-y-2">
              <form action={`/api/admin/users/reset-password`} method="post">
                <input type="hidden" name="userId" value={user.id} />
                <ConfirmButton message="Reset this user's password?">
                  <button type="submit" className="w-full text-left px-3 py-2 rounded border hover:bg-neutral-50 text-sm">
                    Reset Password
                  </button>
                </ConfirmButton>
              </form>

              <form action={`/api/admin/users/toggle-role`} method="post">
                <input type="hidden" name="userId" value={user.id} />
                <ConfirmButton message={`${user.role === 'SUPERADMIN' ? 'Remove' : 'Grant'} admin privileges?`}>
                  <button type="submit" className="w-full text-left px-3 py-2 rounded border hover:bg-neutral-50 text-sm">
                    {user.role === 'SUPERADMIN' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </ConfirmButton>
              </form>
            </div>
          </div>

          <div className="portal-card bg-red-50 border-red-200">
            <h2 className="portal-section-title text-red-800">Danger Zone</h2>
            <p className="text-xs portal-muted mt-1">Irreversible actions</p>
            <div className="mt-3">
              <form action={`/api/admin/users/delete`} method="post">
                <input type="hidden" name="userId" value={user.id} />
                <ConfirmButton message="Permanently delete this user and all their data? This cannot be undone.">
                  <button type="submit" className="w-full px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700">
                    Delete User
                  </button>
                </ConfirmButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
