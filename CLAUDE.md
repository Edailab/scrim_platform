# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (PostgreSQL)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/ui/          # shadcn/ui components
├── lib/supabase/           # Supabase client utilities
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client (for Server Components)
│   └── middleware.ts       # Session refresh logic
├── types/database.ts       # Supabase database types
└── middleware.ts           # Next.js middleware (auth session)
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

---

# Project Context: "DongTier" (Scrim Platform Ver.)

## Project Overview

**"DongTier"** is a location-based **League of Legends Scrim (5v5 Custom Match) Matching Platform**.
It moves away from individual solo-rank leaderboards to focus on **Team-vs-Team** matchmaking within local neighborhoods.

* **Core Loop:** Create Team → Find Opponent (via Board) → Play Match → Report Result → Gain Territory Points.
* **Key Constraint:** No real-time chat/socket logic. Use external links (Discord) for communication.

## Database Schema (Supabase)

### `teams` (The Central Unit)
* `id` (uuid), `name`, `region_depth1/2/3` (address hierarchy)
* `captain_id` → `profiles.id`, `contact_link` (required external chat URL)
* `avg_tier_score`, `win_count`, `loss_count`

### `profiles` (Users)
* `team_id` → `teams`, `position` (TOP/JUNGLE/MID/ADC/SUP)
* `tier_data` (synced from Riot API)

### `matches` (The Board)
* `host_team_id`, `challenger_team_id` (nullable)
* `status`: OPEN → MATCHED → PENDING_RESULT → COMPLETED/DISPUTED
* `scheduled_at`, `target_tier`, `result_screenshot_url`, `winner_team_id`

## UI Pages

1. **Arena (Main Feed):** Scrim request cards with filters (region, tier, time). FAB: "격문 쓰기"
2. **Team Management:** Dashboard, invite link generator, roster view
3. **Territory War:** Map/leaderboard showing regional dominance

## Key Logic

* **Communication:** No built-in chat. Reveal `contact_link` when match is accepted.
* **Verification:** Mutual agreement system - Team A claims victory, Team B confirms or disputes.

## AI Instructions

* Prioritize **Team Creation** and **Scrim Board** features over individual stats.
* All UI text in **Korean**.
