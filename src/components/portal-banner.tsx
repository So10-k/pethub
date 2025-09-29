import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function PortalBanner() {
  const session = await getServerSession(authOptions)
  const name = session?.user?.name || 'Welcome'
  const now = new Date()
  const time = now.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="border-b">
      <div className="portal-container">
        <div className="portal-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm portal-muted">{time}</div>
              <div className="text-xl font-semibold mt-0.5">{name}</div>
            </div>
            <div className="text-sm portal-muted">Stay in sync with your pets</div>
          </div>
        </div>
      </div>
    </div>
  )
}
