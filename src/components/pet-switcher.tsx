import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function PetSwitcher() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const userId = session.user.id

  // Find all pets across workspaces the user owns or is a member of
  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { id: userId } } },
      ],
    },
    select: {
      id: true,
      name: true,
      pets: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const pets = workspaces.flatMap(w => w.pets)
  const ownsAny = await prisma.workspace.findFirst({ where: { ownerId: userId }, select: { id: true } })

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-sm text-neutral-600">Pets</div>
      <div className="flex items-center gap-2">
        {pets.slice(0, 4).map(p => (
          <Link key={p.id} href={`/pets/${p.id}`} className="px-3 py-1.5 rounded bg-[#F0F6FF] hover:bg-[#e6efff] text-blue-700 text-sm">
            {p.name}
          </Link>
        ))}
        {pets.length === 0 && (
          <span className="text-sm text-neutral-500">No pets yet</span>
        )}
        {ownsAny && (
          <Link href="/pets/new" className="px-3 py-1.5 rounded border border-blue-600 text-blue-700 text-sm hover:bg-blue-50">Add Pet</Link>
        )}
      </div>
    </div>
  )
}
