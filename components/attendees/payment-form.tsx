'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MobileSheet } from '@/components/mobile'
import { useState } from 'react'

interface PaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { attendeeId: number; amount: string; description: string }) => Promise<void>
  attendeeId: number | null
  attendeeName?: string
  isPending: boolean
}

export function PaymentForm({
  open,
  onOpenChange,
  onSubmit,
  attendeeId,
  attendeeName,
  isPending,
}: PaymentFormProps) {
  const [form, setForm] = useState({ amount: '', description: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attendeeId) return
    await onSubmit({
      attendeeId,
      amount: form.amount,
      description: form.description,
    })
    onOpenChange(false)
    setForm({ amount: '', description: '' })
  }

  return (
    <MobileSheet
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) setForm({ amount: '', description: '' })
      }}
      title="Registrar pago"
      description={attendeeName ? `Pago para ${attendeeName}` : undefined}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">Monto *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ej: Cuota de membresía"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            Registrar pago
          </Button>
        </div>
      </form>
    </MobileSheet>
  )
}
