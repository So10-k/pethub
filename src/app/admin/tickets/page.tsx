import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminTicketsPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const role = (session.user as any).role
  if (role !== 'SUPERADMIN') return notFound()

  const statusFilter = searchParams.status || 'all'
  const where = statusFilter === 'all' ? {} : { status: statusFilter as any }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      messages: { select: { id: true } },
    },
  })

  const counts = await prisma.ticket.groupBy({
    by: ['status'],
    _count: true,
  })

  const statusCounts = counts.reduce((acc, c) => ({ ...acc, [c.status]: c._count }), {} as Record<string, number>)

  return (
    <div className="portal-container">
      <div className="portal-card">
        <h1 className="text-2xl font-semibold">Support Tickets</h1>
        <p className="portal-muted text-sm mt-1">Manage user support requests</p>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Link
            href="/admin/tickets"
            className={`px-3 py-1.5 rounded text-sm ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'border hover:bg-neutral-50'}`}
          >
            All ({tickets.length})
          </Link>
          <Link
            href="/admin/tickets?status=OPEN"
            className={`px-3 py-1.5 rounded text-sm ${statusFilter === 'OPEN' ? 'bg-green-600 text-white' : 'border hover:bg-neutral-50'}`}
          >
            Open ({statusCounts.OPEN || 0})
          </Link>
          <Link
            href="/admin/tickets?status=IN_PROGRESS"
            className={`px-3 py-1.5 rounded text-sm ${statusFilter === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'border hover:bg-neutral-50'}`}
          >
            In Progress ({statusCounts.IN_PROGRESS || 0})
          </Link>
          <Link
            href="/admin/tickets?status=WAITING_USER"
            className={`px-3 py-1.5 rounded text-sm ${statusFilter === 'WAITING_USER' ? 'bg-yellow-600 text-white' : 'border hover:bg-neutral-50'}`}
          >
            Waiting ({statusCounts.WAITING_USER || 0})
          </Link>
          <Link
            href="/admin/tickets?status=RESOLVED"
            className={`px-3 py-1.5 rounded text-sm ${statusFilter === 'RESOLVED' ? 'bg-purple-600 text-white' : 'border hover:bg-neutral-50'}`}
          >
            Resolved ({statusCounts.RESOLVED || 0})
          </Link>
        </div>
      </div>

      <div className="portal-card mt-4">
        {tickets.length === 0 ? (
          <p className="portal-muted text-sm">No tickets found.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map(t => (
              <Link
                key={t.id}
                href={`/admin/tickets/${t.id}`}
                className="block border rounded bg-white p-4 hover:bg-neutral-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-sm portal-muted mt-1">
                      {t.user.name || t.user.email} · {t.messages.length} messages · {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      t.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      t.status === 'WAITING_USER' ? 'bg-yellow-100 text-yellow-800' :
                      t.status === 'RESOLVED' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      t.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      t.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      t.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
