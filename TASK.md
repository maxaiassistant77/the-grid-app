# The Grid — Major Upgrade: MCP Server + Agent Connect + Dynamic Scoring

## Context
The Grid is a gamified AI Employee Dashboard for the "Agents to Life" community (Skool). Users build AI agents (using OpenClaw, Claude Cowork, etc.) and compete on a community leaderboard based on real agent performance metrics.

Currently: localStorage MVP with mock data, basic stat logging, leaderboard with fake users.

## What We're Building

### 1. Supabase Backend (Replace localStorage)
- Set up Supabase tables for: users, agents, stats, activity_logs, achievements, leaderboard
- Auth via Supabase Auth (email magic link or email/password)
- Row-level security policies
- Real-time subscriptions for leaderboard updates
- Keep the existing Supabase packages already installed

### 2. Agent Connect Page (Post-Login)
After a user creates an account and logs in, they need a dedicated "Connect Your Agent" page/flow:
- Step-by-step wizard to connect their AI agent
- Support for: OpenClaw (primary), Claude Cowork (coming soon badge), Other/Custom
- For OpenClaw: generate a unique API key the user adds to their agent's config
- Show connection status (connected/disconnected/last seen)
- Test connection button that pings the agent
- Beautiful UI with animations — this is the "wow" moment

### 3. MCP Server API Endpoints
Build API routes (Next.js API routes or Supabase Edge Functions) that agents call to report stats:

**Endpoints:**
- `POST /api/agent/heartbeat` — Agent checks in, reports it's alive
- `POST /api/agent/stats` — Agent reports activity metrics
- `GET /api/agent/profile/:id` — Get agent scorecard
- `GET /api/leaderboard` — Public leaderboard data
- `POST /api/agent/skills` — Agent reports installed skills
- `POST /api/agent/memory` — Agent reports memory stats

**Auth:** Bearer token (the API key generated during Agent Connect)

### 4. Dynamic Scoring System
Replace the simple score calculation with a multi-dimensional scoring system:

**Activity Metrics (real-time from agent):**
- Tasks completed (daily/weekly/monthly breakdown)
- Session count and duration
- Tools used per session
- Sub-agents spawned
- Uptime percentage

**Capability Metrics:**
- Skills installed (count + list with icons)
- Integrations connected (email, calendar, CRM, etc.)
- Memory depth (number of memories, how far back)
- Model being used

**Complexity Scoring:**
- Simple task: 1 point (quick lookup, single tool call)
- Medium task: 3 points (multi-step workflow, research)
- Complex task: 5 points (sub-agent orchestration, code generation)
- Epic task: 10 points (full project builds, multi-hour autonomous work)

**Quality Metrics:**
- Memory strength score
- Proactivity score (initiates vs only responds)
- Integration depth
- Streak (consecutive days active)

### 5. Agent Scorecard (Profile Page Upgrade)
Each user's profile becomes a rich "Agent Scorecard":
- Overall agent score with animated level badge
- Radar/spider chart showing: Activity, Capability, Memory, Proactivity, Complexity
- Skills list with icons and categories
- Integration badges (connected services)
- Memory depth indicator (visual)
- Streak fire counter with animation
- Complexity distribution (pie/donut chart — how many simple vs medium vs complex vs epic)
- "Money Acquired — Coming Soon" section with lock icon and teaser
- Recent activity timeline

### 6. Enhanced Leaderboard
- Real users from Supabase (keep some seed/demo data for feel)
- Real-time updates via Supabase subscriptions
- Filter by: Overall, Tasks, Complexity, Capability, Streaks
- Animated rank changes
- Click any user to see their public agent scorecard
- Season banner (Season 1)
- Top 3 get special visual treatment (gold/silver/bronze glow)

### 7. Dashboard Upgrade
- Real stats from Supabase, not localStorage
- Agent status indicator (online/offline/last seen)
- Quick stats cards with sparkline trends
- Daily/weekly/monthly toggle for all metrics
- "Connect Agent" CTA if not connected yet
- Notification area for achievements unlocked

## Design Guidelines
- Keep the existing dark theme aesthetic
- Electric purple (#6c5ce7) and neon green (#00e676) accents
- Framer Motion animations everywhere — smooth, premium feel
- Glass morphism cards with subtle borders
- The whole thing should feel like a gaming dashboard meets SaaS product
- When someone first logs in and sees this, the reaction should be "holy shit this is cool"
- Mobile responsive
- NO em dashes in any UI copy

## Tech Stack (Already Set Up)
- Next.js 16 with App Router
- React 19
- Tailwind CSS v4
- Framer Motion
- Supabase (SSR + JS client already installed)
- TypeScript

## What NOT to Build Yet
- Actual crypto/blockchain verification (Phase 4)
- Revenue tracking beyond the "Coming Soon" placeholder
- Cowork integration (show as "Coming Soon" badge)
- MCP protocol compliance (just REST API for now, MCP wrapper later)

## Priority Order
1. Supabase schema + auth
2. Agent Connect flow
3. API endpoints for agent reporting
4. Dynamic scoring engine
5. Agent Scorecard page
6. Enhanced leaderboard
7. Dashboard upgrade

## Environment
- Supabase project needs to be created or use existing one
- For now, create a `.env.local.example` with the required Supabase vars
- The app is deployed on Vercel at https://the-grid-lovat.vercel.app
- GitHub: maxaiassistant77/the-grid-app
