"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewPetPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [breed, setBreed] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, species, breed }),
    })
    setLoading(false)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data?.error || 'Failed to create pet')
      return
    }
    const petId = data?.pet?.id as string | undefined
    if (petId) router.push(`/pets/${petId}`)
    else router.push('/dashboard')
  }

  return (
    <div className="portal-container">
      <div className="portal-card max-w-xl">
        <h1 className="text-2xl font-semibold">Add a new pet</h1>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Species</label>
          <input className="w-full border rounded px-3 py-2" value={species} onChange={(e) => setSpecies(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Breed (optional)</label>
          <input className="w-full border rounded px-3 py-2" value={breed} onChange={(e) => setBreed(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50">
          {loading ? 'Creating…' : 'Create pet'}
        </button>
        </form>
      </div>
    </div>
  )
}
