# The Grid - UI Rebuild Task

## Overview
Rebuild the UI of this Next.js app to match the reference screenshots in `/reference/`. Keep the existing data model, store logic, and component architecture. This is a UI/design update + adding missing sections.

## Reference Screenshots
- `reference/hero-and-overview.jpg` - Main dashboard layout: nav bar, hero agent card, stats row, leaderboard preview
- `reference/leaderboard-and-challenge.jpg` - Community Leaderboard with tabs + Monthly Challenge sidebar
- `reference/skills-and-activity.jpg` - Installed Skills grid + "What Your AI Did Today" feed

## CRITICAL: What To Match

### 1. Navigation Bar (update `Nav.tsx`)
- Left: "Hey, {name} 👋" greeting (not a logo)
- Right: "🏆 Community Rank: #{rank} of {total}" pill/badge + notification bell icon (with red dot)
- Clean white bg with subtle border-bottom, no heavy shadow

### 2. Hero Agent Card (update dashboard)
- Left side: Large circular agent avatar (robot/AI icon in dark circle), Agent name ("Max"), green "Online & Working" status badge, "Level {n}" pill (dark navy/teal), title text "AI Architect"
- Right side: Circular progress ring showing "Employee Score" with score/1000 inside
- Layout: flex row, spacious padding

### 3. Stats Row (3 cards, not 4)
- "tasks completed" (142) - light gray bg
- "hours saved" (37) - light gray bg  
- "revenue generated" ($4,200) - light GREEN bg (this one stands out)
- Clean, minimal cards. Just the number big and bold, label below in gray
- NO "+" add buttons visible on the stat cards themselves (logging happens via separate actions)
- NO streak card in this row

### 4. Community Leaderboard (update `Leaderboard.tsx`)
- Header: "🏆 Community Leaderboard" + "- February 2026" date text
- Tabs: "Overall", "Money Made", "Time Saved", "Most Built" (update tab labels)
- Each row: medal icon (gold/silver/bronze for top 3), circular initials avatar (2-letter, colored), Name, "Agent: {agentName}" below, score on right, trend arrow with +/- number
- Current user row: highlighted with subtle blue/cyan border and "(You)" badge next to name
- Rows are clean, well-spaced

### 5. Monthly Challenge (update `Challenge.tsx`)
- Title: "🎯 February Challenge" 
- Card inside: Yellow/warm bg with challenge title "The Revenue Race" and description
- "🏆 Prize" section with prize text
- "Time Remaining" progress bar (green to yellow gradient) + "X days left" text on right
- "Current Leaders" list with medal + initials + name + dollar amount
- "Submit Entry" dark button at bottom

### 6. NEW: Installed Skills Section (create `InstalledSkills.tsx`)
- Header: "Installed Skills" left, "Browse Skill Library >" link on right
- Horizontal row of skill cards (not grid)
- Each card: icon on top, skill name, "Active"/"Inactive" status in green/gray
- Some cards have "New" badge (small red/green pill in top-right corner)
- Skills: Email Automation, Lead Scoring, Content Writer, Meeting Scheduler, CRM Integration, Competitor Analysis
- Cards have subtle border, rounded corners, clean white bg

### 7. NEW: "What Your AI Did Today" Section (create `DailyActivity.tsx`)
- Header: "What Your AI Did Today"
- List of activity items, each with:
  - Small icon (emoji or styled icon)
  - Activity text ("Sent 3 follow-up emails", "Generated blog post draft", etc.)
  - Time ago on the right ("2h ago", "4h ago", etc.)
- Clean card with subtle border

## Design System (match exactly)
- Background: #FAFBFC (very light gray)
- Card bg: white with subtle border (border-gray-100) and very subtle shadow
- Primary accent: #00B4E6 (cyan blue) for interactive elements
- Text primary: #0a0a0f (near black)
- Text secondary: gray-500
- Success green: #10B981 for status badges and revenue card
- Level badges use dark navy/teal colors
- Medal colors: Gold (#FFD700), Silver (#C0C0C0), Bronze (#CD7F32)
- Font: Geist Sans (already set up)
- Rounded corners: rounded-2xl on cards, rounded-full on badges/pills
- Very clean, professional SaaS aesthetic - no gradients on backgrounds, minimal shadows

## Layout Order (top to bottom)
1. Nav bar (fixed)
2. Hero Agent Card
3. Stats Row (3 cards)
4. Leaderboard (left 60%) + Challenge (right 40%) side by side
5. Installed Skills (full width)
6. What Your AI Did Today (full width)
7. Achievements (keep existing, full width)

## Technical Notes
- Keep using localStorage for now (Supabase comes later)
- Keep existing store.ts logic, mock data, types
- Install deps first: `npm install`
- Test with `npm run dev` after changes
- The app uses Tailwind CSS v4 with @theme inline pattern
- Keep framer-motion animations but subtle (not over the top)
- Keep confetti on achievements
- DO NOT use em dashes (--) anywhere in text content

## Files to Modify
- `src/components/Nav.tsx` - Redesign nav
- `src/components/StatCard.tsx` - Simplify to match
- `src/components/Leaderboard.tsx` - Update design + tab labels
- `src/components/Challenge.tsx` - Redesign to match
- `src/app/dashboard/page.tsx` - Reorganize layout, add new sections
- `src/app/globals.css` - Any new utility styles needed

## Files to Create
- `src/components/InstalledSkills.tsx` - New skills grid section
- `src/components/DailyActivity.tsx` - New "What Your AI Did Today" section

## What NOT to Change
- `src/lib/types.ts` - Keep existing types
- `src/lib/store.ts` - Keep existing store logic
- `src/lib/mock-data.ts` - Keep existing mock data
- `src/app/page.tsx` - Keep landing page as-is
- `src/app/layout.tsx` - Keep layout as-is

When completely finished, run this command to notify me:
openclaw system event --text "Done: Rebuilt The Grid UI to match reference screenshots - hero card, leaderboard, skills, daily activity" --mode now
