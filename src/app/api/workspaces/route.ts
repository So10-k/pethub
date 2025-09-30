import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { name, description } = body as { name?: string; description?: string }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Household name is required' }, { status: 400 })
  }

  try {
    // Check if user already owns a household
    const existing = await prisma.workspace.findFirst({
      where: { ownerId: session.user.id },
    })

    if (existing) {
      return NextResponse.json({ error: 'You already own a household' }, { status: 400 })
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: session.user.id,
        members: { connect: { id: session.user.id } },
      },
    })

    return NextResponse.json({ workspace })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create household' }, { status: 500 })
  }
}
