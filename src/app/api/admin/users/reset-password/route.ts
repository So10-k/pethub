import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function genTempPassword() {
  const base = Math.random().toString(36).slice(2, 10)
  return `Temp-${base}`
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await req.formData()
  const userId = String(form.get('userId') || '')
  let newPassword = form.get('newPassword') ? String(form.get('newPassword')) : ''
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    if (!newPassword) newPassword = genTempPassword()
    const hash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } })
    const res = NextResponse.redirect(new URL(req.headers.get('referer') || '/', req.url))
    // Surface temp password to admin via cookie for quick copy (expires fast)
    res.cookies.set('admin_temp_password', newPassword, { httpOnly: false, maxAge: 60, path: '/' })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to reset password' }, { status: 500 })
  }
}
