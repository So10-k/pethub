import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await req.formData()
  const userId = String(form.get('userId') || '')
  const transferToUserId = form.get('transferToUserId') ? String(form.get('transferToUserId')) : ''
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const ownedCount = await prisma.workspace.count({ where: { ownerId: userId } })
    if (ownedCount > 0 && !transferToUserId) {
      return NextResponse.json({ error: 'User owns households. Provide transferToUserId to transfer ownership before deletion.' }, { status: 400 })
    }

    let targetUserId: string | null = null
    if (transferToUserId) {
      const target = await prisma.user.findUnique({ where: { id: transferToUserId }, select: { id: true } })
      if (!target) return NextResponse.json({ error: 'transferToUserId not found' }, { status: 400 })
      targetUserId = target.id
    }

    await prisma.$transaction(async (tx) => {
      if (ownedCount > 0 && targetUserId) {
        await tx.workspace.updateMany({ where: { ownerId: userId }, data: { ownerId: targetUserId } })
      }

      const logsByUser = await tx.petLog.count({ where: { userId } })
      if (logsByUser > 0) {
        if (!targetUserId) throw new Error('User has logs. Provide transferToUserId to reassign logs before deletion.')
        await tx.petLog.updateMany({ where: { userId }, data: { userId: targetUserId } })
      }

      await tx.petLog.updateMany({ where: { performedById: userId }, data: { performedById: targetUserId ?? null } })

      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.redirect(new URL(req.headers.get('referer') || '/', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete user' }, { status: 500 })
  }
}
