import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await req.formData()
  const userId = String(form.get('userId') || '')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  try {
    // Prevent disconnecting the owner via this endpoint
    const ws = await prisma.workspace.findUnique({ where: { id: params.workspaceId }, select: { ownerId: true } })
    if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    if (ws.ownerId === userId) return NextResponse.json({ error: 'Cannot disconnect owner' }, { status: 400 })

    await prisma.workspace.update({
      where: { id: params.workspaceId },
      data: { members: { disconnect: { id: userId } } },
    })
    return NextResponse.redirect(new URL(req.headers.get('referer') || '/', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to disconnect' }, { status: 500 })
  }
}
