import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'API - PlaneSpotter Cloud',
  description: 'API documentation and integration guides',
}

export default function APIPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API</h1>
          <p className="text-muted-foreground mt-2">
            API documentation and integration guides for PlaneSpotter devices.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">
            API documentation will be implemented in future sprints.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
