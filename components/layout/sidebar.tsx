'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Wifi, Code, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Devices',
    href: '/devices',
    icon: Wifi,
  },
  {
    label: 'API',
    href: '/api',
    icon: Code,
  },
  {
    label: 'Logs',
    href: '/logs',
    icon: FileText,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 border-r border-border bg-background transition-all duration-300',
        'flex flex-col',
        'hidden md:flex',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 transition-colors',
                  isCollapsed ? 'px-2' : 'px-3',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate text-sm">{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-border p-3">
        <Link href="/settings">
          <Button
            variant={pathname === '/settings' ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 transition-colors',
              isCollapsed ? 'px-2' : 'px-3'
            )}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="truncate text-sm">Settings</span>}
          </Button>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}
