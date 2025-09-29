import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewTicketPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')

  return (
    <div className="portal-container">
      <div className="portal-card">
        <h1 className="text-2xl font-semibold">Create Support Ticket</h1>
        <p className="portal-muted text-sm mt-1">Describe your issue and we'll help you out</p>

        <form action="/api/support/tickets" method="post" className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              name="subject"
              required
              placeholder="Brief description of your issue"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              required
              rows={6}
              placeholder="Provide details about your issue..."
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select name="priority" className="border rounded px-3 py-2">
              <option value="LOW">Low</option>
              <option value="MEDIUM" selected>Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Submit Ticket
            </button>
            <a href="/support" className="px-4 py-2 rounded border hover:bg-neutral-50">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
