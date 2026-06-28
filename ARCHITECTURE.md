# PlaneSpotter Cloud - Architecture

## Overview

PlaneSpotter Cloud is a professional web application for managing ESP32 PlaneSpotter devices. This document outlines the project structure and architectural patterns established in Sprint 1.

## Project Structure

```
project/
├── app/                          # Next.js App Router pages
│   ├── dashboard/                # Dashboard page
│   ├── devices/                  # Devices management page
│   ├── api/                      # API documentation page
│   ├── logs/                     # System logs page
│   ├── settings/                 # Application settings page
│   ├── layout.tsx                # Root layout with ThemeProvider
│   ├── page.tsx                  # Home page (redirects to dashboard)
│   └── globals.css               # Global styles and design tokens
├── components/
│   ├── layout/                   # Layout components
│   │   ├── app-layout.tsx        # Main app layout wrapper
│   │   ├── header.tsx            # Top navigation header
│   │   └── sidebar.tsx           # Left sidebar navigation
│   ├── ui/                       # shadcn/ui components
│   └── theme-toggle.tsx          # Dark/Light mode toggle
├── lib/
│   └── utils.ts                  # Utility functions (cn helper)
├── hooks/                        # Custom React hooks (future)
├── constants/                    # Application constants (future)
├── types/                        # TypeScript types (future)
└── public/                       # Static assets
```

## Design System

### Theme System
- **Provider:** `next-themes` for dark/light mode switching
- **Storage Key:** `ps-cloud-theme`
- **Default Theme:** Dark mode with system preference support
- **Colors:** OKLCH color space for better perceptual uniformity

### Color Palette (OKLCH)
- **Background:** `oklch(0.145 0 0)` (dark) / `oklch(1 0 0)` (light)
- **Foreground:** `oklch(0.985 0 0)` (dark) / `oklch(0.145 0 0)` (light)
- **Primary:** `oklch(0.922 0 0)` (dark) / `oklch(0.205 0 0)` (light)
- **Card:** `oklch(0.205 0 0)` (dark) / `oklch(1 0 0)` (light)
- **Border:** `oklch(1 0 0 / 10%)` (dark) / `oklch(0.922 0 0)` (light)

### Typography
- **Sans Font:** Geist (primary font family)
- **Mono Font:** Geist Mono (for code)
- **Line Height:** 1.4-1.6 (body text)
- **Min Font Size:** 14px

## Layout Architecture

### Responsive Design
- **Mobile First:** Sidebar hidden on screens < md (768px)
- **Desktop:** Sidebar visible with collapse toggle
- **Padding:** Responsive padding (p-4 sm:p-6 md:p-8)

### Components

#### AppLayout
Main wrapper that combines Header and Sidebar. Adjusts main content padding based on sidebar state.

**Props:**
- `children: React.ReactNode` - Page content

#### Header
Fixed top navigation bar with:
- PlaneSpotter branding (icon + text)
- Theme toggle button
- Future: User menu, notifications, etc.

#### Sidebar
Collapsible left navigation with:
- Navigation items (Dashboard, Devices, API, Logs)
- Settings at bottom
- Collapse/expand toggle button
- Active route highlighting
- Hidden on mobile, visible on desktop

#### ThemeToggle
Button to switch between light and dark modes with smooth transitions.

## Routing

All pages use the `AppLayout` wrapper and follow this pattern:

```typescript
import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'Page Title - PlaneSpotter Cloud',
  description: 'Page description',
}

export default function PageName() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page content */}
      </div>
    </AppLayout>
  )
}
```

## Future Development

### Sprint 2+
The following will be implemented in future sprints:

- **Authentication:** User login and session management
- **Database Integration:** Device data persistence
- **API Routes:** Backend endpoints for device management
- **Dashboard Features:** Statistics, charts, device overview
- **Device Management:** CRUD operations for devices
- **Logs System:** Log aggregation and filtering
- **Settings:** User preferences and configuration

### Pattern Guidelines

**New Pages:**
1. Create folder in `app/` with `page.tsx`
2. Wrap content with `AppLayout`
3. Import navigation items from `NAV_ITEMS` in sidebar
4. Follow existing metadata pattern

**New Components:**
1. Place in `components/` with appropriate subfolder
2. Use `cn()` utility for conditional classes
3. Follow shadcn/ui component patterns
4. Add TypeScript types for all props

**New Features:**
1. Keep components small and focused
2. Use React hooks for state management (later: Context or external state)
3. Avoid mock data - create placeholders instead
4. Always include TypeScript types

## Styling Guidelines

- Use Tailwind CSS utility classes
- Prefer semantic design tokens (bg-background, text-foreground)
- Use `cn()` utility for conditional classes
- Follow responsive prefixes (md:, lg:, etc.)
- No arbitrary values unless necessary
- Maintain consistent spacing with Tailwind scale

## Accessibility

- All interactive elements have proper ARIA labels
- Color contrast meets WCAG AA standards
- Semantic HTML elements (main, nav, header, aside)
- Screen reader only text with sr-only class
- Keyboard navigation support
- Theme preference respects system settings

## Deployment

The application is configured for deployment on Vercel with:
- Automatic builds from git
- Environment variables support
- Next.js optimization enabled
- Analytics integration (production only)

## Development

### Getting Started
```bash
pnpm install
pnpm dev
```

### Opening in Browser
Navigate to `http://localhost:3000` which redirects to `/dashboard`

### Making Changes
1. Edit files in the appropriate directories
2. Changes are hot-reloaded automatically
3. TypeScript errors appear in terminal and browser
4. Format with appropriate linter/formatter as configured
