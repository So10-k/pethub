"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function MobileTabBar() {
  const pathname = usePathname()
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsPWA(isStandalone)
  }, [])

  if (!isPWA) return null

  const tabs = [
    { href: '/dashboard', icon: '🏠', label: 'Home' },
    { href: '/analytics', icon: '📊', label: 'Analytics' },
    { href: '/pets/new', icon: '➕', label: 'Add' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
    { href: '/support', icon: '💬', label: 'Support' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 mobile-safe-bottom z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <span className="text-2xl mb-0.5">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
