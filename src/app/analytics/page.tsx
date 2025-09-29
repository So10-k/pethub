import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: session.user.id },
    include: { pets: { select: { id: true, name: true } } },
  })

  if (!workspace) redirect('/dashboard')

  const isPremium = workspace.plan === 'PREMIUM' && (!workspace.planExpiresAt || new Date(workspace.planExpiresAt) > new Date())

  if (!isPremium) {
    return (
      <div className="portal-container">
        <div className="portal-card">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <div className="mt-4 p-6 border rounded bg-neutral-50 text-center">
            <p className="text-lg font-medium">⭐ Premium Feature</p>
            <p className="text-sm portal-muted mt-2">Upgrade to Premium to unlock advanced analytics and insights</p>
            <Link href="/support" className="mt-4 inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              Contact Support to Upgrade
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get logs from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const logs = await prisma.petLog.findMany({
    where: {
      pet: { workspaceId: workspace.id },
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: 'desc' },
    include: { pet: { select: { name: true } } },
  })

  // Calculate stats
  const logsByType = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1
    return acc
  }, {})

  const logsByPet = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.pet.name] = (acc[log.pet.name] || 0) + 1
    return acc
  }, {})

  // Group by day for last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentLogs = logs.filter(l => new Date(l.createdAt) >= sevenDaysAgo)
  
  const logsByDay = recentLogs.reduce((acc: Record<string, number>, log) => {
    const day = new Date(log.createdAt).toLocaleDateString()
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})

  return (
    <div className="portal-container">
      <div className="portal-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <p className="portal-muted text-sm mt-1">Last 30 days of activity</p>
          </div>
          <span className="px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
            ⭐ PREMIUM
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="portal-card">
          <div className="text-sm portal-muted">Total Logs</div>
          <div className="text-3xl font-bold mt-1">{logs.length}</div>
          <div className="text-xs portal-muted mt-1">Last 30 days</div>
        </div>
        <div className="portal-card">
          <div className="text-sm portal-muted">Daily Average</div>
          <div className="text-3xl font-bold mt-1">{(logs.length / 30).toFixed(1)}</div>
          <div className="text-xs portal-muted mt-1">Logs per day</div>
        </div>
        <div className="portal-card">
          <div className="text-sm portal-muted">This Week</div>
          <div className="text-3xl font-bold mt-1">{recentLogs.length}</div>
          <div className="text-xs portal-muted mt-1">Last 7 days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="portal-card">
          <h2 className="portal-section-title">Activity by Type</h2>
          <div className="mt-3 space-y-2">
            {Object.entries(logsByType).sort(([,a], [,b]) => b - a).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / logs.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="portal-card">
          <h2 className="portal-section-title">Activity by Pet</h2>
          <div className="mt-3 space-y-2">
            {Object.entries(logsByPet).sort(([,a], [,b]) => b - a).map(([pet, count]) => (
              <div key={pet} className="flex items-center justify-between">
                <span className="text-sm">{pet}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(count / logs.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">Daily Activity (Last 7 Days)</h2>
        <div className="mt-3 space-y-2">
          {Object.entries(logsByDay).reverse().map(([day, count]) => (
            <div key={day} className="flex items-center justify-between">
              <span className="text-sm">{day}</span>
              <div className="flex items-center gap-2">
                <div className="w-64 bg-neutral-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full" 
                    style={{ width: `${(count / Math.max(...Object.values(logsByDay))) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
