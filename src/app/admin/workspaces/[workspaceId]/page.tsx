import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ConfirmButton from '@/components/admin/confirm-button'

export default async function AdminWorkspacePage({ params }: { params: { workspaceId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const role = (session.user as any).role
  if (role !== 'SUPERADMIN') return notFound()

  const ws = await prisma.workspace.findUnique({
    where: { id: params.workspaceId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { select: { id: true, name: true, email: true } },
      pets: { select: { id: true, name: true } },
    },
  })
  if (!ws) return notFound()

  const logs = await prisma.petLog.findMany({
    where: { pet: { workspaceId: ws.id } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { name: true, email: true } }, pet: { select: { name: true } } },
  })

  const allWorkspaces = await prisma.workspace.findMany({ select: { id: true, name: true } })

  return (
    <div className="portal-container">
      <div className="portal-card">
        <h1 className="text-2xl font-semibold">{ws.name}</h1>
        <p className="portal-muted text-sm mt-1">
          Owner: {ws.owner.name || ws.owner.email} · {ws.owner.email} · ID: {ws.owner.id}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="portal-card">
          <h2 className="portal-section-title">Users</h2>
          <ul className="mt-2 space-y-2">
            <li className="border rounded bg-white p-3"><strong>Owner:</strong> {ws.owner.name || ws.owner.email} · {ws.owner.email} · ID: {ws.owner.id}</li>
            {ws.members.map(m => (
              <li key={m.id} className="border rounded bg-white p-3 flex items-center justify-between">
                <div>{m.name || m.email} · {m.email} · ID: {m.id}</div>
                <form action={`/api/admin/workspaces/${ws.id}/disconnect`} method="post">
                  <input type="hidden" name="userId" value={m.id} />
                  <ConfirmButton message="Disconnect this user from the household?">
                    <button className="text-red-600 underline text-sm" type="submit">Disconnect</button>
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
          <form action={`/api/admin/workspaces/${ws.id}/connect`} method="post" className="mt-3 flex gap-2">
            <input name="userId" placeholder="User ID" className="border rounded px-2 py-1 flex-1" />
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Connect</button>
          </form>
        </div>

        <div className="portal-card">
          <h2 className="portal-section-title">Add Log</h2>
          <form action="/api/admin/logs" method="post" className="mt-2 space-y-2">
            <input type="hidden" name="workspaceId" value={ws.id} />
            <label className="block text-sm">Pet
              <select name="petId" className="w-full border rounded px-2 py-1 mt-1">
                {ws.pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">Type
              <select name="type" className="w-full border rounded px-2 py-1 mt-1">
                <option value="PEE">PEE</option>
                <option value="POOP">POOP</option>
                <option value="FEEDING">FEEDING</option>
                <option value="MEDICATION">MEDICATION</option>
                <option value="VET_VISIT">VET_VISIT</option>
                <option value="WALK">WALK</option>
                <option value="PLAY">PLAY</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>
            <input name="notes" placeholder="Notes (optional)" className="w-full border rounded px-2 py-1" />
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Add Log</button>
          </form>
        </div>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">Logs</h2>
        <ul className="mt-2 space-y-2">
          {logs.map(l => (
            <li key={l.id} className="border rounded bg-white p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{l.type} · {l.pet?.name}</div>
                <div className="text-xs portal-muted">{l.user?.name || l.user?.email} · {new Date(l.createdAt).toLocaleString()}</div>
              </div>
              <form action={`/api/admin/logs/${l.id}`} method="post" className="ml-4">
                <input type="hidden" name="_method" value="DELETE" />
                <ConfirmButton message="Delete this log? This cannot be undone.">
                  <button className="text-red-600 underline text-sm" type="submit">Delete</button>
                </ConfirmButton>
              </form>
            </li>
          ))}
          {logs.length === 0 && <li className="text-sm portal-muted">No logs.</li>}
        </ul>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">User Security</h2>
        <form action="/api/admin/users/reset-password" method="post" className="mt-2 flex flex-wrap gap-2 items-center">
          <input name="userId" placeholder="User ID" className="border rounded px-2 py-1" />
          <input name="newPassword" placeholder="New password (optional)" className="border rounded px-2 py-1" />
          <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Reset Password</button>
        </form>
        <form action="/api/admin/users/delete-password" method="post" className="mt-2 flex gap-2 items-center">
          <input name="userId" placeholder="User ID" className="border rounded px-2 py-1" />
          <ConfirmButton message="Delete this user's password (they won't be able to sign in)?">
            <button className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm" type="submit">Delete Password</button>
          </ConfirmButton>
        </form>
        <form action="/api/admin/users/delete" method="post" className="mt-2 flex gap-2 items-center">
          <input name="userId" placeholder="User ID" className="border rounded px-2 py-1" />
          <input name="transferToUserId" placeholder="Transfer owned households/logs to User ID (optional)" className="border rounded px-2 py-1 flex-1" />
          <ConfirmButton message="Permanently delete this user? Ensure ownership/logs are transferred.">
            <button className="px-3 py-1.5 rounded bg-red-600 text-white text-sm" type="submit">Delete User</button>
          </ConfirmButton>
        </form>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">Move User to another Household</h2>
        <form action={`/api/admin/workspaces/${ws.id}/disconnect`} method="post" className="mt-2 flex gap-2 items-center">
          <input name="userId" placeholder="User ID" className="border rounded px-2 py-1" />
          <button className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm">Disconnect from current</button>
        </form>
        <form action={`/api/admin/workspaces/${ws.id}/connect`} method="post" className="mt-2 flex gap-2 items-center">
          <input name="userId" placeholder="User ID" className="border rounded px-2 py-1" />
          <select name="targetWorkspaceId" className="border rounded px-2 py-1">
            {allWorkspaces.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Connect</button>
        </form>
        <div className="portal-card mt-4">
          <h2 className="portal-section-title">Danger Zone</h2>
          <p className="portal-muted text-sm mt-1">Delete this household and all associated pets, logs, and invites.</p>
          <form action={`/api/admin/workspaces/${ws.id}/delete`} method="post" className="mt-3">
            <ConfirmButton message="Permanently delete this household and its data? This cannot be undone.">
              <button type="submit" className="px-3 py-1.5 rounded bg-red-600 text-white text-sm">Delete Household</button>
            </ConfirmButton>
          </form>
        </div>
      </div>
    </div>
  )
}
