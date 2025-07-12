# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential commands for development:**
```bash
npm run dev       # Start development server (Vite)
npm run build     # Build for production (TypeScript check + Vite build)
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

**Note:** No test runner is configured yet. If tests are added, update this file with test commands.

## Architecture Overview

This is a React + TypeScript frontend for a Formula 1 Grand Prix review application, using:
- **Vite** as the build tool with SWC for fast compilation
- **React Query (TanStack Query)** for server state management
- **Better Auth** for authentication with OAuth support
- **Tailwind CSS v4** with Vite plugin for styling
- **shadcn/ui** components (New York style) built on Radix UI

### Key Architectural Decisions

1. **Path Aliasing**: Use `@/` to import from `src/` directory
2. **Component Organization**: 
   - Reusable UI components in `src/components/ui/`
   - Feature components in their respective folders
   - Layout components in `src/components/layout/`
3. **API Integration**: All API calls go through `src/lib/api.ts` using the configured backend URL
4. **Authentication**: Session-based auth with protected routes using `ProtectedRoute` component
5. **Theme System**: Dark/light mode with system preference detection, managed via React Context

### Important Files

- `src/App.tsx` - Main routing configuration
- `src/lib/auth-client.ts` - Auth client configuration with OAuth plugins
- `src/lib/queries.ts` - React Query hooks for data fetching
- `src/lib/api.ts` - API client functions
- `components.json` - shadcn/ui configuration

### Environment Variables

- `VITE_BACKEND_URL` - Backend API URL (defaults to `http://localhost:3000`)

## Common Development Tasks

### Adding a New Page
1. Create component in appropriate folder under `src/components/`
2. Add route in `src/App.tsx`
3. If authenticated, wrap with `<ProtectedRoute>`

### Adding API Endpoints
1. Add function to `src/lib/api.ts`
2. Create React Query hook in `src/lib/queries.ts`
3. Use hook in component with proper error handling

### Working with shadcn/ui Components
- Components are in `src/components/ui/`
- Use the New York style variants
- Components use CSS variables for theming

### Authentication Flow
- OAuth providers configured in `src/lib/auth-client.ts`
- Session checked via `authClient.useSession()` hook
- Sign in/out handled by `AuthModal` component

## Code Style Guidelines

- TypeScript strict mode is enabled - ensure proper typing
- Use functional components with hooks
- Follow existing patterns for API integration with React Query
- Tailwind classes for styling, avoid inline styles
- Component variants should use CVA (class-variance-authority)
- Use Tailwind v4 for styling
- Utilize Shadcn UI for UI components

## Backend Integration

The frontend expects a backend API running on the configured URL with endpoints for:
- `/api/races` - List of Grand Prix races
- `/api/races/:id` - Individual race details
- `/api/races/:id/reviews` - Reviews for a race
- Auth endpoints handled by Better Auth