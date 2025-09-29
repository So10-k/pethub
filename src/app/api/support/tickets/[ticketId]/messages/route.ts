import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { ticketId: string } }) {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const content = String(form.get('content') || '')
  const isAdminStr = String(form.get('isAdmin') || 'false')
  const isAdmin = isAdminStr === 'true' && (session.user as any).role === 'SUPERADMIN'

  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: params.ticketId }, select: { userId: true } })
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    // Only ticket owner or admin can post messages
    if (ticket.userId !== session.user.id && (session.user as any).role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.ticketMessage.create({
      data: {
        content,
        ticketId: params.ticketId,
        userId: session.user.id,
        isAdmin,
      },
    })

    // Update ticket status if admin responds
    if (isAdmin) {
      await prisma.ticket.update({
        where: { id: params.ticketId },
        data: { status: 'WAITING_USER' },
      })
    }

    const referer = req.headers.get('referer') || `/support/${params.ticketId}`
    return NextResponse.redirect(new URL(referer, req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to send message' }, { status: 500 })
  }
}
