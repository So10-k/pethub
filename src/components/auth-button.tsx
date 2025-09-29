"use client"

import { signIn, signOut, useSession } from 'next-auth/react'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="text-sm text-neutral-500">…</div>
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="rounded bg-black text-white text-sm px-3 py-1.5 hover:bg-neutral-800"
      >
        Sign in
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-neutral-700 truncate max-w-[140px]">
        {session.user?.name || session.user?.email}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="rounded border text-sm px-3 py-1.5 hover:bg-neutral-50"
      >
        Sign out
      </button>
    </div>
  )
}
