'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  getAttendees,
  createAttendee,
  updateAttendee,
  deleteAttendee,
} from '@/app/actions/attendees'
import { getChurches } from '@/app/actions/churches'
import { getTeams } from '@/app/actions/teams'
import { getRooms } from '@/app/actions/rooms'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { Attendee, Church, Team, Room } from '@/lib/db/schema'
import { PageHeaderNative } from '@/components/page-header-native'
import { SettingSection } from '@/components/setting-section'
import { SettingRow } from '@/components/setting-row'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { User, Phone, MapPin, Shirt, Heart, Users, Home, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface AttendeeFormPageProps {
  userId: string
  attendeeId?: number
  mode: 'create' | 'edit'
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const GENDERS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
]

export function AttendeeFormPage({ userId, attendeeId, mode }: AttendeeFormPageProps) {
  const router = useRouter()
  const { eventId, isInitialized } = useEventSession()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(mode === 'edit' || !isInitialized)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [churches, setChurches] = useState<Church[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  const [form, setForm] = useState({
    name: '',
    age: '',
    shirtSize: 'M',
    sex: 'male',
    phone: '',
    church: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactName2: '',
    emergencyContactPhone2: '',
    allergies: '',
    roomId: '',
    teamId: '',
    totalAmount: '',
    discount: '0',
    notes: '',
  })

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        if (!eventId) return

        const [churchesData, teamsData, roomsData] = await Promise.all([
          getChurches(eventId),
          getTeams(eventId),
          getRooms(eventId),
        ])

        setChurches(churchesData || [])
        setTeams(teamsData || [])
        setRooms(roomsData || [])

        // Load attendee if editing
        if (mode === 'edit' && attendeeId) {
          const attendees = await getAttendees(eventId)
          const attendee = attendees.find((a) => a.id === attendeeId)
          if (attendee) {
            setForm({
              name: attendee.name || '',
              age: attendee.age?.toString() || '',
              shirtSize: attendee.shirtSize || 'M',
              sex: attendee.sex || 'male',
              phone: attendee.phone || '',
              church: attendee.church || '',
              emergencyContactName: attendee.emergencyContactName || '',
              emergencyContactPhone: attendee.emergencyContactPhone || '',
              emergencyContactName2: attendee.emergencyContactName2 || '',
              emergencyContactPhone2: attendee.emergencyContactPhone2 || '',
              allergies: attendee.allergies || '',
              roomId: attendee.roomId?.toString() || '',
              teamId: attendee.teamId?.toString() || '',
              totalAmount: attendee.totalAmount?.toString() || '',
              discount: attendee.discount?.toString() || '0',
              notes: attendee.notes || '',
            })
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [eventId, mode, attendeeId, isInitialized])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      toast.error('Evento no seleccionado')
      return
    }

    startTransition(async () => {
      try {
        const data = {
          name: form.name,
          age: form.age ? parseInt(form.age, 10) : null,
          shirtSize: form.shirtSize,
          sex: form.sex,
          phone: form.phone,
          church: form.church,
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
          emergencyContactName2: form.emergencyContactName2,
          emergencyContactPhone2: form.emergencyContactPhone2,
          allergies: form.allergies,
          roomId: form.roomId ? parseInt(form.roomId, 10) : null,
          teamId: form.teamId ? parseInt(form.teamId, 10) : null,
          totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null,
          discount: form.discount ? parseFloat(form.discount) : 0,
          notes: form.notes,
        }

        if (mode === 'create') {
          await createAttendee(eventId, data)
          toast.success('Campero creado')
        } else if (attendeeId) {
          await updateAttendee(eventId, attendeeId, data)
          toast.success('Campero actualizado')
        }

        router.push('/attendees')
      } catch (error) {
        toast.error('Error al guardar campero')
        console.error(error)
      }
    })
  }

  const handleDelete = async () => {
    if (!eventId || !attendeeId) return

    startTransition(async () => {
      try {
        await deleteAttendee(eventId, attendeeId)
        toast.success('Campero eliminado')
        router.push('/attendees')
      } catch (error) {
        toast.error('Error al eliminar campero')
        console.error(error)
      }
    })
  }

  // Redirect if eventId is not available after initialization
  if (isInitialized && !eventId) {
    router.push('/select-event')
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeaderNative
        title={mode === 'create' ? 'Nuevo Campero' : 'Editar Campero'}
        showBack={true}
      />

      <form onSubmit={handleSave} className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-6">
        {/* Personal Info */}
        <SettingSection title="Información Personal">
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-medium">
                Nombre completo *
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Juan Pérez"
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age" className="text-xs font-medium">
                  Edad
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="18"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sex" className="text-xs font-medium">
                  Género
                </Label>
                <select
                  id="sex"
                  value={form.sex}
                  onChange={(e) => setForm({ ...form, sex: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-xs font-medium">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="5551234567"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="shirt" className="text-xs font-medium">
                  Talla de playera
                </Label>
                <select
                  id="shirt"
                  value={form.shirtSize}
                  onChange={(e) => setForm({ ...form, shirtSize: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  {SHIRT_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="church" className="text-xs font-medium">
                Iglesia
              </Label>
              <select
                id="church"
                value={form.church}
                onChange={(e) => setForm({ ...form, church: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
              >
                <option value="">Seleccionar iglesia...</option>
                {churches.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SettingSection>

        {/* Emergency Contacts */}
        <SettingSection title="Contactos de Emergencia">
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="ec1" className="text-xs font-medium">
                Contacto 1 - Nombre
              </Label>
              <Input
                id="ec1"
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                placeholder="Nombre"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ec1p" className="text-xs font-medium">
                Contacto 1 - Teléfono
              </Label>
              <Input
                id="ec1p"
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                placeholder="Teléfono"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ec2" className="text-xs font-medium">
                Contacto 2 - Nombre
              </Label>
              <Input
                id="ec2"
                value={form.emergencyContactName2}
                onChange={(e) => setForm({ ...form, emergencyContactName2: e.target.value })}
                placeholder="Nombre"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ec2p" className="text-xs font-medium">
                Contacto 2 - Teléfono
              </Label>
              <Input
                id="ec2p"
                value={form.emergencyContactPhone2}
                onChange={(e) => setForm({ ...form, emergencyContactPhone2: e.target.value })}
                placeholder="Teléfono"
                className="mt-1"
              />
            </div>
          </div>
        </SettingSection>

        {/* Health & Assignments */}
        <SettingSection title="Salud y Asignaciones">
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="allergies" className="text-xs font-medium">
                Alergias
              </Label>
              <Input
                id="allergies"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="Ej. Maní, lácteos"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room" className="text-xs font-medium">
                  Habitación
                </Label>
                <select
                  id="room"
                  value={form.roomId}
                  onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  <option value="">Seleccionar habitación...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id.toString()}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="team" className="text-xs font-medium">
                  Equipo
                </Label>
                <select
                  id="team"
                  value={form.teamId}
                  onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  <option value="">Seleccionar equipo...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Financial */}
        <SettingSection title="Financiero">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total" className="text-xs font-medium">
                  Total a pagar
                </Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="discount" className="text-xs font-medium">
                  Descuento
                </Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Notes */}
        <SettingSection title="Notas">
          <div className="p-4">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            />
          </div>
        </SettingSection>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-6">
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          {mode === 'edit' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar campero</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
