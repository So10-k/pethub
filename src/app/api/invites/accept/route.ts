import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id
  const { code } = (await req.json().catch(() => ({}))) as { code?: string }
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const inv = await prisma.invite.findUnique({ where: { code }, include: { workspace: true } })
  if (!inv) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })
  if (inv.usedById) return NextResponse.json({ error: 'Code already used' }, { status: 400 })
  if (inv.expiresAt && inv.expiresAt < new Date()) return NextResponse.json({ error: 'Code expired' }, { status: 400 })

  // Add user as member of the workspace
  await prisma.workspace.update({
    where: { id: inv.workspaceId },
    data: { members: { connect: { id: userId } } },
  })

  await prisma.invite.update({ where: { id: inv.id }, data: { usedById: userId } })

  return NextResponse.json({ joinedWorkspaceId: inv.workspaceId })
}
