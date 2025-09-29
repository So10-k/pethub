import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { typeId: string } }) {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const customType = await prisma.customLogType.findUnique({
      where: { id: params.typeId },
      include: { workspace: { select: { ownerId: true } } },
    })

    if (!customType) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (customType.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.customLogType.delete({ where: { id: params.typeId } })
    return NextResponse.redirect(new URL('/settings', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete' }, { status: 500 })
  }
}
