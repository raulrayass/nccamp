'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { ReactNode } from 'react'

interface MobileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[500px]',
  lg: 'sm:max-w-[600px]',
}

export function MobileSheet({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  description,
  size = 'md'
}: MobileSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`${sizeMap[size]} max-h-[90vh] overflow-y-auto rounded-[2rem] border-border/70 p-6 shadow-2xl`}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] rounded-t-[2rem] border-border/70 bg-card shadow-[0_-12px_40px_color-mix(in_srgb,var(--foreground)_12%,transparent)]">
        <DrawerHeader className="border-b-0 px-5 pb-3 pt-5 text-left">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted" />
          <DrawerTitle className="text-xl tracking-tight">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-5 py-3 pb-safe">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
