import Link from 'next/link'
import AuthButton from '@/components/auth-button'
import PetSwitcher from '@/components/pet-switcher'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function Header() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const isSuperAdmin = (session as any)?.user?.role === 'SUPERADMIN'
  let isOwner = false
  let hasWorkspace = false
  if (userId) {
    const [owned, member] = await Promise.all([
      prisma.workspace.findFirst({ where: { ownerId: userId }, select: { id: true } }),
      prisma.workspace.findFirst({ where: { members: { some: { id: userId } } }, select: { id: true } }),
    ])
    isOwner = !!owned
    hasWorkspace = isOwner || !!member
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight text-lg">petHub</Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-neutral-700">
            <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
            {isSuperAdmin && <Link href="/admin" className="hover:text-black">Admin</Link>}
            {isSuperAdmin && <Link href="/admin/tickets" className="hover:text-black">Tickets</Link>}
            {isOwner && <Link href="/members" className="hover:text-black">Members</Link>}
            {isOwner && <Link href="/invite" className="hover:text-black">Invite</Link>}
            {!hasWorkspace && !isOwner && <Link href="/join" className="hover:text-black">Join</Link>}
            {userId && <Link href="/support" className="hover:text-black">Support</Link>}
          </nav>
          <PetSwitcher />
        </div>
        <div>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
