import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const subject = String(form.get('subject') || '')
  const description = String(form.get('description') || '')
  let priority = String(form.get('priority') || 'MEDIUM') as any

  if (!subject || !description) {
    return NextResponse.json({ error: 'Subject and description required' }, { status: 400 })
  }

  try {
    // Check if user has premium household
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: session.user.id },
      select: { plan: true, planExpiresAt: true },
    })
    const isPremium = workspace?.plan === 'PREMIUM' && (!workspace.planExpiresAt || new Date(workspace.planExpiresAt) > new Date())
    
    // Premium users get HIGH priority automatically
    if (isPremium && priority !== 'URGENT') {
      priority = 'HIGH'
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority,
        userId: session.user.id,
      },
    })
    return NextResponse.redirect(new URL(`/support/${ticket.id}`, req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create ticket' }, { status: 500 })
  }
}
