import { prisma } from '@/lib/prisma'

export default async function MaintenancePage() {
  const maintenance = await prisma.maintenanceMode.findFirst({
    orderBy: { id: 'asc' },
  })

  const estimatedEnd = maintenance?.startedAt && maintenance?.estimatedDuration
    ? new Date(new Date(maintenance.startedAt).getTime() + maintenance.estimatedDuration * 60000)
    : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Under Maintenance</h1>
        <p className="text-gray-600 mb-6">
          {maintenance?.message || "We're currently performing maintenance. Please check back soon!"}
        </p>
        
        {maintenance?.estimatedDuration && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Estimated Duration</div>
            <div className="text-2xl font-semibold text-blue-600">
              {maintenance.estimatedDuration} minutes
            </div>
            {estimatedEnd && (
              <div className="text-xs text-gray-500 mt-2">
                Expected completion: {estimatedEnd.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-500">
          Thank you for your patience!
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
