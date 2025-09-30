import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any)
  if ((session as any)?.user?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''

  if (!query.trim()) {
    return NextResponse.json({ users: [] })
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            ownedWorkspaces: true,
            workspaces: true,
          },
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Search failed' }, { status: 500 })
  }
}
