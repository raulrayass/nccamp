'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEventSession } from '@/lib/contexts/event-session-context'
import { GroupTabs, PERSONAS_TABS } from '@/components/group-tabs'
import {
  getAllAttendees,
  getAttendees,
  createAttendee,
  updateAttendee,
  deleteAttendee,
  addAttendeePayment,
  deleteAttendeePayment,
  getAttendeePayments,
  bulkCreateAttendees,
  toggleCheckIn,
} from '@/app/actions/attendees'
import { getChurches } from '@/app/actions/churches'
import { getTeams } from '@/app/actions/teams'
import { getRooms } from '@/app/actions/rooms'
import { Attendee, AttendeePayment, Church, Team, Room } from '@/lib/db/schema'
import { formatMXN } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Trash2, DollarSign, Upload, Download, Edit2, Users, History, Search, CheckCircle2, Circle, CreditCard, UserCheck, Users2, LogIn, Filter, ChevronDown as ChevronDownIcon, X, Maximize2, Minimize2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SmartFilter } from '@/components/smart-filter'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'
import { PageHeader } from '@/components/page-header'
import { StatsBar } from '@/components/stats-bar'
import { ListSkeleton } from '@/components/list-skeleton'

interface Props {
  userId: string
  eventId: number | null
}

const emptyForm = {
  name: '',
  age: '',
  shirtSize: '',
  sex: '',
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
  discount: 0,
  notes: '',
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function AttendeesClient({ userId, eventId }: Props) {
  const [attendeeList, setAttendeeList] = useState<Attendee[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [fullscreenStats, setFullscreenStats] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<number | null>(null)
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
  const [historyAttendeeId, setHistoryAttendeeId] = useState<number | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<AttendeePayment[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [checkInFilter, setCheckInFilter] = useState('all')
  const [churchFilter, setChurchFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Abre el modal de agregar cuando el FAB del dock navega con ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingId(null)
      setForm({ ...emptyForm })
      setDialogOpen(true)
    }
  }, [searchParams])

  // Limpia el query param al cerrar el modal para que no reabra al volver
  function clearNewParam() {
    if (searchParams.get('new') === '1') {
      router.replace(pathname, { scroll: false })
    }
  }

  useEffect(() => {
    initializeDefaults()
  }, [userId])

  async function initializeDefaults() {
    setLoading(true)
    try {
      await loadAttendees()
      await loadChurches()
      await loadTeams()
      await loadRooms()
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  async function loadAttendees() {
    // Load all attendees for calculations and metrics (not paginated)
    const allData = await getAllAttendees(userId, eventId)
    setAttendeeList(allData)
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
    if (!form.church.trim()) {
      toast.error('Selecciona una iglesia')
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
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      emergencyContactName2: form.emergencyContactName2,
      emergencyContactPhone2: form.emergencyContactPhone2,
      allergies: form.allergies,
      roomId: form.roomId ? parseInt(form.roomId, 10) : null,
      teamId: form.teamId ? parseInt(form.teamId, 10) : null,
      totalAmount: amount,
      discount: form.discount,
      notes: form.notes,
      eventId: eventId,
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateAttendee(userId, editingId, payload)
          toast.success('Campero actualizado correctamente')
        } else {
          await createAttendee(userId, payload)
          toast.success('Campero agregado correctamente')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        clearNewParam()
        await loadAttendees()
      } catch (error) {
        toast.error('Error al guardar el campero')
        console.error(error)
      }
    })
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAttendeeId) return

    const amount = parseFloat(paymentForm.amount)
    const attendee = attendeeList.find((a) => a.id === selectedAttendeeId)
    if (!attendee) return

    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    const originalTotal = parseFloat(attendee.totalAmount as string)
    const discount = attendee.discount || 0
    const totalAmount = originalTotal * (1 - discount / 100)
    const alreadyPaid = parseFloat(attendee.amountPaid as string)
    const remaining = totalAmount - alreadyPaid

    if (amount > remaining) {
      toast.error(`El monto excede lo pendiente. Faltan $${remaining.toFixed(2)}`)
      return
    }

    startTransition(async () => {
      try {
        await addAttendeePayment(userId, selectedAttendeeId, amount, paymentForm.date, paymentForm.paymentMethod, paymentForm.notes, eventId)
        toast.success(`Pago de $${amount.toFixed(2)} registrado para ${attendee.name}`)
        setPaymentDialogOpen(false)
        setPaymentForm({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          notes: '',
        })
        setSelectedAttendeeId(null)
        await loadAttendees()
      } catch (error) {
        toast.error('Error al registrar el pago')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteAttendee(userId, id)
        toast.success('Campero eliminado')
        await loadAttendees()
      } catch (error) {
        toast.error('Error al eliminar el campero')
        console.error(error)
      }
    })
  }

  async function handleToggleCheckIn(attendee: Attendee) {
    const next = !attendee.checkedIn
    startTransition(async () => {
      try {
        await toggleCheckIn(userId, attendee.id, next)
        toast.success(next ? `${attendee.name} registró Check-in` : `Check-in cancelado para ${attendee.name}`)
        await loadAttendees()
      } catch (error) {
        toast.error('Error al actualizar el check-in')
        console.error(error)
      }
    })
  }

  async function openHistory(attendeeId: number) {
    setHistoryAttendeeId(attendeeId)
    setHistoryDialogOpen(true)
    setLoadingHistory(true)
    try {
      const data = await getAttendeePayments(userId, attendeeId)
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
        await deleteAttendeePayment(userId, paymentId)
        toast.success('Pago eliminado')
        if (historyAttendeeId) {
          const data = await getAttendeePayments(userId, historyAttendeeId)
          setPaymentHistory(data)
        }
        await loadAttendees()
      } catch (error) {
        toast.error('Error al eliminar el pago')
        console.error(error)
      }
    })
  }

  function downloadTemplate() {
    const headers = [
      'Nombre',
      'Edad',
      'Sexo',
      'Talla Camisa',
      'Teléfono',
      'Iglesia',
      'Contacto Emergencia 1',
      'Teléfono Emergencia 1',
      'Contacto Emergencia 2',
      'Teléfono Emergencia 2',
      'Alergias',
      'Equipo',
      'Habitación',
      'Monto Total ($)',
      'Pago Inicial ($)',
      'Notas',
    ]

    // Descargar template vacío con una fila de ejemplo
    const rows = [
      headers,
      [
        'Nombre completo',
        '18',
        'M',
        'M',
        '3326094596',
        'Nombre iglesia',
        'Contacto emergencia',
        '3326094596',
        '',
        '',
        '',
        'Nombre equipo',
        'Nombre habitación',
        '1000',
        '0',
        '',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Camperos')
    XLSX.writeFile(wb, 'Plantilla_Camperos.xlsx')
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

        const attendeesToImport = rows.slice(1).map((row) => ({
          name: String(row[0] || '').trim(),
          age: row[1] ? parseInt(String(row[1])) : undefined,
          sex: String(row[2] || '').trim() || undefined,
          shirtSize: String(row[3] || '').trim() || undefined,
          phone: String(row[4] || '').trim() || undefined,
          church: String(row[5] || '').trim() || undefined,
          emergencyContactName: String(row[6] || '').trim() || undefined,
          emergencyContactPhone: String(row[7] || '').trim() || undefined,
          emergencyContactName2: String(row[8] || '').trim() || undefined,
          emergencyContactPhone2: String(row[9] || '').trim() || undefined,
          allergies: String(row[10] || '').trim() || undefined,
          totalAmount: parseFloat(String(row[13] || '0')),
          initialPayment: parseFloat(String(row[14] || '0')) || 0,
          notes: String(row[15] || '').trim() || undefined,
          eventId: eventId,
        }))

        // Validar solo campos requeridos: nombre y monto total
        if (
          attendeesToImport.every(
            (a) =>
              a.name && // Nombre es requerido
              a.totalAmount > 0 // Monto total es requerido y debe ser > 0
          )
        ) {
          await bulkCreateAttendees(userId, attendeesToImport, eventId)
          toast.success(`${attendeesToImport.length} camperos importados correctamente`)
          await loadAttendees()
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
    if (attendeeList.length === 0) {
      toast.error('No hay camperos para exportar')
      return
    }
    const data = attendeeList.map((a) => {
      const originalTotal = parseFloat(a.totalAmount as string)
      const discount = a.discount || 0
      const total = originalTotal * (1 - discount / 100)
      const paid = parseFloat(a.amountPaid as string)
      const remaining = total - paid
      return {
        Nombre: a.name,
        Edad: a.age || '',
        Sexo: a.sex || '',
        'Talla Camisa': a.shirtSize || '',
        Teléfono: a.phone || '',
        Iglesia: a.church || '',
        'Contacto Emergencia 1': a.emergencyContactName || '',
        'Teléfono Emergencia 1': a.emergencyContactPhone || '',
        'Contacto Emergencia 2': a.emergencyContactName2 || '',
        'Teléfono Emergencia 2': a.emergencyContactPhone2 || '',
        Alergias: a.allergies || '',
        Equipo: teamMap.get(a.teamId)?.name || '',
        Habitación: roomMap.get(a.roomId)?.name || '',
        'Monto Original ($)': originalTotal.toFixed(2),
        'Descuento (%)': discount,
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
    XLSX.utils.book_append_sheet(wb, ws, 'Camperos')
    XLSX.writeFile(wb, `Camperos_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Reporte exportado correctamente')
  }

  // Apply smart filters
  const filteredAttendees = attendeeList.filter((a) => {
    // Smart search - searches name, phone, church simultaneously
    const searchLower = search.toLowerCase()
    const matchesSearch = !search ||
      a.name.toLowerCase().includes(searchLower) ||
      (a.phone && a.phone.includes(search)) ||
      (a.church && a.church.toLowerCase().includes(searchLower))

    // Status quick filter
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter

    // Check-in filter
    const matchesCheckIn =
      checkInFilter === 'all' ||
      (checkInFilter === 'checked' && a.checkedIn) ||
      (checkInFilter === 'unchecked' && !a.checkedIn)

    // Church quick filter
    const matchesChurch = !churchFilter || a.church === churches.find(c => c.id === parseInt(churchFilter))?.name

    // Team filter
    const matchesTeam = !teamFilter || a.teamId === parseInt(teamFilter)

    // Room filter
    const matchesRoom = !roomFilter || a.roomId === parseInt(roomFilter)

    return matchesSearch && matchesStatus && matchesCheckIn && matchesChurch && matchesTeam && matchesRoom
  })

  const hasActiveFilters =
    !!search ||
    statusFilter !== 'all' ||
    checkInFilter !== 'all' ||
    !!churchFilter ||
    !!teamFilter ||
    !!roomFilter

  // Calculate totals based on ALL attendees (not filtered)
  const summary = attendeeList.reduce(
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
  const checkedInCount = attendeeList.filter((a) => a.checkedIn).length
  const paidCount = attendeeList.filter((a) => a.status === 'paid').length
  const partialCount = attendeeList.filter((a) => a.status === 'partial').length
  const pendingCount = attendeeList.filter((a) => a.status === 'pending').length

  function exportPDF() {
    if (attendeeList.length === 0) {
      toast.error('No hay camperos para exportar')
      return
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10

      // Título
      doc.setFontSize(16)
      doc.text('Reporte de Camperos - Permanece Camp', margin, margin + 5)
      
      // Fecha de generación
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generado: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, margin + 12)
      doc.setTextColor(0)

      // Preparar datos para la tabla
      const tableData = attendeeList.map((a) => {
        const originalTotal = parseFloat(a.totalAmount as string)
        const discount = a.discount || 0
        const total = originalTotal * (1 - discount / 100)
        const paid = parseFloat(a.amountPaid as string)
        const remaining = total - paid
        
        return [
          a.name,
          a.age ? a.age.toString() : '-',
          a.sex || '-',
          a.shirtSize || '-',
          a.phone || '-',
          a.church || '-',
          teamMap.get(a.teamId)?.name || '-',
          roomMap.get(a.roomId)?.name || '-',
          a.emergencyContactName || '-',
          a.emergencyContactPhone || '-',
          a.allergies || '-',
          a.checkedIn ? 'Sí' : 'No',
          a.status === 'paid' ? 'Pagado' : a.status === 'partial' ? 'Parcial' : 'Pendiente',
          `$${paid.toFixed(2)}`,
          `$${remaining.toFixed(2)}`,
          a.notes || '-',
        ]
      })

      // Configurar tabla
      autoTable(doc, {
        startY: margin + 18,
        margin: margin,
        head: [
          [
            'Nombre',
            'Edad',
            'Sexo',
            'Talla',
            'Teléfono',
            'Iglesia',
            'Equipo',
            'Habitación',
            'Contacto 1',
            'Tel. 1',
            'Alergias',
            'Check-in',
            'Estado',
            'Pagado',
            'Falta',
            'Notas',
          ],
        ],
        body: tableData,
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          padding: 3,
          halign: 'center',
          valign: 'middle',
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 8,
          padding: 2.5,
          valign: 'top',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { halign: 'left' }, // Nombre
          1: { halign: 'center' }, // Edad
          2: { halign: 'center' }, // Sexo
          3: { halign: 'center' }, // Talla
          4: { halign: 'center' }, // Teléfono
          5: { halign: 'left' }, // Iglesia
          6: { halign: 'left' }, // Equipo
          7: { halign: 'left' }, // Habitación
          8: { halign: 'left' }, // Contacto 1
          9: { halign: 'center' }, // Tel. 1
          10: { halign: 'left' }, // Alergias
          11: { halign: 'center' }, // Check-in
          12: { halign: 'center' }, // Estado
          13: { halign: 'right' }, // Pagado
          14: { halign: 'right' }, // Falta
          15: { halign: 'left' }, // Notas
        },
        theme: 'grid',
        didDrawPage: (data) => {
          // Footer
          const pageCount = (doc as any).internal.getPages().length
          const currentPage = data.pageNumber
          doc.setFontSize(8)
          doc.setTextColor(150)
          doc.text(
            `Página ${currentPage} de ${pageCount}`,
            pageWidth / 2,
            pageHeight - 5,
            { align: 'center' }
          )
        },
      })

      // Descargar PDF
      doc.save(`Camperos_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('PDF exportado correctamente')
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.error('Error al generar el PDF')
    }
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
          <span>Exportar Excel</span>
        </Button>
        <Button onClick={exportPDF} variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3">
          <Download className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Exportar PDF</span>
        </Button>
        <Button onClick={() => router.push('/attendees/new')} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Agregar</span>
        </Button>
      </PageHeader>

      {/* Tabs del grupo Personas */}
      <GroupTabs tabs={PERSONAS_TABS} />

      {/* Quick Stats - 3 column grid */}
      {!loading && attendeeList.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30">
            <CardContent className="p-3">
              <div className="text-center">
                <Users2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{attendeeList.length}</p>
                <p className="text-xs text-muted-foreground">Camperos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30">
            <CardContent className="p-3">
              <div className="text-center">
                <CreditCard className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{paidCount}</p>
                <p className="text-xs text-muted-foreground">Pagados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30">
            <CardContent className="p-3">
              <div className="text-center">
                <LogIn className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{checkedInCount}</p>
                <p className="text-xs text-muted-foreground">Check-in</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content cards - Finanzas and Check-in */}
      {!loading && attendeeList.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Finanzas Card */}
          <Card className="bg-white/5 border border-border">
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm">Finanzas</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Esperado</p>
                  <p className="text-sm sm:text-base font-bold text-foreground">{formatMXN(summary.expected)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Recaudado</p>
                  <p className="text-base sm:text-lg font-bold text-green-600">{formatMXN(summary.collected)}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={Math.min(100, (summary.collected / summary.expected) * 100)} className="h-2" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {Math.round((summary.collected / summary.expected) * 100)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Pendiente</p>
                  <p className="text-sm sm:text-base font-bold text-red-600">{formatMXN(pendingAmount)}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={summary.expected > 0 ? Math.min(100, (pendingAmount / summary.expected) * 100) : 0} className="h-2" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {summary.expected > 0 ? Math.round((pendingAmount / summary.expected) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check-in Card */}
          <Card className="bg-white/5 border border-border">
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm">Check-in</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm text-foreground">{checkedInCount} / {attendeeList.length}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((checkedInCount / attendeeList.length) * 100)}%
                    </span>
                  </div>
                  <Progress value={Math.min(100, (checkedInCount / attendeeList.length) * 100)} className="h-2" />
                </div>
                <div className="space-y-1 sm:space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                    <span className="text-muted-foreground">{paidCount} Pagados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">{partialCount} Parciales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600" />
                    <span className="text-muted-foreground">{attendeeList.length - paidCount - partialCount} Pendientes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search bar */}
      {!loading && attendeeList.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="page-search"
            type="text"
            placeholder="Buscar campista..."
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
      )}

      {/* Filter chips - Status and other filters */}
      {!loading && attendeeList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
              statusFilter === 'all'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white/5 text-foreground border-border hover:bg-white/10'
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
              statusFilter === 'paid'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white/5 text-foreground border-border hover:bg-white/10'
            )}
          >
            Pagados
          </button>
          <button
            onClick={() => setStatusFilter('partial')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
              statusFilter === 'partial'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white/5 text-foreground border-border hover:bg-white/10'
            )}
          >
            Parciales
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
              statusFilter === 'pending'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white/5 text-foreground border-border hover:bg-white/10'
            )}
          >
            Pendientes
          </button>
          {/* Check-in chips */}
          <span className="w-px h-6 bg-border self-center mx-1" />
          <button
            onClick={() => setCheckInFilter(checkInFilter === 'checked' ? 'all' : 'checked')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border inline-flex items-center gap-1.5',
              checkInFilter === 'checked'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/5 text-foreground border-border hover:bg-white/10'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Con check-in
          </button>
          <button
            onClick={() => setCheckInFilter(checkInFilter === 'unchecked' ? 'all' : 'unchecked')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border inline-flex items-center gap-1.5',
              checkInFilter === 'unchecked'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/5 text-foreground border-border hover:bg-white/10'
            )}
          >
            <Circle className="w-3.5 h-3.5" />
            Sin check-in
          </button>
          {/* Advanced filters toggle */}
          {(churches.length > 0 || teams.length > 0 || rooms.length > 0) && (
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
          )}
        </div>
      )}

      {/* Results count */}
      {!loading && attendeeList.length > 0 && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Mostrando <span className="font-semibold text-foreground">{filteredAttendees.length}</span> de{' '}
            <span className="font-semibold text-foreground">{attendeeList.length}</span> camperos
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setCheckInFilter('all')
                setChurchFilter('')
                setTeamFilter('')
                setRoomFilter('')
              }}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Advanced Filters Section */}
      {showAdvancedFilters && !loading && attendeeList.length > 0 && (
        <Card className="bg-white/5 border border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {churches.length > 0 && (
                <div>
                  <Label className="text-xs mb-2 block">Iglesia</Label>
                  <select
                    value={churchFilter}
                    onChange={(e) => setChurchFilter(e.target.value)}
                    className="w-full text-sm border border-border rounded-md bg-background px-2 py-2"
                  >
                    <option value="">Todas</option>
                    {churches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {teams.length > 0 && (
                <div>
                  <Label className="text-xs mb-2 block">Equipo</Label>
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="w-full text-sm border border-border rounded-md bg-background px-2 py-2"
                  >
                    <option value="">Todos</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {rooms.length > 0 && (
                <div>
                  <Label className="text-xs mb-2 block">Habitación</Label>
                  <select
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value)}
                    className="w-full text-sm border border-border rounded-md bg-background px-2 py-2"
                  >
                    <option value="">Todas</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <Button
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setCheckInFilter('all')
                setChurchFilter('')
                setTeamFilter('')
                setRoomFilter('')
              }}
              variant="outline"
              size="sm"
              className="w-full mt-3"
            >
              Limpiar todos los filtros
            </Button>
          </CardContent>
        </Card>
      )}


      {/* Attendees List */}
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
      ) : attendeeList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Users className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Sin camperos registrados</h3>
              <p className="text-sm text-muted-foreground">Comienza agregando camperos usando el botón "Agregar" o importando un archivo Excel</p>
            </div>
            <Button onClick={() => router.push('/attendees/new')} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Agregar primer campero
            </Button>
          </div>
        </Card>
      ) : filteredAttendees.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Search className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No se encontraron camperos con esos filtros</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAttendees
            .map((attendee) => {
              const originalTotal = parseFloat(attendee.totalAmount as string)
              const discount = attendee.discount || 0
              const total = originalTotal * (1 - discount / 100)
              const paid = parseFloat(attendee.amountPaid as string)
              const percentage = (paid / total) * 100

              return (
                <Card key={attendee.id} className="overflow-hidden">
                  <CardContent className="p-1.5 sm:p-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                            <h3 className="font-semibold text-xs truncate">{attendee.name}</h3>
                            <Badge
                              variant={attendee.status === 'paid' ? 'default' : attendee.status === 'partial' ? 'secondary' : 'outline'}
                              className="shrink-0 text-xs py-0"
                            >
                              {attendee.status === 'paid' ? 'Pagado' : attendee.status === 'partial' ? 'Parcial' : 'Pendiente'}
                            </Badge>
                            {attendee.checkedIn && (
                              <Badge className="shrink-0 text-xs py-0 bg-green-600 hover:bg-green-600 text-white gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Check-in
                              </Badge>
                            )}
                            {attendee.teamId && teamMap.get(attendee.teamId) && (
                              <span
                                className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full text-white shrink-0"
                                style={{ backgroundColor: teamMap.get(attendee.teamId)!.color }}
                              >
                                {teamMap.get(attendee.teamId)!.name}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0">
                            {(attendee.age != null || attendee.shirtSize || attendee.sex) && (
                              <p>
                                {[
                                  attendee.age != null ? `${attendee.age} años` : null,
                                  attendee.sex,
                                  attendee.shirtSize ? `Talla ${attendee.shirtSize}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            )}
                            {attendee.church && <p>Iglesia: {attendee.church}</p>}
                            {attendee.phone && <p>Tel: {attendee.phone}</p>}
                            {attendee.roomId && roomMap.get(attendee.roomId) && (
                              <p>Habitación: {roomMap.get(attendee.roomId)!.name}</p>
                            )}
                            {attendee.emergencyContactName && (
                              <p>Emergencia: {attendee.emergencyContactName} ({attendee.emergencyContactPhone})</p>
                            )}
                            {attendee.emergencyContactName2 && (
                              <p>Emergencia 2: {attendee.emergencyContactName2} ({attendee.emergencyContactPhone2})</p>
                            )}
                            {attendee.allergies && <p className="text-amber-700">Alergias: {attendee.allergies}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-1.5 shrink-0">
                          <Button
                            onClick={() => handleToggleCheckIn(attendee)}
                            size="sm"
                            variant="ghost"
                            className={cn(
                              'h-7 w-7 p-0.5',
                              attendee.checkedIn ? 'text-green-600 hover:bg-green-100' : 'hover:bg-muted'
                            )}
                            title={attendee.checkedIn ? 'Cancelar check-in' : 'Registrar check-in'}
                          >
                            {attendee.checkedIn ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedAttendeeId(attendee.id)
                              setPaymentDialogOpen(true)
                            }}
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0.5"
                            title="Registrar pago"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => openHistory(attendee.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0.5 hover:bg-accent/15"
                            title="Ver historial de pagos"
                          >
                            <History className="w-4 h-4 text-accent" />
                          </Button>
                          <Button
                            onClick={() => router.push(`/attendees/${attendee.id}`)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            title="Editar campero"
                          >
                            <Edit2 className="w-3 h-3 text-blue-600" />
                          </Button>
                          <Button
                            onClick={() => {
                              setDeletingId(attendee.id)
                              setDeleteDialogOpen(true)
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-red-100"
                            title="Eliminar campero"
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
            <DialogTitle className="text-xl">{editingId ? 'Editar campero' : 'Agregar campero'}</DialogTitle>
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

            {/* Contactos de Emergencia */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Contactos de Emergencia</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="emergencyContactName" className="text-sm font-medium">Nombre 1 *</Label>
                  <Input
                    id="emergencyContactName"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                    placeholder="Ej: Nombre"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone" className="text-sm font-medium">Teléfono 1 *</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    placeholder="Ej: 3326094596"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="emergencyContactName2" className="text-sm font-medium">Nombre 2</Label>
                  <Input
                    id="emergencyContactName2"
                    value={form.emergencyContactName2}
                    onChange={(e) => setForm({ ...form, emergencyContactName2: e.target.value })}
                    placeholder="Ej: Nombre"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone2" className="text-sm font-medium">Teléfono 2</Label>
                  <Input
                    id="emergencyContactPhone2"
                    value={form.emergencyContactPhone2}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone2: e.target.value })}
                    placeholder="Ej: 3326094596"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="allergies" className="text-sm font-medium">Alergias</Label>
                <Input
                  id="allergies"
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  placeholder="Ej: Ninguna"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Asignación */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Asignación</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="teamId" className="text-sm font-medium">Equipo</Label>
                  <select
                    id="teamId"
                    value={form.teamId}
                    onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                    className="mt-1 w-full text-sm border border-border rounded-md bg-background px-2 py-2 h-10"
                  >
                    <option value="">Sin equipo</option>
                    {teams.map((team) => (
                      <option key={team.id} value={String(team.id)}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="roomId" className="text-sm font-medium">Habitación</Label>
                  <select
                    id="roomId"
                    value={form.roomId}
                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                    className="mt-1 w-full text-sm border border-border rounded-md bg-background px-2 py-2 h-10"
                  >
                    <option value="">Sin habitación</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={String(room.id)}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                {editingId ? 'Guardar Cambios' : 'Agregar Campero'}
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
            {selectedAttendeeId && (
              <DialogDescription className="pt-2">
                {attendeeList.find((a) => a.id === selectedAttendeeId)?.name}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedAttendeeId && attendeeList.find((a) => a.id === selectedAttendeeId) && (
            <div className="bg-muted p-3 rounded-lg space-y-1 text-sm mb-4">
              {(() => {
                const att = attendeeList.find((a) => a.id === selectedAttendeeId)!
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
                  const attendee = selectedAttendeeId ? attendeeList.find((a) => a.id === selectedAttendeeId) : null
                  if (!attendee) return null
                  const originalTotal = parseFloat(attendee.totalAmount as string) || 0
                  const discount = attendee.discount || 0
                  const total = originalTotal * (1 - discount / 100)
                  const paid = parseFloat(attendee.amountPaid as string) || 0
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
                const attendee = selectedAttendeeId ? attendeeList.find((a) => a.id === selectedAttendeeId) : null
                if (!attendee) return null
                const originalTotal = parseFloat(attendee.totalAmount as string) || 0
                const discount = attendee.discount || 0
                const total = originalTotal * (1 - discount / 100)
                const paid = parseFloat(attendee.amountPaid as string) || 0
                const remaining = total - paid
                if (remaining > 0) {
                  const suggested = parseFloat(paymentForm.amount) || 0
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
              ¿Estás seguro que deseas eliminar este campero y todos sus registros de pago? Esta acción no se puede deshacer.
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
            {historyAttendeeId && (
              <DialogDescription>
                {attendeeList.find((a) => a.id === historyAttendeeId)?.name}
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
