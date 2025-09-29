import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ownerId = session.user.id
  const { memberId } = (await req.json().catch(() => ({}))) as { memberId?: string }
  if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 })
  if (memberId === ownerId) return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })

  // Find a workspace where current user is the owner and the target user is a member
  const ws = await prisma.workspace.findFirst({
    where: { ownerId, members: { some: { id: memberId } } },
    select: { id: true },
  })
  if (!ws) return NextResponse.json({ error: 'Not found or not allowed' }, { status: 404 })

  await prisma.workspace.update({
    where: { id: ws.id },
    data: { members: { disconnect: { id: memberId } } },
  })

  return NextResponse.json({ removed: true })
}
