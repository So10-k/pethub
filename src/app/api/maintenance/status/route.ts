import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first (and only) maintenance record
    let maintenance = await prisma.maintenanceMode.findFirst({
      orderBy: { id: 'asc' },
    })

    // If no record exists, create one
    if (!maintenance) {
      maintenance = await prisma.maintenanceMode.create({
        data: {
          isActive: false,
          whitelistedUserIds: [],
        },
      })
    }

    return NextResponse.json({
      isActive: maintenance.isActive,
      message: maintenance.message,
      estimatedDuration: maintenance.estimatedDuration,
      startedAt: maintenance.startedAt,
      whitelistedUserIds: maintenance.whitelistedUserIds,
    })
  } catch (error) {
    console.error('Maintenance status error:', error)
    return NextResponse.json({ isActive: false, whitelistedUserIds: [] })
  }
}
