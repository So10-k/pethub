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
  const isActive = form.get('isActive') === 'on'
  const message = String(form.get('message') || '').trim()
  const estimatedDuration = form.get('estimatedDuration') ? parseInt(String(form.get('estimatedDuration'))) : null
  const whitelistedUserIdsStr = String(form.get('whitelistedUserIds') || '').trim()
  
  // Parse whitelisted user IDs
  const whitelistedUserIds = whitelistedUserIdsStr
    ? whitelistedUserIdsStr.split(',').map(id => id.trim()).filter(id => id.length > 0)
    : []

  try {
    let maintenance = await prisma.maintenanceMode.findFirst({
      orderBy: { id: 'asc' },
    })

    if (!maintenance) {
      maintenance = await prisma.maintenanceMode.create({
        data: {
          isActive,
          message: message || null,
          estimatedDuration,
          startedAt: isActive ? new Date() : null,
          whitelistedUserIds,
        },
      })
    } else {
      await prisma.maintenanceMode.update({
        where: { id: maintenance.id },
        data: {
          isActive,
          message: message || null,
          estimatedDuration,
          startedAt: isActive && !maintenance.isActive ? new Date() : maintenance.startedAt,
          whitelistedUserIds,
        },
      })
    }

    return NextResponse.redirect(new URL('/admin/maintenance', req.url))
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update maintenance mode' }, { status: 500 })
  }
}
