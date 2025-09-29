"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export type LogKind = 'PEE' | 'POOP' | 'PEE_POOP' | 'MEDICATION'

type Member = { id: string; name: string | null; email: string | null }

export default function PetLogForm({ petId, members = [] }: { petId: string; members?: Member[] }) {
  const router = useRouter()
  const [type, setType] = useState<LogKind>('PEE')
  const [notes, setNotes] = useState('')
  const [actor, setActor] = useState<string>('')
  const [time, setTime] = useState(() => {
    const d = new Date()
    // Format as yyyy-MM-ddThh:mm for input[type=datetime-local]
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    const payload: any = {
      petId,
      type,
      notes: notes || undefined,
      timestamp: time ? new Date(time).toISOString() : undefined,
      performedById: actor || undefined,
    }
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    setSubmitting(false)
    if (!res.ok) {
      setError(data?.error || 'Failed to submit log')
      return
    }
    setSuccess('Logged successfully')
    setNotes('')
    // do not clear time; assume they may add sequential entries
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="border rounded p-4 space-y-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Time</label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as LogKind)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="PEE">Pee</option>
            <option value="POOP">Poop</option>
            <option value="PEE_POOP">Pee/Poop</option>
            <option value="MEDICATION">Medicine</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Who performed it?</label>
          <select
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Unspecified</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name || m.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Notes</label>
          <input
            placeholder="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting} variant="primary">
          {submitting ? 'Submitting…' : 'Submit Log'}
        </Button>
        {error && <span className="text-sm text-red-600">{error}</span>}
        {success && <span className="text-sm text-green-600">{success}</span>}
      </div>
    </form>
  )
}
