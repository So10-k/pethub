import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MobileTabBar from './mobile-tab-bar'

export default async function MobileTabBarWrapper() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return <MobileTabBar isOwner={false} isAdmin={false} />
  }

  const role = (session.user as any).role
  const isAdmin = role === 'SUPERADMIN'
  
  // Check if user owns a workspace
  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  })
  
  const isOwner = !!workspace

  return <MobileTabBar isOwner={isOwner} isAdmin={isAdmin} />
}
