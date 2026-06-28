# PlaneSpotter Cloud - Component Library

## Overview

This document describes the reusable components available in the PlaneSpotter Cloud project. All components are styled with Tailwind CSS and follow shadcn/ui patterns.

## Layout Components

### AppLayout
The main application layout wrapper that combines header and sidebar.

**Location:** `components/layout/app-layout.tsx`

**Usage:**
```tsx
import { AppLayout } from '@/components/layout/app-layout'

export default function MyPage() {
  return (
    <AppLayout>
      <h1>Page Content</h1>
    </AppLayout>
  )
}
```

**Props:**
- `children: React.ReactNode` - The page content to render

### Header
Fixed top navigation bar with branding and theme toggle.

**Location:** `components/layout/header.tsx`

**Features:**
- PlaneSpotter logo and branding
- Theme toggle button
- Sticky positioning
- Glassmorphism effect with backdrop blur
- Responsive design

### Sidebar
Collapsible left navigation panel.

**Location:** `components/layout/sidebar.tsx`

**Features:**
- Navigation items with icons and active state highlighting
- Settings link at the bottom
- Collapse/expand toggle
- Smooth transitions
- Hidden on mobile (< md breakpoint)
- Smooth scroll for long navigation lists

**Navigation Items (Configurable in code):**
- Dashboard
- Devices
- API
- Logs
- Settings

**Customization:**

To add/modify navigation items, edit `NAV_ITEMS` array in `components/layout/sidebar.tsx`:

```tsx
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  // Add more items...
]
```

## UI Components

### ThemeToggle
Button to switch between light and dark color modes.

**Location:** `components/theme-toggle.tsx`

**Usage:**
```tsx
import { ThemeToggle } from '@/components/theme-toggle'

export default function MyComponent() {
  return <ThemeToggle />
}
```

**Features:**
- Smooth icon transitions
- Accessible (screen reader text included)
- Icons: Sun (light mode) and Moon (dark mode)
- No props required

### Button (shadcn/ui)
Available at `components/ui/button.tsx`

**Usage:**
```tsx
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="ghost">Ghost button</Button>
<Button variant="outline">Outline button</Button>
<Button size="sm">Small button</Button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

**Sizes:** `default`, `sm`, `lg`, `icon`

## Icon Library

All icons come from `lucide-react`. Import as needed:

```tsx
import { LayoutDashboard, Wifi, Code, FileText, Settings } from 'lucide-react'
```

**Currently Used Icons:**
- `LayoutDashboard` - Dashboard page
- `Wifi` - Devices page
- `Code` - API page
- `FileText` - Logs page
- `Settings` - Settings page
- `ChevronLeft` / `ChevronRight` - Collapse/expand
- `Sun` / `Moon` - Theme toggle

**Add More:**
Visit [lucide.dev](https://lucide.dev) for the full icon library.

## Utility Functions

### `cn()`
Combine classNames with conditional logic.

**Location:** `lib/utils.ts`

**Usage:**
```tsx
import { cn } from '@/lib/utils'

const className = cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)
```

## Page Template

Create new pages following this structure:

```tsx
import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'Page Name - PlaneSpotter Cloud',
  description: 'Brief page description',
}

export default function PageName() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
          <p className="text-muted-foreground mt-2">Description goes here.</p>
        </div>

        {/* Content section */}
        <div className="rounded-lg border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">
            Content will be implemented in future sprints.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
```

## Design Tokens

All color variables are defined as CSS custom properties in `app/globals.css`.

### Light Mode
- `--background: oklch(1 0 0)` - White
- `--foreground: oklch(0.145 0 0)` - Dark gray
- `--primary: oklch(0.205 0 0)` - Dark
- `--card: oklch(1 0 0)` - White
- `--border: oklch(0.922 0 0)` - Light gray

### Dark Mode
- `--background: oklch(0.145 0 0)` - Dark
- `--foreground: oklch(0.985 0 0)` - Light
- `--primary: oklch(0.922 0 0)` - Light gray
- `--card: oklch(0.205 0 0)` - Dark gray
- `--border: oklch(1 0 0 / 10%)` - Transparent white

### Semantic Classes

**Background:**
- `bg-background` - Page background
- `bg-card` - Card/surface background
- `bg-muted` - Muted background
- `bg-primary` - Primary action background

**Text:**
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `text-primary-foreground` - Text on primary background

**Borders:**
- `border-border` - Standard border color
- `border-input` - Form input border

## Best Practices

1. **Always use the AppLayout wrapper** for new pages
2. **Use semantic tokens** instead of hard-coded colors
3. **Keep components focused** - one responsibility per component
4. **Add TypeScript types** for all props
5. **Use responsive classes** (md:, lg:) for mobile-first design
6. **Prefer `cn()` utility** for conditional classes
7. **No mock data** - use placeholders instead
8. **Import types explicitly** from correct files

## Future Component Additions

The following components are planned for future sprints:

- **Card Component** - For dashboard cards/widgets
- **Form Components** - Input, TextArea, Checkbox, Radio
- **Table Component** - For device lists
- **Modal/Dialog** - For confirmations and forms
- **Toast/Notification** - For user feedback
- **Pagination** - For list navigation
- **Search/Filter** - For data filtering
- **Tab Navigation** - For grouping related content

These will be added as features are implemented and requirements become clear.
