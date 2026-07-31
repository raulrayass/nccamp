'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { createEvent, setDefaultEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Plus, Star, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { SettingSection } from '@/components/setting-section'
import { SettingRow } from '@/components/setting-row'

interface EventOption {
  id: number
  name: string
}

export function SelectEventClient({
  userId,
  initialEvents,
}: {
  userId: string
  initialEvents: EventOption[]
}) {
  const router = useRouter()
  const { setEventSession } = useEventSession()
  const [isPending, startTransition] = useTransition()
  const [showCreateForm, setShowCreateForm] = useState(initialEvents.length === 0)
  const [settingDefault, setSettingDefault] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    country: 'México',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const handleSelectEvent = (eventId: number) => {
    setEventSession(eventId)
    router.push('/')
  }

  const handleSetDefault = async (eventId: number) => {
    setSettingDefault(eventId)
    try {
      await setDefaultEvent(userId, eventId)
      setEventSession(eventId)
      toast.success('Evento establecido como predeterminado')
    } catch (error) {
      toast.error('Error al establecer evento predeterminado')
      console.error(error)
    } finally {
      setSettingDefault(null)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('El nombre del evento es requerido')
      return
    }

    startTransition(async () => {
      try {
        const event = await createEvent(
          userId,
          formData.name.trim(),
          formData.country,
          formData.startDate,
          formData.endDate
        )
        setEventSession(event.id)
        router.push('/')
        toast.success('Evento creado exitosamente')
      } catch (error) {
        toast.error('Error al crear el evento')
        console.error(error)
      }
    })
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Selecciona Evento</h1>
        <p className="text-foreground/60">Elige uno de tus eventos o crea uno nuevo</p>
      </div>

      {/* Mostrar eventos existentes */}
      {initialEvents.length > 0 && !showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SettingSection title="Mis Eventos">
            <div className="space-y-1">
              {initialEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => handleSelectEvent(event.id)}
                    disabled={isPending}
                    className="w-full group relative"
                  >
                    <SettingRow icon={Calendar} disabled={isPending}>
                      <div className="flex-1 text-left">
                        <div className="text-foreground font-medium">{event.name}</div>
                        <div className="text-xs text-foreground/50 mt-0.5">Toca para seleccionar</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
                    </SettingRow>
                  </button>

                  <motion.button
                    onClick={() => handleSetDefault(event.id)}
                    disabled={settingDefault !== null || isPending}
                    className="w-full text-left px-4 py-2.5 text-xs text-foreground/60 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2.5"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Star className={`w-4 h-4 ${settingDefault === event.id ? 'fill-green-600 text-green-600' : ''}`} />
                    {settingDefault === event.id ? 'Estableciendo...' : 'Establecer como predeterminado'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </SettingSection>

          <motion.button
            onClick={() => setShowCreateForm(true)}
            disabled={isPending}
            className="w-full mt-6 py-3 px-4 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center gap-2 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Crear Nuevo Evento
          </motion.button>
        </motion.div>
      )}

      {/* Formulario para crear evento */}
      {showCreateForm && (
        <motion.form
          onSubmit={handleCreateEvent}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SettingSection title="Información del Evento">
            <div className="space-y-4 px-4 py-3">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
                  Nombre *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Campamento 2026"
                  disabled={isPending}
                  className="bg-muted border-0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
                  País
                </label>
                <Input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  placeholder="ej: Colombia"
                  disabled={isPending}
                  className="bg-muted border-0"
                />
              </div>
            </div>
          </SettingSection>

          <SettingSection title="Fechas">
            <div className="space-y-4 px-4 py-3">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={isPending}
                  className="bg-muted border-0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={isPending}
                  className="bg-muted border-0"
                />
              </div>
            </div>
          </SettingSection>

          <div className="flex gap-3 pt-4">
            {initialEvents.length > 0 && (
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1"
                disabled={isPending}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? 'Creando...' : 'Crear Evento'}
            </Button>
          </div>
        </motion.form>
      )}
    </motion.div>
  )
}
