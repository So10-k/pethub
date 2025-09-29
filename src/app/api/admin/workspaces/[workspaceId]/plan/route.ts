import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { workspaceId: string } }) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await req.formData()
  const plan = String(form.get('plan') || 'FREE') as 'FREE' | 'PREMIUM'
  const expiresAtStr = String(form.get('expiresAt') || '')
  
  const planExpiresAt = expiresAtStr ? new Date(expiresAtStr) : null

  try {
    await prisma.workspace.update({
      where: { id: params.workspaceId },
      data: { plan, planExpiresAt },
    })
    return NextResponse.redirect(new URL(req.headers.get('referer') || '/admin', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update plan' }, { status: 500 })
  }
}
