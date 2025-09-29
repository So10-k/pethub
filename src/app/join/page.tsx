"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await fetch('/api/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    setLoading(false)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data?.error || 'Failed to join')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Join a household</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm mb-1">Invite code</label>
          <input className="w-full border rounded px-3 py-2 font-mono tracking-widest" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50">
          {loading ? 'Joining…' : 'Join'}
        </button>
      </form>
    </div>
  )
}
