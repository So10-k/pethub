"use client"

import { useEffect } from 'react'

export default function GoogleVignetteAd() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-4257269140990083"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
