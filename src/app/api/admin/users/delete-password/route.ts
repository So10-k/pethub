import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await req.formData()
  const userId = String(form.get('userId') || '')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: null } })
    return NextResponse.redirect(new URL(req.headers.get('referer') || '/', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete password' }, { status: 500 })
  }
}
