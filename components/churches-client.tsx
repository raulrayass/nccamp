'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { GroupTabs, LOGISTICA_TABS } from '@/components/group-tabs'
import { getChurches, createChurch, updateChurch, deleteChurch } from '@/app/actions/churches'
import { Church } from '@/lib/db/schema'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Trash2, Edit2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { StatsBar } from '@/components/stats-bar'
import { PageHeader } from '@/components/page-header'

interface Props {
  userId: string
}

export function ChurchesClient({ userId }: Props) {
  const [churches, setChurches] = useState<Church[]>([])
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [churchName, setChurchName] = useState('')

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadChurches()
  }, [userId])

  // Abre el modal de agregar cuando el FAB del dock navega con ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingId(null)
      setChurchName('')
      setDialogOpen(true)
    }
  }, [searchParams])

  function clearNewParam() {
    if (searchParams.get('new') === '1') {
      router.replace(pathname, { scroll: false })
    }
  }

  async function loadChurches() {
    const data = await getChurches(userId)
    setChurches(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!churchName.trim()) {
      toast.error('El nombre de la iglesia es obligatorio')
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateChurch(userId, editingId, churchName)
          toast.success('Iglesia actualizada')
        } else {
          await createChurch(userId, churchName)
          toast.success('Iglesia agregada')
        }
        setDialogOpen(false)
        setChurchName('')
        setEditingId(null)
        clearNewParam()
        await loadChurches()
      } catch (error: any) {
        toast.error(error.message || 'Error al guardar la iglesia')
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteChurch(userId, id)
        toast.success('Iglesia eliminada')
        setDeleteDialogOpen(false)
        await loadChurches()
      } catch (error: any) {
        toast.error(error.message || 'Error al eliminar la iglesia')
      }
    })
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader title="Logística">
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>Agregar Iglesia</span>
        </Button>
      </PageHeader>

      {/* Tabs del grupo Logística */}
      <GroupTabs tabs={LOGISTICA_TABS} />

      {/* Stats Bar */}
      {churches.length > 0 && (
        <StatsBar
          items={[
            { label: 'Iglesias Totales', value: churches.length, icon: <MapPin className="w-5 h-5" />, color: 'primary' },
          ]}
        />
      )}

      {/* Churches Grid */}
      {churches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay iglesias registradas. Agrega la primera iglesia.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {churches.map((church) => (
            <Card key={church.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{church.name}</h3>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    <Button
                      onClick={() => {
                        setEditingId(church.id)
                        setChurchName(church.name)
                        setDialogOpen(true)
                      }}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      title="Editar iglesia"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setDeletingId(church.id)
                        setDeleteDialogOpen(true)
                      }}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Eliminar iglesia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Creada: {new Date(church.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setChurchName('')
            setEditingId(null)
            clearNewParam()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Iglesia' : 'Agregar Iglesia'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="church-name">Nombre de la Iglesia *</Label>
              <Input
                id="church-name"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                placeholder="Ej: nc..."
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); clearNewParam() }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {editingId ? 'Guardar Cambios' : 'Agregar Iglesia'}
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
              ¿Estás seguro que deseas eliminar esta iglesia? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDelete(deletingId)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
