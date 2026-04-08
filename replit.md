# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Glowra Mobile App

AI-powered face & skin analysis app for women. Built with Expo (React Native).

### Screens
- **Onboarding** (`/onboarding`) — 3-slide welcome flow with animated dots
- **Auth** (`/auth`) — Sign in / Sign up with email & password
- **Home** (`/(tabs)/index`) — Dashboard with scan CTA, last scan result, tips
- **Camera** (`/camera`) — Selfie capture or gallery upload for analysis
- **Analyzing** (`/analyzing`) — AI processing animation with step-by-step progress
- **Results** (`/results`) — Skin score, skin age, hydration/pigmentation/texture/pores analytics
- **Routine** (`/routine`) — AI daily skincare routine (morning/evening/tips tabs)
- **Subscribe** (`/subscribe`) — Free vs Pro paywall with feature comparison
- **History** (`/(tabs)/history`) — Scan history with stats
- **Profile** (`/(tabs)/profile`) — User profile, stats, menu, logout

### Design Tokens (Glowra)
- **Font**: Nunito (400/500/600/700/800)
- **Primary**: `#E8738A` (rose pink)
- **Background**: `#FFF8F5` (warm cream)
- **Blush**: `#F9E8E8`
- **Gold**: `#D4A96A`

### Subscription Model
- **Free**: 1 scan/day, basic report (score + skin age + basic analytics), no AI suggestions/routine
- **Pro ($9.99/mo)**: Unlimited scans, deep report, AI suggestions, daily routine

## AI Integration (Gemini)

Powered by **Gemini 3 Flash** via Replit AI Integrations (no user API key required).

### API Endpoints (api-server)
- `POST /api/ai/analyze-skin` — Analyzes a base64 selfie image, returns skin scores (skinScore, skinAge, hydration, pigmentation, texture, pores, elasticity)
- `POST /api/ai/generate-routine` — Takes skin metrics, returns personalized morning/evening routine steps and AI insights

### Mobile Integration
- `artifacts/glowra/lib/aiService.ts` — Handles image-to-base64 conversion and API calls
- `artifacts/glowra/app/analyzing.tsx` — Calls AI analysis instead of random data; falls back gracefully if AI fails
- `artifacts/glowra/app/routine.tsx` — Fetches AI-generated routine from API; caches by scan ID

### Environment Variables
- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Auto-configured by Replit
- `AI_INTEGRATIONS_GEMINI_API_KEY` — Auto-configured by Replit
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
