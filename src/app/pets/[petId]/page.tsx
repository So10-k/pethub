import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import PetLogForm from '@/components/pet-log-form'
import RemoveMemberButton from '@/components/remove-member-button'

export default async function PetDashboard({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const userId = session.user.id

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: { workspace: { include: { members: { select: { id: true, name: true, email: true } }, owner: { select: { id: true, name: true, email: true } } } } },
  })
  if (!pet) return notFound()

  const hasAccess = pet.workspace.ownerId === userId || pet.workspace.members.some(m => m.id === userId)
  if (!hasAccess) return notFound()

  const memberList = pet.workspace.members.filter(m => m.id !== pet.workspace.ownerId)

  const logs = await prisma.petLog.findMany({
    where: { petId: pet.id },
    orderBy: { timestamp: 'desc' },
    take: 20,
    include: { user: { select: { name: true, email: true } }, performedBy: { select: { name: true, email: true } } },
  })

  return (
    <div className="portal-container">
      <div className="portal-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{pet.name}</h1>
            <p className="text-sm portal-muted">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
          </div>
        </div>

        <div className="mt-4 text-sm portal-muted">
          <div className="mb-1 portal-section-title">Household members</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#F0F6FF] text-blue-700 border border-blue-200">{pet.workspace.owner.name || pet.workspace.owner.email} (admin)</span>
            {memberList.map(m => (
              <span key={m.id} className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border">
                <span>{m.name || m.email}</span>
                {userId === pet.workspace.ownerId && m.id !== userId && (
                  <RemoveMemberButton memberId={m.id} />
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <PetLogForm
            petId={pet.id}
            members={[{ id: pet.workspace.owner.id, name: pet.workspace.owner.name, email: pet.workspace.owner.email }, ...memberList]}
          />
        </div>
      </div>

      <div className="portal-card mt-4">
        <h2 className="portal-section-title">Recent activity</h2>
        <ul className="mt-2 space-y-2">
          {logs.map((l) => {
            const icon = l.type === 'PEE' ? '💧' : l.type === 'POOP' ? '💩' : l.type === 'MEDICATION' ? '💊' : '📝'
            return (
              <li key={l.id} className="border rounded p-3 bg-white">
                <div className="font-medium flex items-center gap-2"><span className="text-lg" aria-hidden>{icon}</span>{l.type}</div>
                <div className="text-sm portal-muted">{new Date(l.timestamp).toLocaleString()}</div>
                <div className="text-xs portal-muted">Logged by {l.user?.name || l.user?.email}{l.performedBy ? ` · Performed by ${l.performedBy.name || l.performedBy.email}` : ''}</div>
                {l.notes && <div className="text-sm">{l.notes}</div>}
              </li>
            )
          })}
          {logs.length === 0 && (
            <li className="text-sm portal-muted">No logs yet. Use the form above to add one.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
