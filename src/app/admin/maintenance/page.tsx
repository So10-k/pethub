import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminMaintenancePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const role = (session.user as any).role
  if (role !== 'SUPERADMIN') return notFound()

  let maintenance = await prisma.maintenanceMode.findFirst({
    orderBy: { id: 'asc' },
  })

  if (!maintenance) {
    maintenance = await prisma.maintenanceMode.create({
      data: {
        isActive: false,
        whitelistedUserIds: [],
      },
    })
  }

  return (
    <div className="portal-container">
      <div className="portal-card">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Back to admin</Link>
        <h1 className="text-2xl font-semibold mt-4">Maintenance Mode</h1>
        <p className="portal-muted text-sm mt-1">Control site-wide maintenance breaks</p>
      </div>

      <div className="portal-card mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="portal-section-title">Current Status</h2>
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            maintenance.isActive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {maintenance.isActive ? '🔧 MAINTENANCE ACTIVE' : '✅ SITE ONLINE'}
          </span>
        </div>

        <form action="/api/admin/maintenance/toggle" method="post" className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={maintenance.isActive}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Enable Maintenance Mode</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              name="message"
              defaultValue={maintenance.message || ''}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="We're currently performing maintenance. Please check back soon!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estimated Duration (minutes)</label>
            <input
              type="number"
              name="estimatedDuration"
              defaultValue={maintenance.estimatedDuration || ''}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="e.g., 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Whitelisted User IDs (comma-separated)</label>
            <textarea
              name="whitelistedUserIds"
              defaultValue={maintenance.whitelistedUserIds.join(', ')}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm font-mono"
              placeholder="user_id_1, user_id_2, user_id_3"
            />
            <p className="text-xs text-gray-500 mt-1">
              These users can access the site during maintenance
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Update Maintenance Settings
          </button>
        </form>
      </div>

      {maintenance.isActive && maintenance.startedAt && (
        <div className="portal-card mt-4 bg-yellow-50 border-yellow-200">
          <h3 className="font-medium text-yellow-900">⚠️ Maintenance Active Since</h3>
          <p className="text-sm text-yellow-800 mt-1">
            {new Date(maintenance.startedAt).toLocaleString()}
          </p>
          {maintenance.estimatedDuration && (
            <p className="text-sm text-yellow-800 mt-1">
              Estimated completion: {new Date(new Date(maintenance.startedAt).getTime() + maintenance.estimatedDuration * 60000).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
