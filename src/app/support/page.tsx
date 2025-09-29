import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function SupportPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { messages: { select: { id: true } } },
  })

  return (
    <div className="portal-container">
      <div className="portal-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Support</h1>
            <p className="portal-muted text-sm mt-1">Get help with petHub</p>
          </div>
          <Link href="/support/new" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            New Ticket
          </Link>
        </div>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">Your Tickets</h2>
        {tickets.length === 0 ? (
          <p className="portal-muted text-sm mt-2">No tickets yet. Create one if you need help!</p>
        ) : (
          <div className="mt-3 space-y-2">
            {tickets.map(t => (
              <Link
                key={t.id}
                href={`/support/${t.id}`}
                className="block border rounded bg-white p-4 hover:bg-neutral-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-sm portal-muted mt-1">{t.description.slice(0, 100)}{t.description.length > 100 ? '...' : ''}</div>
                    <div className="text-xs portal-muted mt-2">
                      {t.messages.length} {t.messages.length === 1 ? 'message' : 'messages'} · {new Date(t.createdAt).toLocaleDateString()}
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
