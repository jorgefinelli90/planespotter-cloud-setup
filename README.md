# PlaneSpotter Cloud

A professional web application for managing ESP32 PlaneSpotter devices in the cloud.

## Sprint 1 - Foundation

This is the initial foundation (Sprint 1) of PlaneSpotter Cloud, focused on creating a clean, scalable, and professional architecture without implementing feature-specific functionality yet.

### What's Included

✅ **Architecture**
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS 4.2 for styling
- shadcn/ui component library
- Professional folder structure

✅ **Theme System**
- Dark/Light mode toggle with `next-themes`
- OKLCH color palette for better perceptual uniformity
- Smooth transitions between themes
- System preference detection

✅ **Layout Components**
- Fixed header with branding
- Collapsible sidebar navigation
- Responsive design (mobile-first)
- Theme toggle button
- Professional UI following Vercel/GitHub/Linear aesthetic

✅ **Pages**
- Dashboard (home)
- Devices management
- API documentation
- System logs
- Application settings

✅ **Documentation**
- `ARCHITECTURE.md` - Project structure and patterns
- `COMPONENTS.md` - Component library and usage
- `DEVELOPMENT.md` - Development guide and best practices

### What's NOT Included (Future Sprints)

❌ **Authentication** - Login and user management
❌ **Database** - Device data persistence
❌ **APIs** - Backend endpoints for device operations
❌ **Features** - Dashboard statistics, device management, etc.
❌ **Mock Data** - Only placeholders for future content

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+ (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open in browser
# → http://localhost:3000
```

The app will automatically redirect to the dashboard.

## Project Structure

```
project/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard page
│   ├── devices/            # Devices page
│   ├── api/                # API page
│   ├── logs/               # Logs page
│   ├── settings/           # Settings page
│   └── layout.tsx          # Root layout with theme provider
├── components/
│   ├── layout/             # Layout components (Header, Sidebar)
│   └── theme-toggle.tsx    # Dark/Light toggle
├── lib/                    # Utilities
└── public/                 # Static assets
```

## Features

### Layout
- **Header** - Fixed top navigation with PlaneSpotter branding and theme toggle
- **Sidebar** - Collapsible left navigation with active route highlighting
- **Responsive** - Mobile-friendly design with proper breakpoints

### Navigation
- Dashboard (default page)
- Devices
- API
- Logs
- Settings

### Theme
- **Dark Mode** - Default theme for professional appearance
- **Light Mode** - Alternative theme for different preferences
- **System Preference** - Respects OS dark/light mode settings
- **Persistence** - Theme preference saved in localStorage

### Design
- **Color System** - OKLCH color space for perceptual consistency
- **Spacing** - Tailwind scale for consistent spacing
- **Typography** - Geist font family for modern appearance
- **Icons** - Lucide icons for consistent iconography

## Usage

### Creating a New Page

1. Create folder: `app/page-name/`
2. Create file: `page-name/page.tsx`
3. Wrap with `AppLayout`:

```tsx
import { AppLayout } from '@/components/layout/app-layout'

export const metadata = {
  title: 'Page Name - PlaneSpotter Cloud',
  description: 'Page description',
}

export default function PageName() {
  return (
    <AppLayout>
      <div>Your content here</div>
    </AppLayout>
  )
}
```

### Adding Navigation Items

Edit `components/layout/sidebar.tsx` and update `NAV_ITEMS`:

```tsx
const NAV_ITEMS = [
  {
    label: 'New Page',
    href: '/new-page',
    icon: IconName,
  },
]
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Project structure, routing, and design patterns
- **[COMPONENTS.md](./COMPONENTS.md)** - Available components and their usage
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide and best practices

## Tech Stack

- **Framework** - Next.js 16
- **Language** - TypeScript
- **Styling** - Tailwind CSS 4.2
- **UI Components** - shadcn/ui
- **Icons** - Lucide React
- **Theme** - next-themes
- **Font** - Geist (Google Fonts)

## Deployment

Deploy to Vercel with one click:

```bash
# The project is ready for Vercel deployment
# Just connect your Git repository and deploy
```

Environment variables are managed in the Vercel dashboard.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML elements
- WCAG AA color contrast
- Keyboard navigation support
- Screen reader friendly
- Focus visible indicators
- ARIA labels where needed

## Performance

- Fast build times with Turbopack
- Zero JavaScript on initial page load (where possible)
- Optimized CSS with Tailwind
- Responsive images support (future)
- Font optimization with next/font

## Code Quality

- TypeScript for type safety
- ESLint configuration
- Consistent code formatting
- Modern JavaScript/React patterns

## Next Steps

### Sprint 2+
1. Set up authentication system
2. Configure database (Neon/Supabase)
3. Create API routes for device management
4. Build dashboard with statistics
5. Implement device CRUD operations
6. Add system logs viewer
7. Create settings management interface
8. Write unit and integration tests
9. Set up monitoring and error tracking
10. Deploy to production

## Contributing

Follow the development guide in [DEVELOPMENT.md](./DEVELOPMENT.md) for:
- Code style and patterns
- File structure conventions
- Component development workflow
- Git workflow and commit messages

## License

This project is part of PlaneSpotter Cloud.

## Support

For issues, questions, or suggestions:
1. Check the documentation files
2. Review the development guide
3. Open an issue on GitHub (when available)

---

**Status:** Sprint 1 Complete ✅

This foundation is ready for feature development in future sprints. The architecture, styling system, and component library are established and documented for scaling development.
