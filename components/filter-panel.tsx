'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Filter, X } from 'lucide-react'

export interface FilterConfig {
  id: string
  label: string
  type: 'search' | 'select' | 'number'
  placeholder?: string
  options?: { value: string; label: string }[]
  value: string
}

interface FilterPanelProps {
  filters: FilterConfig[]
  onFilterChange: (filterId: string, value: string) => void
  onClearAll: () => void
}

export function FilterPanel({
  filters,
  onFilterChange,
  onClearAll,
}: FilterPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const activeFilters = filters.filter((f) => f.value && f.value !== 'all')
  const activeCount = activeFilters.length

  // Separate search from advanced filters
  const searchFilter = filters.find((f) => f.id === 'search')
  const statusFilter = filters.find((f) => f.id === 'status')
  const advancedFilters = filters.filter((f) => f.id !== 'search' && f.id !== 'status')

  return (
    <div className="space-y-2">
      {/* Search + Status row - always visible */}
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        {/* Search */}
        {searchFilter && (
          <div className="flex-1">
            <Input
              type="text"
              value={searchFilter.value}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder={searchFilter.placeholder || 'Buscar...'}
              className="h-9 text-sm"
            />
          </div>
        )}

        {/* Status Select */}
        {statusFilter && (
          <div className="w-full sm:w-48">
            <Select value={statusFilter.value} onValueChange={(v) => onFilterChange('status', v)}>
              <SelectTrigger className="h-9 text-sm">
                {statusFilter.value && statusFilter.value !== 'all' ? (
                  <span>{statusFilter.options?.find((o) => o.value === statusFilter.value)?.label}</span>
                ) : (
                  <SelectValue placeholder={statusFilter.placeholder} />
                )}
              </SelectTrigger>
              <SelectContent>
                {statusFilter.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <Button
          variant={activeCount > 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-1.5 h-9 text-sm w-full sm:w-auto"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Más</span>
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary/20 rounded-full">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Advanced Filters - collapsible */}
      {showAdvanced && advancedFilters.length > 0 && (
        <div className="border border-border/50 rounded-lg p-3 bg-muted/30 backdrop-blur-sm space-y-3">
          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {advancedFilters.map((filter) => (
              <div key={filter.id} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {filter.label}
                </label>
                {filter.type === 'search' && (
                  <Input
                    type="text"
                    value={filter.value}
                    onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    placeholder={filter.placeholder || 'Buscar...'}
                    className="h-8 text-sm"
                  />
                )}
                {filter.type === 'number' && (
                  <Input
                    type="number"
                    value={filter.value}
                    onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    placeholder={filter.placeholder || '0'}
                    className="h-8 text-sm"
                  />
                )}
                {filter.type === 'select' && filter.options && (
                  <Select value={filter.value} onValueChange={(v) => onFilterChange(filter.id, v)}>
                    <SelectTrigger className="h-8 text-sm">
                      {filter.value && filter.value !== 'all' ? (
                        <span className="text-sm">{filter.options.find((o) => o.value === filter.value)?.label}</span>
                      ) : (
                        <SelectValue placeholder={filter.placeholder || 'Selecciona'} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          {activeCount > 0 && (
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-3 h-3" />
                Limpiar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Tags - shown below filters */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <div
              key={filter.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <span>{filter.label}:</span>
              <span className="font-semibold">
                {filter.type === 'select'
                  ? filter.options?.find((o) => o.value === filter.value)?.label || filter.value
                  : filter.value}
              </span>
              <button
                onClick={() => onFilterChange(filter.id, filter.id === 'status' || filter.id === 'checkedIn' ? 'all' : '')}
                className="ml-1 hover:opacity-70 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
