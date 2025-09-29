import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/signin')
  const userId = session.user.id

  const workspaces = await prisma.workspace.findMany({
    where: { OR: [{ ownerId: userId }, { members: { some: { id: userId } } }] },
    select: { pets: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const petId = workspaces.flatMap(w => w.pets)[0]?.id
  if (petId) redirect(`/pets/${petId}`)
  redirect('/pets/new')
}
