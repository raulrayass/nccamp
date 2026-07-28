'use client'

import { useState } from 'react'
import { Attendee, Church, Team, Room } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MobileSheet } from '@/components/mobile'

interface AttendeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  editingAttendee: Attendee | null
  churches: Church[]
  teams: Team[]
  rooms: Room[]
  isPending: boolean
}

const emptyForm = {
  name: '',
  phone: '',
  churchId: '',
  teamId: '',
  roomId: '',
  notes: '',
}

export function AttendeeForm({
  open,
  onOpenChange,
  onSubmit,
  editingAttendee,
  churches,
  teams,
  rooms,
  isPending,
}: AttendeeFormProps) {
  const [form, setForm] = useState(editingAttendee || emptyForm)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
    onOpenChange(false)
    setForm(emptyForm)
  }

  return (
    <MobileSheet
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) setForm(emptyForm)
      }}
      title={editingAttendee ? 'Editar asistente' : 'Nuevo asistente'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre completo"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Número de teléfono"
            type="tel"
          />
        </div>

        <div>
          <Label htmlFor="church">Iglesia</Label>
          <select
            id="church"
            value={form.churchId}
            onChange={(e) => setForm({ ...form, churchId: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background h-10"
          >
            <option value="">Selecciona una iglesia</option>
            {churches.map((church) => (
              <option key={church.id} value={church.id}>
                {church.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="team">Equipo</Label>
          <select
            id="team"
            value={form.teamId}
            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background h-10"
          >
            <option value="">Selecciona un equipo</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="room">Sala</Label>
          <select
            id="room"
            value={form.roomId}
            onChange={(e) => setForm({ ...form, roomId: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background h-10"
          >
            <option value="">Selecciona una sala</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="notes">Notas</Label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notas adicionales"
            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
            rows={3}
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
            {editingAttendee ? 'Guardar cambios' : 'Crear asistente'}
          </Button>
        </div>
      </form>
    </MobileSheet>
  )
}
