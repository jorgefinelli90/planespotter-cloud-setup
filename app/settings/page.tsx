import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'Settings - PlaneSpotter Cloud',
  description: 'Application and account settings',
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage application and account settings.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">
            Settings interface will be implemented in future sprints.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
