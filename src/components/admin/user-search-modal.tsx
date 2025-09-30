"use client"

import { useRouter } from 'next/navigation'

export default function UserSearchModal() {
  const router = useRouter()

  function handleSearch() {
    const query = prompt('Search users by name, email, or user ID:')
    if (!query?.trim()) return

    // Navigate to search results page
    router.push(`/admin/users/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <button
      onClick={handleSearch}
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
    >
      🔍 Search Users
    </button>
  )
}
