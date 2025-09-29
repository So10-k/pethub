import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { logId: string } }) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await req.formData()
  const method = String(form.get('_method') || '').toUpperCase()
  if (method !== 'DELETE') return NextResponse.json({ error: 'Unsupported' }, { status: 400 })

  try {
    await prisma.petLog.delete({ where: { id: params.logId } })
    return NextResponse.redirect(new URL(req.headers.get('referer') || '/', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to delete log' }, { status: 500 })
  }
}
