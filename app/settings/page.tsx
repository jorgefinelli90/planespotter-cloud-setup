import { AppLayout } from '@/components/layout/app-layout'
import { RadarLocationSettings } from '@/components/settings/radar-location-settings'

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

        <RadarLocationSettings />
      </div>
    </AppLayout>
  )
}
