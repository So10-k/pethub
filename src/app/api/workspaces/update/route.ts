import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const name = String(form.get('name') || '').trim()
  const description = String(form.get('description') || '').trim()

  if (!name) {
    return NextResponse.json({ error: 'Household name is required' }, { status: 400 })
  }

  try {
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 })
    }

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.redirect(new URL('/settings', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update household' }, { status: 500 })
  }
}
