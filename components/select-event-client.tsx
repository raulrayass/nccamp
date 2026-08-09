'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { createEvent, setDefaultEvent } from '@/app/actions/events'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Plus, Star, Calendar, MapPin, LogIn, Search, SlidersHorizontal } from 'lucide-react'

interface EventOption { id: number; name: string }
type EventFilter = 'Próximos' | 'En curso' | 'Pasados'

const eventImages = ['/event-camperos.svg', '/event-staff.svg', '/event-juegos.svg', '/event-reunion.svg']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value + 'T12:00:00'))
}

export function SelectEventClient({ userId, initialEvents }: { userId: string; initialEvents: EventOption[] }) {
  const router = useRouter()
  const { setEventSession } = useEventSession()
  const [isPending, startTransition] = useTransition()
  const [showCreateForm, setShowCreateForm] = useState(initialEvents.length === 0)
  const [settingDefault, setSettingDefault] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<EventFilter>('Próximos')
  const [formData, setFormData] = useState({ name: '', country: 'México', startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] })

  const handleSelectEvent = (eventId: number) => { setEventSession(eventId); router.push('/') }
  const handleSwitchAccount = async () => { try { await signOut() } finally { router.push('/auth/signin') } }
  const handleSetDefault = async (eventId: number) => {
    setSettingDefault(eventId)
    try { await setDefaultEvent(userId, eventId); setEventSession(eventId); toast.success('Evento establecido como predeterminado') }
    catch { toast.error('Error al establecer evento predeterminado') }
    finally { setSettingDefault(null) }
  }
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { toast.error('El nombre del evento es requerido'); return }
    startTransition(async () => {
      try { const event = await createEvent(userId, formData.name.trim(), formData.country, formData.startDate, formData.endDate); setEventSession(event.id); router.push('/'); toast.success('Evento creado exitosamente') }
      catch { toast.error('Error al crear el evento') }
    })
  }

  const filteredEvents = initialEvents.filter((event) => event.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <main className="events-screen w-full max-w-md px-3 pb-24 pt-5 sm:px-4">
      <header className="mb-5 flex items-start justify-between">
        <div><h1 className="text-[2rem] font-bold leading-none tracking-tight text-white">Eventos</h1><p className="mt-2 text-xs text-[#8E8E93]">Selecciona un evento para continuar</p></div>
        <button onClick={handleSwitchAccount} className="events-icon-button" title="Cambiar cuenta"><LogIn className="h-4 w-4" /></button>
      </header>

      {!showCreateForm && <>
        <div className="events-search mb-3 flex items-center gap-2"><Search className="h-4 w-4 shrink-0 text-[#8E8E93]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar eventos" aria-label="Buscar eventos" /><button className="events-filter-button" aria-label="Filtrar eventos"><SlidersHorizontal className="h-4 w-4" /></button></div>
        <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-full bg-[#1C1C1E] p-1">{(['Próximos', 'En curso', 'Pasados'] as EventFilter[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={`events-chip ${filter === item ? 'events-chip-active' : ''}`}>{item}</button>)}</div>

        {filteredEvents.length > 0 ? <div className="flex flex-col gap-2.5">{filteredEvents.map((event, index) => <article key={event.id} className="events-card" onClick={() => handleSelectEvent(event.id)}>
          <img src={eventImages[index % eventImages.length]} alt={`Ilustración de ${event.name}`} className="events-card-image" />
          <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-white">{event.name}</h2><p className="mt-1 text-[11px] font-medium text-[#22C55E]">{formatDate(new Date().toISOString().split('T')[0])}</p><p className="mt-1 flex items-center gap-1 truncate text-[10px] text-[#8E8E93]"><MapPin className="h-3 w-3" />{event.name}</p></div>
          <div className="flex shrink-0 flex-col items-end gap-2"><span className="text-[10px] font-semibold text-[#22C55E]">Próximo</span><button onClick={(e) => { e.stopPropagation(); handleSetDefault(event.id) }} className="events-star" aria-label="Establecer como predeterminado"><Star className={`h-3.5 w-3.5 ${settingDefault === event.id ? 'fill-[#22C55E] text-[#22C55E]' : ''}`} /></button></div>
        </article>)}</div> : <div className="events-empty">No hay eventos que coincidan.</div>}
        <button onClick={() => setShowCreateForm(true)} className="events-create-button"><Plus className="h-4 w-4" />Crear evento</button>
      </>}

      {showCreateForm && <form onSubmit={handleCreateEvent} className="events-form"><div><label>Nombre del evento</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Campamento 2026" disabled={isPending} /></div><div><label>País</label><Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} disabled={isPending} /></div><div className="grid grid-cols-2 gap-2"><div><label>Fecha inicio</label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} disabled={isPending} /></div><div><label>Fecha fin</label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} disabled={isPending} /></div></div><div className="flex gap-2">{initialEvents.length > 0 && <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">Cancelar</Button>}<Button type="submit" disabled={isPending} className="flex-1 bg-[#22C55E] text-black hover:bg-[#22C55E]/90">{isPending ? 'Creando...' : 'Crear evento'}</Button></div></form>}
    </main>
  )
}
