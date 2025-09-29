"use client"

import { cn } from '@/components/ui/cn'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: PropsWithChildren<{
  variant?: Variant
}> & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none h-9 px-4'
  const styles: Record<Variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-blue-600 text-blue-700 hover:bg-blue-50',
    ghost: 'text-blue-700 hover:bg-blue-50',
  }
  return (
    <button className={cn(base, styles[variant], className)} {...props}>
      {children}
    </button>
  )
}
