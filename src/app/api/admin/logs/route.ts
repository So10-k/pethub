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
  const petId = String(form.get('petId') || '')
  const type = String(form.get('type') || '') as any
  const notes = form.get('notes') ? String(form.get('notes')) : undefined

  if (!petId || !type) return NextResponse.json({ error: 'petId and type required' }, { status: 400 })

  try {
    const log = await prisma.petLog.create({
      data: {
        petId,
        type,
        notes: notes ?? null,
        userId: (session!.user as any).id, // actor is the super admin
      },
    })
    return NextResponse.redirect(new URL(req.headers.get('referer') || '/', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create log' }, { status: 500 })
  }
}
