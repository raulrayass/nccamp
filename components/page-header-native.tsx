'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface PageHeaderNativeProps {
  title: string
  showBack?: boolean
  actions?: React.ReactNode
}

export function PageHeaderNative({ title, showBack = true, actions }: PageHeaderNativeProps) {
  const router = useRouter()

  return (
    <motion.div
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <motion.button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </motion.div>
  )
}
