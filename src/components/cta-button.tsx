"use client"

import React from 'react'

type Props = {
  href: string
  children: React.ReactNode
  label: string
  className?: string
}

export default function CTAButton({ href, children, label, className }: Props) {
  const onClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      const payload = JSON.stringify({ label, href, ts: Date.now() })
      const url = "/api/analytics/cta"
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {})
      }
    } catch {}
    // let navigation proceed
  }, [href, label])

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  )
}
