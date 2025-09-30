import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminUserSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const role = (session.user as any).role
  if (role !== 'SUPERADMIN') return notFound()

  const query = searchParams.q || ''

  let users: any[] = []
  if (query.trim()) {
    users = await prisma.user.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            ownedWorkspaces: true,
            workspaces: true,
          },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    })
  }

  return (
    <div className="portal-container">
      <div className="portal-card">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Back to admin</Link>
        <h1 className="text-2xl font-semibold mt-4">User Search Results</h1>
        <p className="portal-muted text-sm mt-1">
          {query ? `Searching for: "${query}"` : 'No search query'}
        </p>
      </div>

      <div className="portal-card mt-4">
        {!query.trim() ? (
          <p className="text-sm portal-muted">Enter a search term to find users</p>
        ) : users.length === 0 ? (
          <p className="text-sm portal-muted">No users found matching "{query}"</p>
        ) : (
          <>
            <p className="text-sm portal-muted mb-3">Found {users.length} user{users.length !== 1 ? 's' : ''}</p>
            <div className="space-y-2">
              {users.map(user => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="block border rounded p-4 hover:bg-neutral-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{user.name || 'No name'}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-400 mt-1 font-mono">{user.id}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className={`px-2 py-0.5 rounded text-xs ${user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {user._count.ownedWorkspaces} household{user._count.ownedWorkspaces !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
