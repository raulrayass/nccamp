'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SettingSectionProps {
  title?: string
  description?: string
  children: ReactNode
  variant?: 'default' | 'destructive'
}

export function SettingSection({
  title,
  description,
  children,
  variant = 'default',
}: SettingSectionProps) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || description) && (
        <div className="px-4 pt-3">
          {title && (
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${
              variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {title}
            </h3>
          )}
          {description && (
            <p className={`text-xs mt-1 ${variant === 'destructive' ? 'text-destructive/70' : 'text-muted-foreground'}`}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50 overflow-hidden">
        {children}
      </div>
    </motion.div>
  )
}
