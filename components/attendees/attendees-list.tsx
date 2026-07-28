'use client'

import { useState } from 'react'
import { Attendee, Church, Team, Room } from '@/lib/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2, LogIn, LogOut, Eye } from 'lucide-react'
import { MobileSheet } from '@/components/mobile'

interface AttendeesListProps {
  attendees: Attendee[]
  churches: Church[]
  teams: Team[]
  rooms: Room[]
  searchTerm: string
  onSearch: (term: string) => void
  onEdit: (attendee: Attendee) => void
  onDelete: (id: number) => void
  onToggleCheckIn: (attendee: Attendee) => void
  onViewHistory: (attendeeId: number) => void
  isPending: boolean
}

function getChurchName(churchId: number | null, churches: Church[]): string {
  if (!churchId) return '-'
  return churches.find(c => c.id === churchId)?.name || '-'
}

function getTeamName(teamId: number | null, teams: Team[]): string {
  if (!teamId) return '-'
  return teams.find(t => t.id === teamId)?.name || '-'
}

function getRoomName(roomId: number | null, rooms: Room[]): string {
  if (!roomId) return '-'
  return rooms.find(r => r.id === roomId)?.name || '-'
}

export function AttendeesList({
  attendees,
  churches,
  teams,
  rooms,
  searchTerm,
  onSearch,
  onEdit,
  onDelete,
  onToggleCheckIn,
  onViewHistory,
  isPending,
}: AttendeesListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Mobile view - Cards
  const MobileView = () => (
    <div className="space-y-3 md:hidden">
      {attendees.length === 0 ? (
        <Card className="p-4 text-center text-muted-foreground">
          No hay asistentes registrados
        </Card>
      ) : (
        attendees.map((attendee) => (
          <Card key={attendee.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{attendee.name}</p>
                <p className="text-xs text-muted-foreground">{attendee.phone || 'Sin teléfono'}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    attendee.checkedIn 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                  }`}>
                    {attendee.checkedIn ? 'Dentro' : 'Fuera'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleCheckIn(attendee)}
                  disabled={isPending}
                >
                  {attendee.checkedIn ? (
                    <LogOut className="w-4 h-4" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(attendee)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(attendee.id)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
            
            {expandedId === attendee.id && (
              <div className="border-t pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Iglesia:</span>
                  <span>{getChurchName(attendee.churchId, churches)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipo:</span>
                  <span>{getTeamName(attendee.teamId, teams)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sala:</span>
                  <span>{getRoomName(attendee.roomId, rooms)}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onViewHistory(attendee.id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver historial
                </Button>
              </div>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => setExpandedId(expandedId === attendee.id ? null : attendee.id)}
            >
              {expandedId === attendee.id ? 'Menos' : 'Más'}
            </Button>
          </Card>
        ))
      )}
    </div>
  )

  // Desktop view - Table
  const DesktopView = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 font-semibold">Nombre</th>
            <th className="text-left py-2 px-3 font-semibold">Teléfono</th>
            <th className="text-left py-2 px-3 font-semibold">Iglesia</th>
            <th className="text-left py-2 px-3 font-semibold">Equipo</th>
            <th className="text-left py-2 px-3 font-semibold">Sala</th>
            <th className="text-center py-2 px-3 font-semibold">Estado</th>
            <th className="text-right py-2 px-3 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-3 px-3 font-medium">{attendee.name}</td>
              <td className="py-3 px-3 text-muted-foreground">{attendee.phone || '-'}</td>
              <td className="py-3 px-3 text-muted-foreground">{getChurchName(attendee.churchId, churches)}</td>
              <td className="py-3 px-3 text-muted-foreground">{getTeamName(attendee.teamId, teams)}</td>
              <td className="py-3 px-3 text-muted-foreground">{getRoomName(attendee.roomId, rooms)}</td>
              <td className="py-3 px-3 text-center">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  attendee.checkedIn
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {attendee.checkedIn ? 'Dentro' : 'Fuera'}
                </span>
              </td>
              <td className="py-3 px-3 text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleCheckIn(attendee)}
                    disabled={isPending}
                    title={attendee.checkedIn ? 'Check out' : 'Check in'}
                  >
                    {attendee.checkedIn ? (
                      <LogOut className="w-4 h-4" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(attendee)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(attendee.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewHistory(attendee.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Views */}
      <MobileView />
      <DesktopView />

      {/* Empty state */}
      {attendees.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No hay asistentes que coincidan con tu búsqueda</p>
        </Card>
      )}
    </div>
  )
}
