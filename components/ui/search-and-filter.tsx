'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Search, Filter } from 'lucide-react'
import { useState } from 'react'

interface FilterOption {
  id: string
  label: string
  value: string
}

interface SearchAndFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: {
    label: string
    options: FilterOption[]
    value: string
    onChange: (value: string) => void
  }[]
  onReset?: () => void
}

export function SearchAndFilter({
  searchValue,
  onSearchChange,
  filters,
  onReset,
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = filters?.some(f => f.value !== '')

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 rounded-full border-border/70 bg-card pl-11 pr-10 shadow-sm placeholder:text-muted-foreground/70 focus-visible:ring-2"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Filters toggle */}
      {filters && filters.length > 0 && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-primary/20 rounded-full text-xs">
                {filters.filter(f => f.value !== '').length}
              </span>
            )}
          </Button>
          {hasActiveFilters && onReset && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
            >
              Limpiar
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && filters && filters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
          {filters.map((filter) => (
            <div key={filter.label}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {filter.label}
              </label>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
              >
                <option value="">Todos</option>
                {filter.options.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
