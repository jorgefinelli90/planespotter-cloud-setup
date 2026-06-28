import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'Dashboard - PlaneSpotter Cloud',
  description: 'Main dashboard for device overview and management',
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Central hub for monitoring and managing your PlaneSpotter devices.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">
            Dashboard content will be implemented in future sprints.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
