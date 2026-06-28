import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'Logs - PlaneSpotter Cloud',
  description: 'View system and device logs',
}

export default function LogsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground mt-2">
            System and device logs for troubleshooting and monitoring.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">
            Log viewer will be implemented in future sprints.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
