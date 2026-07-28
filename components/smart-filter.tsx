'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface SmartFilterProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  churchFilter: string
  onChurchChange: (value: string) => void
  churches: Array<{ id: number; name: string }>
  teamFilter?: string
  onTeamChange?: (value: string) => void
  teams?: Array<{ id: number; name: string }>
  roomFilter?: string
  onRoomChange?: (value: string) => void
  rooms?: Array<{ id: number; name: string }>
  onClearFilters: () => void
}

export function SmartFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  churchFilter,
  onChurchChange,
  churches,
  teamFilter,
  onTeamChange,
  teams = [],
  roomFilter,
  onRoomChange,
  rooms = [],
  onClearFilters,
}: SmartFilterProps) {
  const activeFiltersCount = [
    search ? 1 : 0,
    statusFilter !== 'all' ? 1 : 0,
    churchFilter ? 1 : 0,
    teamFilter ? 1 : 0,
    roomFilter ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-1.5 bg-card border-2 border-border rounded-lg p-3 sm:p-3.5">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar..."
          className="pl-10 h-8 text-xs border-2 border-border rounded-md"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick filters - Row 1: Status */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
        {/* Status quick filters */}
        <Button
          variant={statusFilter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(statusFilter === 'paid' ? 'all' : 'paid')}
          className="h-8 text-xs py-1 px-2 border-2"
        >
          Pagado
        </Button>
        <Button
          variant={statusFilter === 'partial' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(statusFilter === 'partial' ? 'all' : 'partial')}
          className="h-8 text-xs py-1 px-2 border-2"
        >
          Parcial
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(statusFilter === 'pending' ? 'all' : 'pending')}
          className="h-8 text-xs py-1 px-2 border-2"
        >
          Pendiente
        </Button>
      </div>

      {/* Quick filters - Row 2: Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {/* Church filter */}
        <Select value={churchFilter} onValueChange={onChurchChange}>
          <SelectTrigger className="text-xs h-8 py-1 px-2 border-2 border-border rounded-md">
            <SelectValue placeholder="Iglesia">
              {churchFilter 
                ? churches.find(c => c.id.toString() === churchFilter)?.name || 'Iglesia'
                : 'Iglesia'
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las iglesias</SelectItem>
            {churches.map((church) => (
              <SelectItem key={church.id} value={church.id.toString()}>
                {church.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Team filter */}
        {teams.length > 0 && onTeamChange && (
          <Select value={teamFilter || ''} onValueChange={onTeamChange}>
            <SelectTrigger className="text-xs h-8 py-1 px-2 border-2 border-border rounded-md">
              <SelectValue placeholder="Equipo">
                {teamFilter 
                  ? teams.find(t => t.id.toString() === teamFilter)?.name || 'Equipo'
                  : 'Equipo'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los equipos</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Room filter */}
        {rooms.length > 0 && onRoomChange && (
          <Select value={roomFilter || ''} onValueChange={onRoomChange}>
            <SelectTrigger className="text-xs h-8 py-1 px-2 border-2 border-border rounded-md">
              <SelectValue placeholder="Habitación">
                {roomFilter 
                  ? rooms.find(r => r.id.toString() === roomFilter)?.name || 'Habitación'
                  : 'Habitación'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las habitaciones</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs"
          >
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  )
}
