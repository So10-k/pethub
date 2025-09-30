import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await req.json().catch(() => ({}))
  const { petId, type, notes, timestamp, performedById } = body as { petId?: string; type?: string; notes?: string; timestamp?: string; performedById?: string }
  if (!petId || !type) return NextResponse.json({ error: 'petId and type required' }, { status: 400 })

  // Ensure the user has access to the pet via workspace membership
  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { workspaceId: true } })
  if (!pet) return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  const ws = await prisma.workspace.findFirst({
    where: {
      id: pet.workspaceId,
      OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
    },
    select: { id: true, ownerId: true, members: { select: { id: true } } },
  })
  if (!ws) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Validate performedById is part of this household (owner or member)
  let actorId: string | null = null
  if (performedById) {
    const isActor = performedById === ws.ownerId || ws.members.some(m => m.id === performedById)
    if (!isActor) return NextResponse.json({ error: 'Invalid actor' }, { status: 400 })
    actorId = performedById
  }

  // Client should always send timestamp in ISO format (includes timezone info)
  // Server stores in UTC, client displays in local time
  const ts = timestamp ? new Date(timestamp) : new Date()
  
  // Support a combined Pee/Poop option by creating two logs
  if (type === 'PEE_POOP') {
    const [pee, poop] = await Promise.all([
      prisma.petLog.create({ data: { petId, userId, performedById: actorId, type: 'PEE', notes: notes || null, timestamp: ts } }),
      prisma.petLog.create({ data: { petId, userId, performedById: actorId, type: 'POOP', notes: notes || null, timestamp: ts } }),
    ])
    return NextResponse.json({ logs: [pee, poop] })
  }

  // Accept other known types too (MEDICATION, FEEDING, WALK, PLAY, OTHER)
  const created = await prisma.petLog.create({
    data: { petId, userId, performedById: actorId, type: type as any, notes: notes || null, timestamp: ts },
  })
  return NextResponse.json({ log: created, showAd: true })
}
