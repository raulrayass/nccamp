'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { ReactNode } from 'react'

interface SettingRowProps {
  icon?: ReactNode
  label: string
  value?: string | ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive'
  clickable?: boolean
}

export function SettingRow({
  icon,
  label,
  value,
  onClick,
  variant = 'default',
  clickable = true,
}: SettingRowProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={!clickable}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        clickable ? 'hover:bg-muted/50 active:bg-muted' : ''
      } ${variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}
      whileTap={clickable ? { scale: 0.98 } : {}}
    >
      {icon && <div className="w-6 h-6 text-muted-foreground flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${variant === 'destructive' ? 'text-destructive' : ''}`}>
          {label}
        </p>
        {value && <p className="text-xs text-muted-foreground truncate">{value}</p>}
      </div>
      {clickable && <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
    </motion.button>
  )
}
