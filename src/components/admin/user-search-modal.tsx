"use client"

import { useState } from 'react'

export default function UserSearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function search() {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.users || [])
    } catch (e) {
      console.error('Search error:', e)
    }
    setLoading(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        🔍 Search Users
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Users</h2>
          <button onClick={() => setIsOpen(false)} className="text-2xl hover:text-red-600">&times;</button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search by name, email, or user ID..."
              className="flex-1 border rounded px-3 py-2"
              autoFocus
            />
            <button
              onClick={search}
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto">
            {results.length === 0 && query && !loading && (
              <p className="text-sm text-gray-500 text-center py-8">No users found</p>
            )}
            {results.length === 0 && !query && (
              <p className="text-sm text-gray-500 text-center py-8">Enter a search term to find users</p>
            )}
            {results.map(user => (
              <a
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="block border rounded p-4 mb-2 hover:bg-neutral-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{user.name || 'No name'}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">{user.id}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className={`px-2 py-0.5 rounded text-xs ${user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.role}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user._count.ownedWorkspaces} household{user._count.ownedWorkspaces !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
