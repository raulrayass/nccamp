'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { GroupTabs, PERSONAS_TABS } from '@/components/group-tabs'
import {
  getAllStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  addStaffPayment,
  deleteStaffPayment,
  getStaffPayments,
  bulkCreateStaff,
  toggleCheckIn,
} from "@/app/actions/staff"
import { getChurches } from '@/app/actions/churches'
import { getTeams } from '@/app/actions/teams'
import { getRooms } from '@/app/actions/rooms'
import { Staff, StaffPayment, Church, Team, Room } from '@/lib/db/schema'
import { formatMXN } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Trash2, DollarSign, Upload, Download, Edit2, Users, History, Search, CheckCircle2, Circle, CreditCard, UserCheck, Users2, LogIn } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SmartFilter } from '@/components/smart-filter'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'
import { PageHeader } from '@/components/page-header'
import { StatsBar } from '@/components/stats-bar'

interface Props {
  userId: string
}

const MINISTRIES = [
  'Deportes',
  'Cocina',
  'Pastor@',
  'Lider de equipo',
  'Logistica',
  'Administración',
  'Multimedia',
]

const emptyForm = {
  name: '',
  age: '',
  shirtSize: '',
  sex: '',
  phone: '',
  church: '',
  category: '',
  totalAmount: '',
  discount: 0,
  notes: '',
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function StaffClient({ userId }: Props) {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: '',
  })
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historyStaffId, setHistoryStaffId] = useState<number | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<StaffPayment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [churchFilter, setChurchFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initializeDefaults()
  }, [userId])

  // Abre el modal de agregar cuando el FAB del dock navega con ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingId(null)
      setForm({ ...emptyForm })
      setDialogOpen(true)
    }
  }, [searchParams])

  function clearNewParam() {
    if (searchParams.get('new') === '1') {
      router.replace(pathname, { scroll: false })
    }
  }

  async function initializeDefaults() {
    setLoading(true)
    try {
      await loadStaff()
      await loadChurches()
      await loadTeams()
      await loadRooms()
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  async function loadStaff() {
    const allData = await getAllStaff(userId)
    setStaffList(allData)
  }

  async function loadChurches() {
    const data = await getChurches(userId)
    setChurches(data)
  }

  async function loadTeams() {
    const data = await getTeams(userId)
    setTeams(data)
  }

  async function loadRooms() {
    const data = await getRooms(userId)
    setRooms(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.totalAmount)
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    if (!form.phone.trim()) {
      toast.error('El teléfono es obligatorio')
      return
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto total debe ser mayor a 0')
      return
    }

    const payload = {
      name: form.name,
      age: form.age ? parseInt(form.age, 10) : null,
      shirtSize: form.shirtSize,
      sex: form.sex,
      phone: form.phone,
      church: form.church,
      category: form.category,
      totalAmount: amount,
      discount: form.discount,
      notes: form.notes,
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateStaff(userId, editingId, payload)
          toast.success('Staff actualizado correctamente')
        } else {
          await createStaff(userId, payload)
          toast.success('Staff agregado correctamente')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        clearNewParam()
        await loadStaff()
      } catch (error) {
        toast.error('Error al guardar el staff')
        console.error(error)
      }
    })
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStaffId) return

    const amount = parseFloat(paymentForm.amount)
    const member = staffList.find((a) => a.id === selectedStaffId)
    if (!member) return

    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    const originalTotal = parseFloat(member.totalAmount as string)
    const discount = member.discount || 0
    const totalAmount = originalTotal * (1 - discount / 100)
    const alreadyPaid = parseFloat(member.amountPaid as string)
    const remaining = totalAmount - alreadyPaid

    if (amount > remaining) {
      toast.error(`El monto excede lo pendiente. Faltan $${remaining.toFixed(2)}`)
      return
    }

    startTransition(async () => {
      try {
        await addStaffPayment(userId, selectedStaffId, amount, paymentForm.date, paymentForm.paymentMethod, paymentForm.notes)
        toast.success(`Pago de $${amount.toFixed(2)} registrado para ${member.name}`)
        setPaymentDialogOpen(false)
        setPaymentForm({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          notes: '',
        })
        setSelectedStaffId(null)
        await loadStaff()
      } catch (error) {
        toast.error('Error al registrar el pago')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteStaff(userId, id)
        toast.success('Staff eliminado')
        await loadStaff()
      } catch (error) {
        toast.error('Error al eliminar el staff')
        console.error(error)
      }
    })
  }

  async function handleToggleCheckIn(member: Staff) {
    const next = !member.checkedIn
    startTransition(async () => {
      try {
        await toggleCheckIn(userId, member.id, next)
        toast.success(next ? `${member.name} registró Check-in` : `Check-in cancelado para ${member.name}`)
        await loadStaff()
      } catch (error) {
        toast.error('Error al actualizar el check-in')
        console.error(error)
      }
    })
  }

  async function openHistory(staffId: number) {
    setHistoryStaffId(staffId)
    setHistoryDialogOpen(true)
    setLoadingHistory(true)
    try {
      const data = await getStaffPayments(userId, staffId)
      setPaymentHistory(data)
    } catch (error) {
      toast.error('Error al cargar el historial de pagos')
      console.error(error)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function handleDeletePayment(paymentId: number) {
    startTransition(async () => {
      try {
        await deleteStaffPayment(userId, paymentId)
        toast.success('Pago eliminado')
        if (historyStaffId) {
          const data = await getStaffPayments(userId, historyStaffId)
          setPaymentHistory(data)
        }
        await loadStaff()
      } catch (error) {
        toast.error('Error al eliminar el pago')
        console.error(error)
      }
    })
  }

  function downloadTemplate() {
    const headers = [
      'Nombre',
      'Sexo',
      'Talla Camisa',
      'Teléfono',
      'Iglesia',
      'Ministerio',
      'Monto Total ($)',
      'Pagado ($)',
      'Notas',
    ]

    const rows = [
      headers,
      [
        'Enrique Medina',
        'H',
        'M',
        '3334001726',
        'NC Zapopan',
        'Pastor',
        '1200',
        '100',
        '',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Staff')
    XLSX.writeFile(wb, 'Plantilla_Staff.xlsx')
    toast.success('Plantilla descargada')
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const workbook = XLSX.read(event.target?.result, { type: 'binary' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

        if (rows.length < 2) {
          toast.error('El archivo debe contener al menos una fila de datos')
          return
        }

        const staffToImport = rows.slice(1).map((row) => ({
          name: String(row[0] || '').trim(),
          sex: String(row[1] || '').trim() || undefined,
          shirtSize: String(row[2] || '').trim() || undefined,
          phone: String(row[3] || '').trim() || undefined,
          church: String(row[4] || '').trim() || undefined,
          category: String(row[5] || '').trim() || undefined,
          totalAmount: parseFloat(String(row[6] || '0')),
          initialPayment: parseFloat(String(row[7] || '0')) || 0,
          notes: String(row[10] || '').trim() || undefined,
        }))

        if (
          staffToImport.every(
            (a) =>
              a.name &&
              a.totalAmount > 0
          )
        ) {
          await bulkCreateStaff(userId, staffToImport)
          toast.success(`${staffToImport.length} staff importados correctamente`)
          await loadStaff()
        } else {
          toast.error('Verifica que todos los registros tengan Nombre y Monto Total válidos.')
        }
      }
      reader.readAsBinaryString(file)
    } catch (error) {
      toast.error('Error al procesar el archivo')
      console.error(error)
    }
    e.target.value = ''
  }

  function exportCurrentData() {
    if (staffList.length === 0) {
      toast.error('No hay staff para exportar')
      return
    }
    const data = staffList.map((a) => {
      const originalTotal = parseFloat(a.totalAmount as string)
      const discount = a.discount || 0
      const total = originalTotal * (1 - discount / 100)
      const paid = parseFloat(a.amountPaid as string)
      const remaining = total - paid
      return {
        Nombre: a.name,
        Sexo: a.sex || '',
        'Talla Camisa': a.shirtSize || '',
        Teléfono: a.phone || '',
        Iglesia: a.church || '',
        Ministerio: a.category || '',
        'Monto Total ($)': total.toFixed(2),
        'Pagado ($)': paid.toFixed(2),
        'Falta Pagar ($)': remaining.toFixed(2),
        Estado: a.status === 'paid' ? 'Pagado' : a.status === 'partial' ? 'Parcial' : 'Pendiente',
        'Check-in': a.checkedIn ? 'Sí' : 'No',
        Notas: a.notes || '',
      }
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Staff')
    XLSX.writeFile(wb, `Staff_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Reporte exportado correctamente')
  }

  const filteredStaff = staffList.filter((a) => {
    const searchLower = search.toLowerCase()
    const matchesSearch = !search ||
      a.name.toLowerCase().includes(searchLower) ||
      (a.phone && a.phone.includes(search)) ||
      (a.church && a.church.toLowerCase().includes(searchLower))

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    const matchesChurch = !churchFilter || a.church === churches.find(c => c.id === parseInt(churchFilter))?.name

    return matchesSearch && matchesStatus && matchesChurch
  })

  const summary = staffList.reduce(
    (acc, a) => {
      const originalTotal = parseFloat(a.totalAmount as string)
      const discount = a.discount || 0
      const total = originalTotal * (1 - discount / 100)
      acc.expected += total
      acc.collected += parseFloat(a.amountPaid as string)
      return acc
    },
    { expected: 0, collected: 0 }
  )
  const pendingAmount = summary.expected - summary.collected
  const teamMap = new Map(teams.map((t) => [t.id, t]))
  const roomMap = new Map(rooms.map((r) => [r.id, r]))
  const checkedInCount = staffList.filter((a) => a.checkedIn).length
  const paidCount = staffList.filter((a) => a.status === 'paid').length
  const partialCount = staffList.filter((a) => a.status === 'partial').length
  const pendingCount = staffList.filter((a) => a.status === 'pending').length

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader title="Personas">
        <Button onClick={downloadTemplate} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
          <Download className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Plantilla</span>
        </Button>
        <label className="relative inline-block">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 pointer-events-none">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Importar</span>
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <Button onClick={exportCurrentData} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
          <Download className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Exportar</span>
        </Button>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Agregar</span>
        </Button>
      </PageHeader>

      {/* Tabs del grupo Personas */}
      <GroupTabs tabs={PERSONAS_TABS} />

      {/* Stats Bar */}
      {!loading && staffList.length > 0 && (
        <StatsBar
          items={[
            { label: 'Total Staff', value: staffList.length, icon: <Users2 className="w-3 sm:w-4 h-3 sm:h-4" />, color: 'primary' },
            { label: 'Pagados', value: paidCount, icon: <CreditCard className="w-3 sm:w-4 h-3 sm:h-4" />, color: 'success' },
            { label: 'Check-in', value: checkedInCount, icon: <LogIn className="w-3 sm:w-4 h-3 sm:h-4" />, color: 'primary' },
          ]}
        />
      )}

      {/* Summary Cards */}
      {!loading && staffList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1.5">
          <StatCard
            label="Esperado"
            value={formatMXN(summary.expected)}
            color="blue"
            icon={DollarSign}
          />
          <StatCard
            label="Recaudado"
            value={formatMXN(summary.collected)}
            color="green"
            icon={CreditCard}
          />
          <StatCard
            label="Pendiente"
            value={formatMXN(pendingAmount)}
            color="red"
            icon={History}
          />
          <StatCard
            label="Check-in"
            value={`${checkedInCount}/${staffList.length}`}
            color="primary"
            icon={UserCheck}
            subtitle={`${paidCount} pagados • ${partialCount} parciales`}
          />
        </div>
      )}

      {/* Smart filter system */}
      {!loading && staffList.length > 0 && (
        <SmartFilter
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          churchFilter={churchFilter}
          onChurchChange={setChurchFilter}
          churches={churches}
          teamFilter={teamFilter}
          onTeamChange={setTeamFilter}
          teams={teams}
          roomFilter={roomFilter}
          onRoomChange={setRoomFilter}
          rooms={rooms}
          onClearFilters={() => {
            setSearch('')
            setStatusFilter('all')
            setChurchFilter('')
            setTeamFilter('')
            setRoomFilter('')
          }}
        />
      )}


      {/* Staff List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-2 w-full bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : staffList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Users className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Sin staff registrados</h3>
              <p className="text-sm text-muted-foreground">Comienza agregando staff usando el botón "Agregar" o importando un archivo Excel</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Agregar primer staff
            </Button>
          </div>
        </Card>
      ) : filteredStaff.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Search className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No se encontraron staff con esos filtros</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredStaff
            .map((member) => {
              const originalTotal = parseFloat(member.totalAmount as string)
              const discount = member.discount || 0
              const total = originalTotal * (1 - discount / 100)
              const paid = parseFloat(member.amountPaid as string)
              const percentage = (paid / total) * 100

              return (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-1.5 sm:p-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                            <h3 className="font-semibold text-xs truncate">{member.name}</h3>
                            <Badge
                              variant={member.status === 'paid' ? 'default' : member.status === 'partial' ? 'secondary' : 'outline'}
                              className="shrink-0 text-xs py-0"
                            >
                              {member.status === 'paid' ? 'Pagado' : member.status === 'partial' ? 'Parcial' : 'Pendiente'}
                            </Badge>
                            {member.checkedIn && (
                              <Badge className="shrink-0 text-xs py-0 bg-green-600 hover:bg-green-600 text-white gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Check-in
                              </Badge>
                            )}
                            {member.category && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                                {member.category}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0">
                            {(member.age != null || member.shirtSize || member.sex) && (
                              <p>
                                {[
                                  member.age != null ? `${member.age} años` : null,
                                  member.sex,
                                  member.shirtSize ? `Talla ${member.shirtSize}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            )}
                            {member.church && <p>Iglesia: {member.church}</p>}
                            {member.phone && <p>Tel: {member.phone}</p>}
                          </div>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <Button
                            onClick={() => handleToggleCheckIn(member)}
                            size="sm"
                            variant="ghost"
                            className={cn(
                              'h-6 w-6 p-0',
                              member.checkedIn ? 'text-green-600 hover:bg-green-100' : 'hover:bg-muted'
                            )}
                            title={member.checkedIn ? 'Cancelar check-in' : 'Registrar check-in'}
                          >
                            {member.checkedIn ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedStaffId(member.id)
                              setPaymentDialogOpen(true)
                            }}
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            title="Registrar pago"
                          >
                            <DollarSign className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => openHistory(member.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-accent/15"
                            title="Ver historial de pagos"
                          >
                            <History className="w-3 h-3 text-accent" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingId(member.id)
                              setForm({
                                name: member.name,
                                age: member.age != null ? String(member.age) : '',
                                shirtSize: member.shirtSize || '',
                                sex: member.sex || '',
                                phone: member.phone || '',
                                church: member.church || '',
                                category: member.category || '',
                                totalAmount: total.toString(),
                                discount: member.discount || 0,
                                notes: member.notes || '',
                              })
                              setDialogOpen(true)
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            title="Editar staff"
                          >
                            <Edit2 className="w-3 h-3 text-blue-600" />
                          </Button>
                          <Button
                            onClick={() => {
                              setDeletingId(member.id)
                              setDeleteDialogOpen(true)
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-red-100"
                            title="Eliminar staff"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      {discount > 0 && (
                        <div className="bg-card border-2 border-primary rounded p-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Costo original:</span>
                            <span className="line-through text-muted-foreground">{formatMXN(originalTotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Descuento:</span>
                            <span className="font-semibold text-primary">{discount}%</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-foreground">Costo final:</span>
                            <span className="text-primary">{formatMXN(total)}</span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Progreso de pago</span>
                          <span className="font-semibold">
                            {formatMXN(paid)} / {formatMXN(total)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (open) {
            if (!editingId) {
              setForm({ ...emptyForm })
            }
          } else {
            setForm({ ...emptyForm })
            setEditingId(null)
            clearNewParam()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
              <DialogTitle className="text-xl">{editingId ? 'Editar Staff' : 'Agregar Staff'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Información Personal */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Información Personal</h3>
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Nombre completo"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="age" className="text-sm font-medium">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="21"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="shirtSize" className="text-sm font-medium">Talla</Label>
                  <select
                    id="shirtSize"
                    value={form.shirtSize}
                    onChange={(e) => setForm({ ...form, shirtSize: e.target.value })}
                    className="mt-1 w-full text-sm border border-border rounded-md bg-background px-2 py-2 h-10"
                  >
                    <option value="">—</option>
                    {SHIRT_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="sex" className="text-sm font-medium">Sexo</Label>
                  <select
                    id="sex"
                    value={form.sex}
                    onChange={(e) => setForm({ ...form, sex: e.target.value })}
                    className="mt-1 w-full text-sm border border-border rounded-md bg-background px-2 py-2 h-10"
                  >
                    <option value="">—</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contacto e Iglesia */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Contacto e Iglesia</h3>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Teléfono Personal *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Ej: 3326094596"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="church" className="text-sm font-medium">Iglesia *</Label>
                <select
                  id="church"
                  value={form.church}
                  onChange={(e) => setForm({ ...form, church: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-md bg-background px-2 py-2 h-10"
                >
                  <option value="">Selecciona una iglesia</option>
                  {churches.map((church) => (
                    <option key={church.id} value={church.name}>
                      {church.name}
                    </option>
                  ))}
                </select>
                {churches.length === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Agrega iglesias en la sección de Iglesias
                  </p>
                )}
              </div>
            </div>

            {/* Ministerio */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Ministerio</h3>
              <div>
                <Label htmlFor="category" className="text-sm font-medium">Ministerio *</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full text-sm border border-border rounded-md bg-background px-2 py-2 h-10"
                >
                  <option value="">Selecciona un ministerio</option>
                  {MINISTRIES.map((ministry) => (
                    <option key={ministry} value={ministry}>
                      {ministry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Monto y Notas */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Costo</h3>
              <div>
                <Label htmlFor="totalAmount" className="text-sm font-medium">Monto Total ($) *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Descuento</Label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 10, 20, 30].map((discountPercent) => (
                    <label key={discountPercent} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 transition-all ${form.discount === discountPercent ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                      <input
                        type="radio"
                        name="discount"
                        value={discountPercent}
                        checked={form.discount === discountPercent}
                        onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value, 10) })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">
                        {discountPercent === 0 ? 'Sin descuento' : `${discountPercent}%`}
                      </span>
                    </label>
                  ))}
                </div>
                {form.discount > 0 && (
                  <div className="text-xs text-foreground bg-card border border-primary p-2 rounded">
                    Monto con descuento: <span className="font-semibold text-primary">{formatMXN((parseFloat(form.totalAmount) || 0) * (1 - form.discount / 100))}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">Notas</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notas adicionales"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); clearNewParam() }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                {editingId ? 'Guardar Cambios' : 'Agregar staff'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            {selectedStaffId && (
              <DialogDescription className="pt-2">
                {staffList.find((a) => a.id === selectedStaffId)?.name}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedStaffId && staffList.find((a) => a.id === selectedStaffId) && (
            <div className="bg-muted p-3 rounded-lg space-y-1 text-sm mb-4">
              {(() => {
                const att = staffList.find((a) => a.id === selectedStaffId)!
                const originalTotal = parseFloat(att.totalAmount as string)
                const discount = att.discount || 0
                const total = originalTotal * (1 - discount / 100)
                const paid = parseFloat(att.amountPaid as string)
                const remaining = total - paid
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monto Total:</span>
                      <span className="font-semibold">{formatMXN(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ya Pagado:</span>
                      <span className="font-semibold">{formatMXN(paid)}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span className="font-medium">Falta Pagar:</span>
                      <span className="font-bold">{formatMXN(remaining)}</span>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Monto del Pago ($) *</Label>
              <div className="flex gap-2">
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0"
                  className="flex-1"
                />
                {(() => {
                  const member = selectedStaffId ? staffList.find((a) => a.id === selectedStaffId) : null
                  if (!member) return null
                  const originalTotal = parseFloat(member.totalAmount as string) || 0
                  const discount = member.discount || 0
                  const total = originalTotal * (1 - discount / 100)
                  const paid = parseFloat(member.amountPaid as string) || 0
                  const remaining = total - paid
                  if (remaining > 0) {
                    return (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPaymentForm({ ...paymentForm, amount: remaining.toFixed(2) })}
                        className="whitespace-nowrap"
                        title={`Pagar lo faltante: ${formatMXN(remaining)}`}
                      >
                        Falta
                      </Button>
                    )
                  }
                  return null
                })()}
              </div>
              {(() => {
                const member = selectedStaffId ? staffList.find((a) => a.id === selectedStaffId) : null
                if (!member) return null
                const originalTotal = parseFloat(member.totalAmount as string) || 0
                const discount = member.discount || 0
                const total = originalTotal * (1 - discount / 100)
                const paid = parseFloat(member.amountPaid as string) || 0
                const remaining = total - paid
                if (remaining > 0) {
                  return (
                    <p className="text-xs text-muted-foreground">
                      Falta por pagar: <span className="font-semibold">{formatMXN(remaining)}</span>
                    </p>
                  )
                }
                return null
              })()}
            </div>
            <div>
              <Label htmlFor="payment-date">Fecha del Pago *</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Método de Pago *</Label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { value: 'cash', label: 'Efectivo' },
                  { value: 'transfer', label: 'Transferencia' },
                  { value: 'deposit', label: 'Depósito' },
                ].map((option) => (
                  <label key={option.value} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 transition-all ${paymentForm.paymentMethod === option.value ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={paymentForm.paymentMethod === option.value}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="payment-notes">Notas (opcional)</Label>
              <Input
                id="payment-notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Notas del pago"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)} className="hover:bg-slate-100">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-400">
                Registrar Pago
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas eliminar este staff y todos sus registros de pago? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDelete(deletingId)
                  setDeleteDialogOpen(false)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de pagos</DialogTitle>
            {historyStaffId && (
              <DialogDescription>
                {staffList.find((a) => a.id === historyStaffId)?.name}
              </DialogDescription>
            )}
          </DialogHeader>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <History className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aún no hay abonos registrados</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(() => {
                const totalPaid = paymentHistory.reduce(
                  (sum, p) => sum + parseFloat(p.amount as string),
                  0
                )
                return (
                  <div className="flex justify-between items-center bg-accent/10 rounded-lg px-3 py-2 mb-1">
                    <span className="text-sm font-medium text-foreground">Total abonado</span>
                    <span className="text-sm font-bold text-accent">{formatMXN(totalPaid)}</span>
                  </div>
                )
              })()}
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">
                      {formatMXN(parseFloat(payment.amount as string))} • {!payment.paymentMethod || payment.paymentMethod === 'cash' ? 'Efectivo' : payment.paymentMethod === 'transfer' ? 'Transferencia' : 'Depósito'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.paymentDate + 'T00:00:00').toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground truncate">{payment.notes}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeletePayment(payment.id)}
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    className="h-8 w-8 p-0 hover:bg-red-100 shrink-0"
                    title="Eliminar pago"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
