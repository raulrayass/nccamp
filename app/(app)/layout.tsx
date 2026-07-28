import { Topbar } from '@/components/topbar'
import { FloatingDock } from '@/components/floating-dock'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <Topbar />
      <main className="flex-1 flex flex-col pb-24 lg:pb-0">
        {children}
      </main>
      <FloatingDock />
    </div>
  )
}
