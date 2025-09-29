"use client"

import { useState } from 'react'

export default function RemoveMemberButton({ memberId }: { memberId: string }) {
  const [loading, setLoading] = useState(false)

  async function removeMember() {
    setLoading(true)
    const res = await fetch('/api/members/remove', {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    })
    if (!res.ok) {
      setLoading(false)
      return
    }
    window.location.reload()
  }

  return (
    <button
      onClick={removeMember}
      disabled={loading}
      title="Remove member"
      className="ml-1 text-red-600 hover:text-red-700"
      aria-label="Remove member"
      type="button"
    >
      ×
    </button>
  )
}
