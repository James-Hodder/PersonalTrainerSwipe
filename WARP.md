# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

PersonalTrainerSwipe is an npm workspaces monorepo:

```
apps/
  web/        @pt-swipe/web     Next.js 16 web app (React 19, TypeScript/JavaScript)
  mobile/     (planned)         React Native / Expo app
packages/
  shared/     @pt-swipe/shared  Platform-agnostic types and logic used by every app
```

The product is a Tinder-style swipe interface for matching client users with personal trainer users.

Always run `npm install` from the repo root — there is a single root `package-lock.json` and no per-app lockfiles.

## Architecture

### packages/shared

Raw TypeScript (no build step) consumed directly by each app's bundler. Contains:
- `profile.ts` - `UserProfile` type
- `trainers.ts` - `Trainer` type, `mockTrainers`, `getTrainerById`, `computeMatch` scoring
- `matches.ts` - `Match` / `ChatMessage` types, `createMessage`

Rule: nothing in `shared` may touch `window`, the DOM, React Native APIs or storage. Platform-specific
code (e.g. `localStorage` persistence) stays in the app. Apps import it as `@pt-swipe/shared`; the web
app lists it in `transpilePackages` in `next.config.ts`.

### apps/web (Web Application)

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
- `lib/` - Web-only utilities
  - `supabaseClient.ts` - Supabase client initialization
  - `requireAuth.ts` - Server-side auth helper
  - `localProfile.ts`, `matches.ts` - `localStorage` persistence for profile, matches and chats
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

Create a `.env.local` file in the `apps/web/` directory with these values.

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

Run everything from the repo root:

```bash
npm install          # Install all workspaces (single root lockfile)
npm run dev          # Start the web dev server on http://localhost:3000
npm run build        # Production build of the web app
npm start            # Start the production web server
npm run lint         # ESLint the web app (ESLint 9 flat config)
npm run typecheck    # Type-check packages/shared
```

To target one workspace directly, use `-w`:

```bash
npm run <script> -w @pt-swipe/web
npm install <pkg> -w @pt-swipe/web     # add a dependency to a single app
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
