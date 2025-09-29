"use client"

import { useState } from 'react'

export default function InvitePage() {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setError(null)
    setLoading(true)
    const res = await fetch('/api/invites', { method: 'POST' })
    setLoading(false)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data?.error || 'Failed to generate')
      return
    }
    setCode(data.code)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Invite family</h1>
      <p className="text-sm text-neutral-600 mt-1">Generate a code to share with your family to join your household.</p>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={generate} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Generate code</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
      {code && (
        <div className="mt-4 p-4 border rounded bg-[#F0F6FF]">
          <div className="text-sm text-neutral-600">Share this code:</div>
          <div className="text-2xl font-mono tracking-widest text-blue-700">{code}</div>
        </div>
      )}
    </div>
  )
}
