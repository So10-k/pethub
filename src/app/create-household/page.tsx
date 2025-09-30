"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateHouseholdPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    
    setLoading(false)
    const data = await res.json().catch(() => ({}))
    
    if (!res.ok) {
      setError(data?.error || 'Failed to create household')
      return
    }
    
    router.push('/dashboard')
  }

  return (
    <div className="portal-container">
      <div className="portal-card max-w-xl">
        <h1 className="text-2xl font-semibold">Create Your Household</h1>
        <p className="portal-muted text-sm mt-1">
          A household is where you manage your pets and collaborate with family members
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Household Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Smith Family, My Pets, etc."
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your household..."
              rows={3}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Household'}
            </button>
            <a
              href="/join"
              className="flex-1 text-center border rounded px-4 py-2 hover:bg-neutral-50"
            >
              Join Existing Household
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
