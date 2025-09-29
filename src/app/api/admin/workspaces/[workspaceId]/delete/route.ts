import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const workspaceId = params.workspaceId
  try {
    await prisma.$transaction(async (tx) => {
      // Delete logs belonging to pets in this workspace
      await tx.petLog.deleteMany({ where: { pet: { workspaceId } } })
      // Delete pets
      await tx.pet.deleteMany({ where: { workspaceId } })
      // Delete invites
      await tx.invite.deleteMany({ where: { workspaceId } })
      // Disconnect all members (many-to-many)
      await tx.workspace.update({ where: { id: workspaceId }, data: { members: { set: [] } } })
      // Finally delete workspace
      await tx.workspace.delete({ where: { id: workspaceId } })
    })
    const ref = req.headers.get('referer') || '/admin'
    return NextResponse.redirect(new URL(ref, req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete household' }, { status: 500 })
  }
}
