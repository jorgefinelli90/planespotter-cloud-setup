# PlaneSpotter Cloud - Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ (check with `node --version`)
- pnpm 9+ (check with `pnpm --version`)
- Git for version control

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development server:**
   ```bash
   pnpm dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000` (automatically redirects to dashboard)

## Project Commands

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Type check
pnpm type-check
```

## File Structure Best Practices

### Adding a New Page

1. Create directory: `app/new-page/`
2. Create file: `app/new-page/page.tsx`
3. Use the page template:

```tsx
import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'New Page - PlaneSpotter Cloud',
  description: 'Page description',
}

export default function NewPageName() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Page</h1>
          <p className="text-muted-foreground mt-2">Description.</p>
        </div>
      </div>
    </AppLayout>
  )
}
```

4. Add to navigation in `components/layout/sidebar.tsx` if needed

### Adding a New Component

1. Create file in `components/` with appropriate subfolder
2. Add TypeScript types for all props:

```tsx
interface MyComponentProps {
  title: string
  description?: string
}

export function MyComponent({ title, description }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}
```

3. Use in other components:

```tsx
import { MyComponent } from '@/components/my-component'

export function Parent() {
  return <MyComponent title="Example" />
}
```

### Adding a New Hook

1. Create file in `hooks/use-feature.ts` following naming convention
2. Export from `hooks/index.ts`
3. Use with proper TypeScript types

```tsx
// hooks/use-feature.ts
import { useState } from 'react'

interface UseFeatureReturn {
  value: boolean
  toggle: () => void
}

export function useFeature(): UseFeatureReturn {
  const [value, setValue] = useState(false)
  
  return {
    value,
    toggle: () => setValue(!value),
  }
}
```

### Adding Utilities

1. Create file in `lib/` (e.g., `lib/helpers.ts`)
2. Export typed functions:

```tsx
// lib/helpers.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US').format(date)
}

export function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0)
}
```

### Adding Constants

1. Create file in `constants/` (e.g., `constants/api.ts`)
2. Export as constants:

```tsx
// constants/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
export const API_TIMEOUT = 5000
export const MAX_RETRIES = 3

export const ENDPOINTS = {
  DEVICES: '/api/devices',
  LOGS: '/api/logs',
  STATUS: '/api/status',
} as const
```

### Adding Types

1. Create file in `types/` (e.g., `types/device.ts`)
2. Define interfaces/types:

```tsx
// types/device.ts
export interface Device {
  id: string
  name: string
  status: 'online' | 'offline'
  lastSeen: Date
  firmware: string
}

export interface DeviceCreateInput {
  name: string
  serialNumber: string
}
```

## Styling Guide

### Using Tailwind Classes

```tsx
// Good - semantic classes
<div className="bg-background text-foreground p-4">
  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
    Click me
  </button>
</div>

// Also good - responsive classes
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Responsive</h1>
</div>

// Conditional classes with cn()
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'opacity-50'
)}>
  Conditional styling
</div>
```

### Color Variables

```tsx
// Always use design tokens
<div className="bg-background text-foreground border border-border">
  Content
</div>

// Not: bg-white, bg-black, text-black, text-white, etc.
```

### Responsive Design

Mobile-first approach:

```tsx
<div className="
  p-4           // Mobile: small padding
  md:p-6        // Tablet and up: medium padding
  lg:p-8        // Desktop and up: large padding
">
  Responsive padding
</div>
```

## Component Development Workflow

### 1. Plan
- Define component props with types
- Sketch the layout structure
- Identify reusable pieces

### 2. Develop
- Create the component file
- Add proper TypeScript types
- Use semantic HTML
- Apply Tailwind classes

### 3. Test
- Check in browser (hot reload)
- Test responsive design (mobile/tablet/desktop)
- Test theme toggle (light/dark)
- Check accessibility (keyboard nav, screen reader)

### 4. Refine
- Optimize re-renders (memoization if needed)
- Improve accessibility
- Add comments for complex logic

## Common Patterns

### Client-Side State

For simple state in a client component:

```tsx
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

### Server Component

For server-side rendering (default in App Router):

```tsx
// No 'use client' directive - this is a server component

export async function DataDisplay() {
  const data = await fetchData()
  
  return (
    <div>
      {/* Use data */}
    </div>
  )
}
```

### Conditional Rendering

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  isLoading && 'opacity-50 pointer-events-none',
  isError && 'border border-destructive'
)}>
  Content
</div>
```

## Debugging Tips

### Browser DevTools
- Open Developer Tools (F12 or Cmd+Option+I)
- Check Console tab for errors
- Use Network tab to debug API calls (future)
- Inspect Elements for styling issues

### Console Logging
```tsx
console.log('[ps-cloud]', 'message', variable)
```

### Type Errors
- Check the terminal for TypeScript errors
- Hover over red squiggles in editor to see error details
- Use strict mode to catch more issues

## Git Workflow

### Creating Feature Branches

```bash
# Update main
git checkout main
git pull

# Create feature branch
git checkout -b feature/description

# Make changes
git add .
git commit -m "feat: description of changes"

# Push to remote
git push -u origin feature/description
```

### Commit Message Format

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: reorganize code
test: add tests
chore: update dependencies
```

## Performance Tips

1. **Use React.memo for expensive components**
   ```tsx
   const MyComponent = React.memo(({ prop }: Props) => {
     return <div>{prop}</div>
   })
   ```

2. **Lazy load routes** (Next.js does this automatically)

3. **Optimize images** (use next/image when added)

4. **Avoid unnecessary re-renders**
   - Use proper dependency arrays in useEffect
   - Memoize callbacks with useCallback if needed
   - Keep state as local as possible

5. **Code splitting** (Next.js handles automatically)

## Accessibility Checklist

- [ ] All buttons and links have meaningful labels
- [ ] Form inputs have associated labels
- [ ] Color is not the only indicator of state
- [ ] Keyboard navigation works throughout app
- [ ] Screen reader text for icons (`sr-only` class)
- [ ] Proper heading hierarchy (h1, h2, h3, etc.)
- [ ] Alt text for images
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Focus visible on interactive elements

## Testing

Current setup supports:
- TypeScript for type safety
- ESLint for code quality
- Hot reload for rapid development

Future additions:
- Unit tests (Jest)
- Integration tests (Vitest)
- E2E tests (Playwright or Cypress)

## Troubleshooting

### Dev server won't start
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm dev
```

### Port 3000 already in use
```bash
# Run on different port
pnpm dev -- -p 3001
```

### TypeScript errors in editor
- Restart the TypeScript server in your editor
- Close and reopen the project

### Styles not applying
- Check that you're using correct Tailwind classes
- Ensure the file imports from globals.css
- Use design tokens, not hard-coded colors

## Next Steps for Future Sprints

1. Set up authentication system
2. Configure database connection
3. Create API routes for device management
4. Add form components and validation
5. Implement error handling and loading states
6. Add unit tests
7. Set up CI/CD pipeline
8. Configure monitoring and logging

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Lucide Icons](https://lucide.dev)
- [Vercel Deployment Guide](https://vercel.com/docs)
