import { SelectEventPageWrapper } from '@/components/select-event-page-wrapper'

export const metadata = {
  title: 'Seleccionar Evento',
  description: 'Selecciona o crea un evento para comenzar',
}

export default function SelectEventPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-start justify-center">
      <SelectEventPageWrapper />
    </div>
  )
}
