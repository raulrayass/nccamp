'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { GroupTabs, FINANZAS_TABS } from '@/components/group-tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getTransactions, createTransaction, updateTransaction, deleteTransaction, getDashboardData,
} from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { useEvent } from '@/lib/contexts/event-context'
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, FileDown, TrendingUp, TrendingDown, Wallet, Search, X, Filter, ChevronDown as ChevronDownIcon, Download } from 'lucide-react'
import type { Category } from '@/lib/db/schema'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
import { ListSkeleton } from '@/components/list-skeleton'

type TransactionRow = Awaited<ReturnType<typeof getTransactions>>[number]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

// Muestra la fecha de la transacción + la hora real de registro (createdAt)
function formatDateTime(dateStr: string, createdAt: any) {
  if (!createdAt) return dateStr
  const hora = new Date(createdAt).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  return `${dateStr} · ${hora}`
}

function exportarRecibo(transaction: TransactionRow) {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const width = doc.internal.pageSize.getWidth()
    const height = doc.internal.pageSize.getHeight()
    let y = 15

    // Encabezado
    doc.setFontSize(18)
    doc.setFont('', 'bold')
    doc.text('RECIBO DE TRANSACCIÓN', width / 2, y, { align: 'center' })
    
    y += 10
    doc.setFontSize(8)
    doc.setFont('', 'normal')
    doc.setTextColor(100)
    doc.text(`Permanece Camp - Sistema de Finanzas`, width / 2, y, { align: 'center' })
    
    y += 7
    const dividerY = y
    doc.setDrawColor(200)
    doc.line(15, dividerY, width - 15, dividerY)

    // Información principal
    y += 8
    doc.setFontSize(11)
    doc.setFont('', 'bold')
    doc.setTextColor(0)
    
    const typeText = transaction.type === 'income' ? 'INGRESO' : 'EGRESO'
    const typeColor = transaction.type === 'income' ? [34, 197, 94] : [234, 88, 12]
    doc.setTextColor(...typeColor)
    doc.text(typeText, 15, y)
    
    y += 8
    doc.setTextColor(0)
    doc.setFont('', 'normal')
    doc.setFontSize(10)
    
    // Datos de la transacción
    const data = [
      ['Descripción:', transaction.description],
      ['Categoría:', transaction.categoryName ?? 'Sin categoría'],
      ['Monto:', formatCurrency(parseFloat(transaction.amount as string))],
      ['Tipo de pago:', !transaction.paymentMethod || transaction.paymentMethod === 'cash' ? 'Efectivo' : transaction.paymentMethod === 'transfer' ? 'Transferencia' : 'Depósito'],
      ['Fecha de transacción:', transaction.date],
      ['Hora de registro:', new Date(transaction.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })],
    ]

    const maxLabelWidth = 50
    const maxValueWidth = width - 80
    
    data.forEach(([label, value]) => {
      doc.setFont('', 'bold')
      doc.text(label, 15, y)
      doc.setFont('', 'normal')
      
      // Quebrar texto largo
      const wrappedText = doc.splitTextToSize(value, maxValueWidth)
      doc.text(wrappedText, 65, y)
      y += wrappedText.length * 5 + 3
    })

    // Sección de monto destacado
    y += 5
    doc.setDrawColor(200)
    doc.line(15, y, width - 15, y)
    
    y += 10
    doc.setFontSize(14)
    doc.setFont('', 'bold')
    doc.setTextColor(...typeColor)
    const montoText = `${transaction.type === 'income' ? '+' : '-'}${formatCurrency(parseFloat(transaction.amount as string))}`
    doc.text('Monto Total:', 15, y)
    doc.text(montoText, width - 15, y, { align: 'right' })

    // Pie de página
    y = height - 20
    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.setFont('', 'normal')
    doc.text(
      `Recibo generado: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      width / 2,
      y,
      { align: 'center' }
    )
    
    doc.text(
      `ID Transacción: ${transaction.id}`,
      width / 2,
      y + 5,
      { align: 'center' }
    )

    // Descargar
    const filename = `Recibo_${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}_${transaction.id}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
    toast.success('Recibo descargado correctamente')
  } catch (error) {
    console.error('Error al generar recibo:', error)
    toast.error('Error al generar el recibo')
  }
}

const defaultForm = {
  type: 'expense',
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
  paymentMethod: 'cash',
}

export function TransactionsClient({ userId, eventId }: { userId: string; eventId: number | null }) {
  const eventIdFromContext = useEvent().eventId
  const finalEventId = eventId ?? eventIdFromContext
  const [isPending, startTransition] = useTransition()
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  async function reload() {
    const [txs, cats] = await Promise.all([
      getTransactions(userId, { eventId: finalEventId }),
      getCategories(userId, 1, finalEventId),
    ])
    setTransactions(txs)
    setCategories(cats)
  }

  useEffect(() => {
    setLoading(true)
    reload().finally(() => setLoading(false))
  }, [userId, finalEventId])

  // Abre el modal de nueva transacción cuando el FAB del dock navega con ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openCreate()
    }
  }, [searchParams])

  function clearNewParam() {
    if (searchParams.get('new') === '1') {
      router.replace(pathname, { scroll: false })
    }
  }

  const filteredCategories = categories.filter(
    (c) => c.type === 'both' || c.type === form.type
  )

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCat !== 'all' && t.categoryId !== parseInt(filterCat)) return false
    if (filterMethod !== 'all' && t.paymentMethod !== filterMethod) return false
    if (dateFrom && t.date < dateFrom) return false
    if (dateTo && t.date > dateTo) return false
    if (search) {
      const searchLower = search.toLowerCase()
      const amount = parseFloat(t.amount as string)
      if (!t.description.toLowerCase().includes(searchLower) &&
        !formatCurrency(amount).includes(search)) return false
    }
    return true
  })

  const hasActiveFilters =
    !!search ||
    filterType !== 'all' ||
    filterCat !== 'all' ||
    filterMethod !== 'all' ||
    !!dateFrom ||
    !!dateTo

  function clearFilters() {
    setFilterType('all')
    setFilterCat('all')
    setFilterMethod('all')
    setSearch('')
    setDateFrom('')
    setDateTo('')
  }

  const totals = filtered.reduce(
    (acc, t) => {
      const amt = parseFloat(t.amount as string)
      return t.type === 'income'
        ? { ...acc, income: acc.income + amt }
        : { ...acc, expense: acc.expense + amt }
    },
    { income: 0, expense: 0 }
  )

  function openCreate() {
    setEditingId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(t: TransactionRow) {
    setEditingId(t.id)
    setForm({
      type: t.type,
      amount: t.amount as string,
      description: t.description,
      date: t.date,
      categoryId: String(t.categoryId),
      paymentMethod: t.paymentMethod || 'cash',
    })
    setDialogOpen(true)
  }

  function openDelete(id: number) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.categoryId) {
      toast.error('Selecciona una categoría')
      return
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }
    if (!form.description.trim()) {
      toast.error('La descripción es obligatoria')
      return
    }
    startTransition(async () => {
      try {
        if (!finalEventId) {
          toast.error('Debe haber un evento activo para crear transacciones')
          return
        }
        const data = {
          categoryId: parseInt(form.categoryId),
          type: form.type,
          amount: form.amount,
          description: form.description,
          date: form.date,
          paymentMethod: form.paymentMethod,
          eventId: finalEventId,
        }
        if (editingId) {
          await updateTransaction(userId, editingId, data)
          toast.success('Transacción actualizada')
        } else {
          await createTransaction(userId, data)
          toast.success('Transacción registrada')
        }
        setDialogOpen(false)
        clearNewParam()
        await reload()
      } catch (error) {
        toast.error('Error al guardar la transacción')
        console.error(error)
      }
    })
  }

  async function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      try {
        await deleteTransaction(userId, deletingId, finalEventId)
        toast.success('Transacción eliminada')
        setDeleteDialogOpen(false)
        await reload()
      } catch (error) {
        toast.error('Error al eliminar la transacción')
        console.error(error)
      }
    })
  }

  function exportToExcel() {
    if (filtered.length === 0) {
      toast.error('No hay transacciones para exportar')
      return
    }
    const data = filtered.map((t) => {
      const amount = parseFloat(t.amount as string)
      const signedAmount = t.type === 'income' ? amount : -amount

      const metodo = !t.paymentMethod || t.paymentMethod === 'cash' ? 'Efectivo'
        : t.paymentMethod === 'transfer' ? 'Transferencia'
        : t.paymentMethod === 'deposit' ? 'Depósito'
        : 'Efectivo'

      const registrado = t.createdAt
        ? new Date(t.createdAt).toLocaleString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
          })
        : ''

      return {
        Fecha: t.date,
        'Fecha y Hora de Registro': registrado,
        Tipo: t.type === 'income' ? 'Ingreso' : 'Egreso',
        Categoria: t.categoryName ?? 'Sin categoria',
        Descripcion: t.description,
        'Método de Pago': metodo,
        'Monto ($)': signedAmount,
      }
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones')
    XLSX.writeFile(wb, `Transacciones_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Transacciones exportadas correctamente')
  }

  if (loading) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
        <ListSkeleton count={8} variant="row" />
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader title="Finanzas">
        <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
          <FileDown className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Exportar</span>
        </Button>
        <Button onClick={openCreate} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Nueva</span>
        </Button>
      </PageHeader>

      {/* Tabs del grupo Finanzas */}
      <GroupTabs tabs={FINANZAS_TABS} />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Ingresos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(totals.income)}</p>
            </div>
            <div className="bg-emerald-600/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Egresos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(totals.expense)}</p>
            </div>
            <div className="bg-orange-600/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Balance General</p>
              <p className={`text-lg sm:text-2xl font-bold mt-1 ${totals.income - totals.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.income - totals.expense)}
              </p>
            </div>
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="page-search"
          type="text"
          placeholder="Buscar transacción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10 h-10 rounded-lg border border-border bg-white/5"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
            filterType === 'all'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white/5 text-foreground border-border hover:bg-white/10'
          )}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
            filterType === 'income'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white/5 text-foreground border-border hover:bg-white/10'
          )}
        >
          Ingresos
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
            filterType === 'expense'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white/5 text-foreground border-border hover:bg-white/10'
          )}
        >
          Egresos
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="gap-1.5 text-xs h-9 ml-auto"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Más filtros</span>
          <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Mostrando <span className="font-semibold text-foreground">{filtered.length}</span> de{' '}
          <span className="font-semibold text-foreground">{transactions.length}</span> transacciones
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card className="bg-white/5 border border-border">
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-2 block">Categoría</Label>
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="w-full text-sm border border-border rounded-md bg-background px-2 py-2 h-10"
                >
                  <option value="all">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Método de pago</Label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full text-sm border border-border rounded-md bg-background px-2 py-2 h-10"
                >
                  <option value="all">Todos</option>
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="deposit">Depósito</option>
                </select>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Desde</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Hasta</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="w-full mt-3"
            >
              Limpiar todos los filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-sm">
            {transactions.length === 0
              ? 'No hay transacciones aun. Haz clic en "Nueva" para comenzar.'
              : 'No se encontraron transacciones con los filtros actuales.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-1">
          {filtered.map((t) => {
            let borderColor = 'border-l-slate-400'
            if (t.paymentMethod === 'cash') borderColor = 'border-l-green-600'
            else if (t.paymentMethod === 'transfer') borderColor = 'border-l-blue-600'
            else if (t.paymentMethod === 'deposit') borderColor = 'border-l-purple-600'

            return (
              <div key={t.id} className={`p-1.5 sm:p-2.5 border border-l-4 border-border ${borderColor} rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 hover:bg-muted/50 transition-colors`}>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {t.type === 'income' ? (
                      <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-xs truncate">{t.description}</p>
                    <div className="hidden sm:flex gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{formatDateTime(t.date, t.createdAt)}</span>
                      <span>•</span>
                      <span>{t.categoryName ?? 'Sin categoría'}</span>
                      <span>•</span>
                      <span>{!t.paymentMethod || t.paymentMethod === 'cash' ? 'Efectivo' : t.paymentMethod === 'transfer' ? 'Transferencia' : 'Depósito'}</span>
                    </div>
                    <div className="sm:hidden flex gap-1.5 mt-0.5 text-xs text-muted-foreground">
                      <span className="text-xs">{formatDateTime(t.date, t.createdAt)}</span>
                      <span>•</span>
                      <span className="truncate text-xs">{t.categoryName ?? 'Sin categoría'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-1.5">
                  <p className={`text-xs sm:text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount as string))}
                  </p>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="w-6 h-6 sm:w-7 sm:h-7" onClick={() => exportarRecibo(t)} title="Descargar recibo">
                      <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 sm:w-7 sm:h-7" onClick={() => openEdit(t)}>
                      <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 sm:w-7 sm:h-7" onClick={() => openDelete(t.id)}>
                      <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) clearNewParam()
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">{editingId ? 'Editar transacción' : 'Nueva transacción'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="tx-type" className="text-xs sm:text-sm">Tipo</Label>
                <select
                  id="tx-type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })}
                  className="w-full text-xs border border-border rounded-md bg-background px-2 h-8"
                >
                  <option value="income">Ingreso</option>
                  <option value="expense">Egreso</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="amount" className="text-xs sm:text-sm">Monto</Label>
                <Input
                  id="amount" type="number" step="0.01" min="0.01" placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="desc" className="text-xs sm:text-sm">Descripción</Label>
              <Input
                id="desc" placeholder="Ej: compra de"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="tx-cat" className="text-xs sm:text-sm">Categoría</Label>
                <select
                  id="tx-cat"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full text-xs border border-border rounded-md bg-background px-2 h-8"
                >
                  <option value="">Selecciona categoría</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="date" className="text-xs sm:text-sm">Fecha</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-8 text-xs" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs sm:text-sm">Método de Pago</Label>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {[
                  { value: 'cash', label: 'Efectivo' },
                  { value: 'transfer', label: 'Transferencia' },
                  { value: 'deposit', label: 'Depósito' },
                ].map((option) => (
                  <label key={option.value} className={`flex items-center gap-1 cursor-pointer p-1.5 sm:p-2 rounded-lg border transition-all text-xs sm:text-sm ${form.paymentMethod === option.value ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={form.paymentMethod === option.value}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-1.5 sm:gap-2 mt-1 sm:mt-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); clearNewParam() }} className="h-8 text-xs sm:text-sm hover:bg-slate-100">Cancelar</Button>
              <Button type="submit" disabled={isPending || !form.categoryId} className="h-8 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400">
                {isPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar transacción</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
