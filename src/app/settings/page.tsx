import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: session.user.id },
    include: { customLogTypes: { orderBy: { createdAt: 'asc' } } },
  })

  if (!workspace) redirect('/dashboard')

  const isPremium = workspace.plan === 'PREMIUM' && (!workspace.planExpiresAt || new Date(workspace.planExpiresAt) > new Date())

  return (
    <div className="portal-container">
      <div className="portal-card">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="portal-muted text-sm mt-1">Manage your household preferences</p>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">Household Details</h2>
        <form action="/api/workspaces/update" method="post" className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Household Name</label>
            <input
              name="name"
              defaultValue={workspace.name}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              name="description"
              defaultValue={workspace.description || ''}
              rows={3}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Save Changes
          </button>
        </form>
      </div>

      <div className="portal-card mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="portal-section-title">Custom Log Types</h2>
            <p className="portal-muted text-sm mt-1">
              {isPremium ? 'Create custom activity types for your pets' : '⭐ Premium feature - Upgrade to create custom log types'}
            </p>
          </div>
          {isPremium && workspace.plan === 'PREMIUM' && (
            <span className="px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
              ⭐ PREMIUM
            </span>
          )}
        </div>

        {isPremium ? (
          <>
            <div className="mt-4 space-y-2">
              {workspace.customLogTypes.map(type => (
                <div key={type.id} className="border rounded bg-white p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{type.icon}</span>
                    <span className="font-medium">{type.name}</span>
                  </div>
                  <form action={`/api/custom-log-types/${type.id}/delete`} method="post">
                    <button type="submit" className="text-sm text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
              {workspace.customLogTypes.length === 0 && (
                <p className="text-sm portal-muted">No custom log types yet. Create one below!</p>
              )}
            </div>

            <form action="/api/custom-log-types" method="post" className="mt-4 flex gap-2">
              <input
                name="name"
                required
                placeholder="Log type name (e.g., Training)"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <input
                name="icon"
                placeholder="Emoji (optional)"
                maxLength={2}
                className="w-20 border rounded px-3 py-2 text-sm text-center"
              />
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                Add
              </button>
            </form>
          </>
        ) : (
          <div className="mt-4 p-4 border rounded bg-neutral-50">
            <p className="text-sm">Upgrade to Premium ($5/month) to unlock:</p>
            <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
              <li>Custom log types</li>
              <li>Unlimited pets</li>
              <li>Ad-free experience</li>
              <li>Priority support</li>
              <li>Advanced analytics</li>
            </ul>
            <p className="text-sm portal-muted mt-3">Contact support to upgrade your account.</p>
          </div>
        )}
      </div>
    </div>
  )
}
