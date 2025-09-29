"use client"

import { useState, useTransition } from 'react'

export default function RemoveMemberButton({ memberId }: { memberId: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function removeMember() {
    setError(null)
    const res = await fetch('/api/members/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error || 'Failed')
      return
    }
    startTransition(() => {
      // Refresh the page to reflect updated members
      window.location.reload()
    })
  }

  return (
    <button
      onClick={removeMember}
      disabled={pending}
      title="Remove member"
      className="ml-1 text-red-600 hover:text-red-700"
      aria-label="Remove member"
      type="button"
    >
      ×
    </button>
  )
}
