# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

PersonalTrainerSwipe is a monorepo containing:
1. **pt-swipe/** - Next.js 16 web application (React 19, TypeScript/JavaScript)
2. **src/** - Standalone TypeScript utility/backend code (minimal, currently just a placeholder)

The main application is a Tinder-style swipe interface for matching client users with personal trainer users.

## Architecture

### pt-swipe (Main Application)

**Tech Stack:**
- Next.js 16 with App Router
- React 19 (Client Components)
- TypeScript 5 + JavaScript (mixed)
- Tailwind CSS v4
- Supabase for auth and database
- ESLint 9 with Next.js flat config

**Key Directories:**
- `app/` - Next.js App Router pages and layouts
  - `auth/page.tsx` - Magic link authentication flow
  - `create-profile/page.tsx` - Profile creation form
  - `swipe/page.js` - Main swipe interface with mock data
  - `login/page.js` - Alternative login page using Supabase Auth UI (requires @supabase/auth-ui-react)
  - `components/` - React components (SwipeCard.js, Swipedeck.js)
- `lib/` - Shared utilities
  - `supabaseClient.ts` - Supabase client initialization
  - `requireAuth.ts` - Server-side auth helper
- `public/` - Static assets including pt1.jpg and pt2.jpg for mock trainer profiles

**Authentication Flow:**
1. Root page (`app/page.tsx`) checks for session via Supabase
2. No session → redirects to `/auth` for magic link login
3. After auth → checks if profile exists in `profiles` table
4. No profile → redirects to `/create-profile`
5. Profile complete → redirects to `/swipe` (manual navigation currently required)

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

Create a `.env.local` file in the `pt-swipe/` directory with these values.

### Swipe Component System

The swipe interface uses a deck-based approach:
- **SwipeDeck** (`app/components/Swipedeck.js`) - Container managing profile stack and swipe state
  - Renders 2 profiles at a time in reverse order for stacking effect
  - Advances to next profile after each swipe
- **SwipeCard** (`app/components/SwipeCard.js`) - Individual draggable card with touch/mouse support
  - Swipe right (>120px) = like
  - Swipe left (<-120px) = pass
  - Shows "🔥 LIKE" or "❌ PASS" overlays during drag
  - Uses transform and rotation for smooth drag feedback

### Mixed JavaScript/TypeScript

**Important:** The codebase has mixed file extensions:
- Auth pages: `.tsx` files (auth/page.tsx, create-profile/page.tsx)
- Main app page: `.tsx` (page.tsx, layout.tsx)
- Swipe functionality: `.js` files (swipe/page.js, login/page.js)
- Components: `.js` files (SwipeCard.js, Swipedeck.js)
- Utilities: `.ts` files (lib/supabaseClient.ts, lib/requireAuth.ts)

When creating new files, match the pattern of similar files in the same directory.

## Development Commands

### pt-swipe (Next.js App)

Navigate to `pt-swipe/` directory first:

```bash
cd pt-swipe
```

**Development:**
```bash
npm run dev          # Start dev server on http://localhost:3000
```

**Build & Production:**
```bash
npm run build        # Build for production
npm start            # Start production server
```

**Linting:**
```bash
npm run lint         # Run ESLint on all files (uses ESLint 9 flat config)
```

### Root Level (TypeScript Utilities)

The root-level TypeScript is minimal (src/index.ts is a placeholder). To build:

```bash
npm run build        # Compile TypeScript to dist/
```

## Database Schema

The application expects a Supabase database with:

**profiles table:**
- `id` (uuid, primary key) - references auth.users(id)
- `name` (text) - user's display name
- `age` (integer) - user's age
- `training_style` (text) - preferred training style (e.g., Strength, HIIT, Yoga, CrossFit, Cardio)
- `goal` (text) - fitness goal (e.g., Weight Loss, Muscle Gain, Hypertrophy, Fat Loss, General Fitness)

**Authentication:**
- Magic link (OTP) authentication enabled in Supabase
- Email redirect configured to application root
