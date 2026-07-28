'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { GroupTabs, FINANZAS_TABS } from '@/components/group-tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/categories'
import { Plus, Pencil, Trash2, Tag, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'
import { Category } from '@/lib/db/schema'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
]

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  income: { label: 'Ingreso', icon: <TrendingUp className="w-3 h-3" /> },
  expense: { label: 'Egreso', icon: <TrendingDown className="w-3 h-3" /> },
  both: { label: 'Ambos', icon: <ArrowLeftRight className="w-3 h-3" /> },
}

const defaultForm = {
  name: '',
  type: 'expense',
  color: '#6366f1',
  icon: 'tag',
}

interface Props {
  userId: string
}

export function CategoriesClient({ userId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    getCategories(userId).then(setCategories)
  }, [userId])

  // Abre el modal de nueva categoría cuando el FAB del dock navega con ?new=1
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

  function openCreate() {
    setEditingId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(c: Category) {
    setEditingId(c.id)
    setForm({ name: c.name, type: c.type, color: c.color, icon: c.icon })
    setDialogOpen(true)
  }

  function openDelete(id: number) {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre de la categoría es obligatorio')
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateCategory(userId, editingId, form)
          toast.success('Categoría actualizada')
        } else {
          await createCategory(userId, form)
          toast.success('Categoría creada')
        }
        setDialogOpen(false)
        clearNewParam()
        const updated = await getCategories(userId)
        setCategories(updated)
      } catch (error) {
        toast.error('Error al guardar la categoría')
        console.error(error)
      }
    })
  }

  async function handleDelete() {
    if (!deletingId) return
    startTransition(async () => {
      try {
        await deleteCategory(userId, deletingId)
        toast.success('Categoría eliminada')
        setDeleteDialogOpen(false)
        const updated = await getCategories(userId)
        setCategories(updated)
      } catch (error) {
        toast.error('Error al eliminar la categoría')
        console.error(error)
      }
    })
  }

  const grouped = {
    income: categories.filter((c) => c.type === 'income'),
    expense: categories.filter((c) => c.type === 'expense'),
    both: categories.filter((c) => c.type === 'both'),
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader title="Finanzas">
        <Button onClick={openCreate} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Nueva categoría</span>
        </Button>
      </PageHeader>

      {/* Tabs del grupo Finanzas */}
      <GroupTabs tabs={FINANZAS_TABS} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.55_0.17_160)]/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-[oklch(0.55_0.17_160)]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="text-lg font-bold text-foreground">{grouped.income.length + grouped.both.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.55_0.20_25)]/10 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4 text-[oklch(0.55_0.20_25)]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Egresos</p>
            <p className="text-lg font-bold text-foreground">{grouped.expense.length + grouped.both.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{categories.length}</p>
          </div>
        </Card>
      </div>

      {categories.length === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">Sin categorías</p>
          <p className="text-muted-foreground text-sm mb-4">
            Crea categorías para organizar tus transacciones
          </p>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Crear primera categoría
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map((c) => {
            const typeInfo = TYPE_LABELS[c.type]
            return (
              <Card key={c.id} className="p-2 sm:p-3 flex flex-col gap-1.5 sm:gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${c.color}20` }}
                  >
                    <Tag className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{c.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge
                        variant="secondary"
                        className="text-xs gap-0.5 px-1 py-0"
                        style={{
                          backgroundColor: `${c.color}15`,
                          color: c.color,
                          borderColor: `${c.color}30`,
                        }}
                      >
                        {typeInfo.icon}
                        <span className="text-xs">{typeInfo.label}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-0.5">
                  <Button variant="ghost" size="icon" className="w-6 sm:w-7 h-6 sm:h-7" onClick={() => openEdit(c)}>
                    <Pencil className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 sm:w-7 h-6 sm:h-7 text-destructive hover:text-destructive"
                    onClick={() => openDelete(c.id)}
                  >
                    <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  </Button>
                </div>
              </Card>
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
        <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">{editingId ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-3 mt-1">
            <div className="flex flex-col gap-1">
              <Label className="text-xs sm:text-sm">Nombre</Label>
              <Input
                placeholder="Ej: Alimentos"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="cat-type" className="text-xs sm:text-sm">Tipo</Label>
              <select
                id="cat-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full text-xs border border-border rounded-md bg-background px-2 h-8"
              >
                <option value="income">Ingreso</option>
                <option value="expense">Egreso</option>
                <option value="both">Ambos</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs sm:text-sm">Color</Label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    style={{
                      backgroundColor: color,
                      outline: form.color === color ? `2px solid ${color}` : undefined,
                      outlineOffset: form.color === color ? '1px' : undefined,
                    }}
                    onClick={() => setForm({ ...form, color })}
                    aria-label={`Color ${color}`}
                  />
                ))}
                <div className="flex items-center gap-0.5 ml-0.5">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-input"
                    title="Color personalizado"
                  />
                </div>
              </div>
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs sm:text-sm"
                style={{ borderColor: form.color, backgroundColor: `${form.color}10`, color: form.color }}
              >
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Vista previa: {form.name || 'Categoría'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-1.5 sm:gap-2 mt-1 sm:mt-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); clearNewParam() }} className="h-8 text-xs sm:text-sm">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="h-8 text-xs sm:text-sm">
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
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las transacciones asociadas perderán su categoría.
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
