import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = body as { email?: string; password?: string; name?: string }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json({ user })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}
