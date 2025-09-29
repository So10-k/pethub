"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function PetQuickActions({ petId }: { petId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  async function log(type: 'PEE' | 'POOP') {
    setError(null)
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petId, type, notes: notes || undefined }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error || 'Failed to log')
      return
    }
    setNotes('')
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex items-center gap-3">
      <input
        placeholder="Add a note (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-56 border rounded px-3 py-2 text-sm"
      />
      <Button onClick={() => log('PEE')} disabled={pending} variant="primary">Pee</Button>
      <Button onClick={() => log('POOP')} disabled={pending} variant="outline">Poop</Button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
