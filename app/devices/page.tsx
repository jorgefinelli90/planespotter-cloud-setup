import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'Devices - PlaneSpotter Cloud',
  description: 'Manage your ESP32 PlaneSpotter devices',
}

export default function DevicesPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground mt-2">
            Manage and configure your ESP32 PlaneSpotter devices.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">
            Device management interface will be implemented in future sprints.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
