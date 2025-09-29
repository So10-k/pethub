import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  let household = await prisma.workspace.findFirst({ where: { ownerId: userId } })
  if (!household) {
    household = await prisma.workspace.create({ data: { name: 'My Household', ownerId: userId, members: { connect: { id: userId } } } })
  }

  let code = randomCode()
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.invite.findUnique({ where: { code } })
    if (!exists) break
    code = randomCode()
  }

  const invite = await prisma.invite.create({
    data: {
      code,
      workspaceId: household.id,
      createdById: userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days
    },
    select: { code: true, expiresAt: true },
  })

  return NextResponse.json(invite)
}
