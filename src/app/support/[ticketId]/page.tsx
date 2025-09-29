import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.ticketId },
    include: {
      user: { select: { name: true, email: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  })

  if (!ticket) return notFound()
  if (ticket.userId !== session.user.id) return notFound()

  return (
    <div className="portal-container">
      <div className="portal-card">
        <div className="flex items-start justify-between">
          <div>
            <Link href="/support" className="text-sm text-blue-600 hover:underline">← Back to tickets</Link>
            <h1 className="text-2xl font-semibold mt-2">{ticket.subject}</h1>
            <p className="portal-muted text-sm mt-1">{ticket.description}</p>
            <div className="flex gap-2 mt-3">
              <span className={`px-2 py-0.5 rounded text-xs ${
                ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                ticket.status === 'WAITING_USER' ? 'bg-yellow-100 text-yellow-800' :
                ticket.status === 'RESOLVED' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                ticket.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                ticket.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ticket.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">Messages</h2>
        <div className="mt-3 space-y-3">
          {ticket.messages.map(msg => (
            <div key={msg.id} className={`border rounded p-4 ${msg.isAdmin ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {msg.isAdmin ? '🛠️ Support Team' : msg.user.name || msg.user.email}
                  </div>
                  <div className="text-sm mt-2 whitespace-pre-wrap">{msg.content}</div>
                </div>
                <div className="text-xs portal-muted ml-4">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
          <form action={`/api/support/tickets/${ticket.id}/messages`} method="post" className="mt-4">
            <textarea
              name="content"
              required
              rows={4}
              placeholder="Type your message..."
              className="w-full border rounded px-3 py-2"
            />
            <button type="submit" className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
