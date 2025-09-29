import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const name = String(form.get('name') || '').trim()
  const icon = String(form.get('icon') || '📝').trim() || '📝'

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  try {
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true, plan: true, planExpiresAt: true },
    })

    if (!workspace) return NextResponse.json({ error: 'No workspace found' }, { status: 404 })

    const isPremium = workspace.plan === 'PREMIUM' && (!workspace.planExpiresAt || new Date(workspace.planExpiresAt) > new Date())
    if (!isPremium) {
      return NextResponse.json({ error: 'Premium feature' }, { status: 403 })
    }

    await prisma.customLogType.create({
      data: {
        name,
        icon,
        workspaceId: workspace.id,
      },
    })

    return NextResponse.redirect(new URL('/settings', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create custom log type' }, { status: 500 })
  }
}
