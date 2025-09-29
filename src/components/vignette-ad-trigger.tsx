"use client"

import { useEffect, useState } from 'react'

export default function VignetteAdTrigger() {
  const [showAd, setShowAd] = useState(false)

  useEffect(() => {
    // Get log count from localStorage
    const logCount = parseInt(localStorage.getItem('petLogCount') || '0', 10)
    const lastAdAt = parseInt(localStorage.getItem('lastAdAt') || '0', 10)
    
    // Random threshold between 5-10 logs
    const threshold = Math.floor(Math.random() * 6) + 5 // 5-10
    
    // Show ad if we've hit threshold and haven't shown one recently
    if (logCount - lastAdAt >= threshold) {
      setShowAd(true)
      localStorage.setItem('lastAdAt', logCount.toString())
      
      // Trigger vignette ad
      try {
        // @ts-ignore
        if (window.adsbygoogle && window.adsbygoogle.loaded) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-4257269140990083",
            enable_page_level_ads: true,
            overlays: {bottom: true}
          })
        }
      } catch (e) {
        console.error('Vignette ad error:', e)
      }
      
      // Reset flag after showing
      setTimeout(() => setShowAd(false), 1000)
    }
  }, [])

  return null
}

// Helper function to increment log count - call this when user creates a log
export function incrementLogCount() {
  if (typeof window === 'undefined') return
  const current = parseInt(localStorage.getItem('petLogCount') || '0', 10)
  localStorage.setItem('petLogCount', (current + 1).toString())
}
