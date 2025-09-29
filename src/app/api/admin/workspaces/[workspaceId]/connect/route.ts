import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await req.formData()
  const userId = String(form.get('userId') || '')
  const targetWorkspaceId = String(form.get('targetWorkspaceId') || params.workspaceId)
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    await prisma.workspace.update({
      where: { id: targetWorkspaceId },
      data: { members: { connect: { id: userId } } },
    })
    return NextResponse.redirect(new URL(req.headers.get('referer') || '/', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to connect' }, { status: 500 })
  }
}
