import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import RemoveMemberButton from '@/components/remove-member-button'
import Link from 'next/link'

export default async function MembersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const userId = session.user.id

  // Prefer an owned workspace; otherwise pick first workspace where user is a member
  const ws = await prisma.workspace.findFirst({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { id: userId } } },
      ],
    },
    include: { owner: { select: { id: true, name: true, email: true } }, members: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  if (!ws) {
    return (
      <div className="portal-container">
        <div className="portal-card">
          <h1 className="text-xl font-semibold">Members</h1>
          <p className="text-neutral-700 mt-2">No household found. Create a pet to start a new household.</p>
          <div className="mt-4">
            <Link href="/pets/new" className="text-blue-700 underline">Add your first pet</Link>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = ws.owner.id === userId
  const members = ws.members.filter(m => m.id !== ws.owner.id)

  return (
    <div className="portal-container">
      <div className="portal-card">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Household Members</h1>
          <Link href="/invite" className="text-blue-700 underline">Generate Invite</Link>
        </div>
        <div className="mt-4">
          <div className="text-sm text-neutral-600">Owner</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-blue-700 border border-blue-200">{ws.owner.name || ws.owner.email} (admin)</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="text-sm text-neutral-600">Members</div>
          {members.length === 0 && (
            <div className="mt-2 text-sm text-neutral-600">No members yet. Share an invite to add family.</div>
          )}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {members.map(m => (
              <span key={m.id} className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border">
                <span>{m.name || m.email}</span>
                {isOwner && (
                  <RemoveMemberButton memberId={m.id} />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
