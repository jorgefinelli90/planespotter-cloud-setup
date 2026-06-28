import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left - Branding */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            PS
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-semibold text-sm">PlaneSpotter</span>
            <span className="text-xs text-muted-foreground">Cloud</span>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
