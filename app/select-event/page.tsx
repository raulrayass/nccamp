import { SelectEventPageWrapper } from '@/components/select-event-page-wrapper'

export const metadata = {
  title: 'Seleccionar Evento',
  description: 'Selecciona o crea un evento para comenzar',
}

export default function SelectEventPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <SelectEventPageWrapper />
    </div>
  )
}
