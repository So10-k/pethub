"use client"

import React from 'react'

export default function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm(message)) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
  return React.cloneElement(children as any, { onClick })
}
