'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Category } from '@/lib/db/schema'

export interface TransactionSmartFilterProps {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  categories: Category[]
  methodFilter: string
  onMethodChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  onClearFilters: () => void
}

const paymentMethods = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'deposit', label: 'Depósito' },
]

// Clases base compartidas por todos los controles del filtro para mantener
// altura, texto, padding, borde y radio consistentes.
const CONTROL = 'h-8 text-xs px-2 py-0 border-2 border-border rounded-md'

export function TransactionSmartFilter({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  categories,
  methodFilter,
  onMethodChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
}: TransactionSmartFilterProps) {
  const activeFiltersCount = [
    search ? 1 : 0,
    typeFilter !== 'all' ? 1 : 0,
    categoryFilter !== 'all' ? 1 : 0,
    methodFilter !== 'all' ? 1 : 0,
    dateFrom ? 1 : 0,
    dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-1.5 bg-card border-2 border-border rounded-lg p-2 overflow-hidden">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar..."
          className={`${CONTROL} w-full pl-8`}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Type quick filters - Row 1 */}
      <div className="grid grid-cols-3 gap-1.5">
        <Button
          variant={typeFilter === 'income' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange(typeFilter === 'income' ? 'all' : 'income')}
          className={`${CONTROL} w-full`}
        >
          Ingresos
        </Button>
        <Button
          variant={typeFilter === 'expense' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange(typeFilter === 'expense' ? 'all' : 'expense')}
          className={`${CONTROL} w-full`}
        >
          Egresos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClearFilters()}
          className={`${CONTROL} w-full`}
        >
          Todos
        </Button>
      </div>

      {/* Dropdowns - Row 2 */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className={`${CONTROL} w-full justify-between`}>
            <SelectValue placeholder="Categoría">
              <span className="truncate text-left">
                {categoryFilter && categoryFilter !== 'all'
                  ? categories.find(c => String(c.id) === categoryFilter)?.name || 'Categoría'
                  : 'Categoría'
                }
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Method filter */}
        <Select value={methodFilter} onValueChange={onMethodChange}>
          <SelectTrigger className={`${CONTROL} w-full justify-between`}>
            <SelectValue placeholder="Método">
              <span className="truncate text-left">
                {methodFilter === 'cash' ? 'Efectivo' : methodFilter === 'transfer' ? 'Transferencia' : methodFilter === 'deposit' ? 'Depósito' : 'Método'}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {paymentMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date range - Row 3 */}
      <div className="grid grid-cols-2 gap-1.5 min-w-0">
        <div className="relative min-w-0">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className={`${CONTROL} w-full min-w-0 appearance-none`}
          />
          {!dateFrom && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              Desde
            </span>
          )}
        </div>
        <div className="relative min-w-0">
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className={`${CONTROL} w-full min-w-0 appearance-none`}
          />
          {!dateTo && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              Hasta
            </span>
          )}
        </div>
      </div>

      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between text-xs gap-1 pt-0.5">
          <span className="text-muted-foreground truncate">
            {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs px-2"
          >
            Limpiar
          </Button>
        </div>
      )}
    </div>
  )
}
