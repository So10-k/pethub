import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { ticketId: string } }) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await req.formData()
  const status = String(form.get('status') || '') as any

  if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 })

  try {
    await prisma.ticket.update({
      where: { id: params.ticketId },
      data: { status },
    })
    return NextResponse.redirect(new URL(req.headers.get('referer') || '/admin/tickets', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update status' }, { status: 500 })
  }
}
