import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ pets: [] })
  const userId = session.user.id
  const workspaces = await prisma.workspace.findMany({
    where: { OR: [{ ownerId: userId }, { members: { some: { id: userId } } }] },
    select: { id: true, pets: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const pets = workspaces.flatMap(w => w.pets)
  return NextResponse.json({ pets })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const body = await req.json().catch(() => ({}))
  const { name, species, breed } = body as { name?: string; species?: string; breed?: string }
  if (!name || !species) return NextResponse.json({ error: 'Name and species required' }, { status: 400 })

  // Find user's household
  const household = await prisma.workspace.findFirst({ 
    where: { ownerId: userId },
    include: { pets: { select: { id: true } } },
  })
  
  if (!household) {
    return NextResponse.json({ 
      error: 'You must create a household first. Go to /create-household to get started.' 
    }, { status: 400 })
  }

  // Check pet limit for free users (3 pets max)
  const isPremium = household.plan === 'PREMIUM' && (!household.planExpiresAt || new Date(household.planExpiresAt) > new Date())
  if (!isPremium && household.pets.length >= 3) {
    return NextResponse.json({ 
      error: 'Free plan limited to 3 pets. Upgrade to Premium for unlimited pets!' 
    }, { status: 403 })
  }

  const pet = await prisma.pet.create({
    data: {
      name,
      species,
      breed: breed || null,
      workspaceId: household.id,
    },
    select: { id: true, name: true },
  })

  return NextResponse.json({ pet })
}
