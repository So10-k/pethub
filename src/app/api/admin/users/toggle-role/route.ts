import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await req.formData()
  const userId = String(form.get('userId') || '')

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const newRole = user.role === 'SUPERADMIN' ? 'USER' : 'SUPERADMIN'
    
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    })

    return NextResponse.redirect(new URL(req.headers.get('referer') || '/admin', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to toggle role' }, { status: 500 })
  }
}
