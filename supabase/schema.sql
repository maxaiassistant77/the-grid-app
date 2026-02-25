-- The Grid - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'openclaw', -- 'openclaw', 'claude_cowork', 'custom'
  model TEXT DEFAULT 'claude-3-5-sonnet',
  status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
  last_seen_at TIMESTAMPTZ,
  connection_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One agent per user for now
);

-- ============================================
-- AGENT STATS TABLE (cumulative stats)
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,

  -- Activity metrics
  tasks_completed INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  total_session_duration INTEGER DEFAULT 0, -- in minutes
  tools_used INTEGER DEFAULT 0,
  subagents_spawned INTEGER DEFAULT 0,
  uptime_percentage DECIMAL(5,2) DEFAULT 0,

  -- Complexity breakdown
  simple_tasks INTEGER DEFAULT 0,
  medium_tasks INTEGER DEFAULT 0,
  complex_tasks INTEGER DEFAULT 0,
  epic_tasks INTEGER DEFAULT 0,

  -- Quality metrics
  memory_strength INTEGER DEFAULT 0,
  proactivity_score INTEGER DEFAULT 0,
  integration_depth INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,

  -- Calculated scores
  total_score INTEGER DEFAULT 0,
  activity_score INTEGER DEFAULT 0,
  capability_score INTEGER DEFAULT 0,
  complexity_score INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id)
);

-- ============================================
-- AGENT SKILLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'productivity', 'communication', 'development', 'data', 'integration'
  icon TEXT,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, name)
);

-- ============================================
-- AGENT INTEGRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'gmail', 'slack', 'notion', 'github', etc.
  connected BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ,
  UNIQUE(agent_id, name)
);

-- ============================================
-- AGENT MEMORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  total_memories INTEGER DEFAULT 0,
  memory_depth_days INTEGER DEFAULT 0, -- how far back memories go
  last_memory_at TIMESTAMPTZ,
  categories JSONB DEFAULT '{}', -- { "work": 50, "personal": 20, etc. }
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'task', 'session_start', 'session_end', 'tool_use', 'subagent', 'heartbeat'
  complexity TEXT, -- 'simple', 'medium', 'complex', 'epic'
  description TEXT,
  metadata JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_agent_id ON public.activity_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(type);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY, -- 'first-task', 'streak-7', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'activity', 'streak', 'score', 'special'
  requirement_value INTEGER DEFAULT 0,
  points INTEGER DEFAULT 25
);

-- Insert default achievements
INSERT INTO public.achievements (id, name, description, icon, category, requirement_value, points) VALUES
  ('first-task', 'First Task', 'Complete your first task', '🎯', 'activity', 1, 25),
  ('tasks-10', 'Task Beginner', 'Complete 10 tasks', '✅', 'activity', 10, 25),
  ('tasks-50', 'Task Warrior', 'Complete 50 tasks', '⚔️', 'activity', 50, 50),
  ('tasks-100', 'Task Crusher', 'Complete 100 tasks', '🏆', 'activity', 100, 100),
  ('tasks-500', 'Task Machine', 'Complete 500 tasks', '🤖', 'activity', 500, 200),
  ('streak-3', 'Streak Starter', 'Maintain a 3-day streak', '🔥', 'streak', 3, 25),
  ('streak-7', 'Week Warrior', 'Maintain a 7-day streak', '⚡', 'streak', 7, 50),
  ('streak-30', 'Monthly Master', 'Maintain a 30-day streak', '💫', 'streak', 30, 150),
  ('streak-100', 'Unstoppable', 'Maintain a 100-day streak', '🌟', 'streak', 100, 500),
  ('score-100', 'Rising Star', 'Reach 100 total score', '⭐', 'score', 100, 25),
  ('score-500', 'Power Player', 'Reach 500 total score', '💪', 'score', 500, 50),
  ('score-1000', 'Elite Agent', 'Reach 1000 total score', '🏅', 'score', 1000, 100),
  ('score-5000', 'Legendary', 'Reach 5000 total score', '👑', 'score', 5000, 250),
  ('complex-first', 'Complexity Unlocked', 'Complete your first complex task', '🧩', 'special', 1, 50),
  ('epic-first', 'Epic Achievement', 'Complete your first epic task', '🚀', 'special', 1, 100),
  ('skills-5', 'Skill Collector', 'Install 5 skills', '📚', 'special', 5, 50),
  ('integrations-3', 'Connected', 'Connect 3 integrations', '🔌', 'special', 3, 50)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USER ACHIEVEMENTS TABLE (unlocked achievements)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- LEADERBOARD VIEW (for fast queries)
-- ============================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id as user_id,
  p.name,
  p.avatar_url,
  a.id as agent_id,
  a.name as agent_name,
  a.status as agent_status,
  COALESCE(s.total_score, 0) as total_score,
  COALESCE(s.tasks_completed, 0) as tasks_completed,
  COALESCE(s.current_streak, 0) as current_streak,
  COALESCE(s.activity_score, 0) as activity_score,
  COALESCE(s.capability_score, 0) as capability_score,
  COALESCE(s.complexity_score, 0) as complexity_score,
  COALESCE(s.simple_tasks, 0) as simple_tasks,
  COALESCE(s.medium_tasks, 0) as medium_tasks,
  COALESCE(s.complex_tasks, 0) as complex_tasks,
  COALESCE(s.epic_tasks, 0) as epic_tasks,
  a.last_seen_at,
  (
    SELECT COUNT(*) FROM public.agent_skills sk WHERE sk.agent_id = a.id AND sk.enabled = true
  ) as skills_count,
  CASE
    WHEN COALESCE(s.total_score, 0) >= 5000 THEN 'Legend'
    WHEN COALESCE(s.total_score, 0) >= 2500 THEN 'Architect'
    WHEN COALESCE(s.total_score, 0) >= 1000 THEN 'Creator'
    WHEN COALESCE(s.total_score, 0) >= 500 THEN 'Builder'
    ELSE 'Apprentice'
  END as level
FROM public.profiles p
LEFT JOIN public.agents a ON a.user_id = p.id
LEFT JOIN public.agent_stats s ON s.agent_id = a.id
ORDER BY COALESCE(s.total_score, 0) DESC;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Agents: Users can manage their own agents, read others for leaderboard
CREATE POLICY "Agents are viewable by everyone" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Users can manage own agents" ON public.agents FOR ALL USING (auth.uid() = user_id);

-- Agent Stats: Public read, owner write
CREATE POLICY "Agent stats are viewable by everyone" ON public.agent_stats FOR SELECT USING (true);
CREATE POLICY "Agent stats writable by owner" ON public.agent_stats FOR ALL
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

-- Skills: Public read, owner write
CREATE POLICY "Skills are viewable by everyone" ON public.agent_skills FOR SELECT USING (true);
CREATE POLICY "Skills writable by owner" ON public.agent_skills FOR ALL
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

-- Integrations: Owner only
CREATE POLICY "Integrations viewable by owner" ON public.agent_integrations FOR SELECT
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));
CREATE POLICY "Integrations writable by owner" ON public.agent_integrations FOR ALL
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

-- Memory: Owner only
CREATE POLICY "Memory viewable by owner" ON public.agent_memory FOR SELECT
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));
CREATE POLICY "Memory writable by owner" ON public.agent_memory FOR ALL
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

-- Activity logs: Public read (for leaderboard), owner write
CREATE POLICY "Activity logs are viewable by everyone" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Activity logs writable by owner" ON public.activity_logs FOR INSERT
  WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

-- User achievements: Public read, owner write
CREATE POLICY "Achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Achievements writable by owner" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'grid_' || encode(gen_random_bytes(24), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update agent stats
CREATE OR REPLACE FUNCTION update_agent_stats(
  p_agent_id UUID,
  p_tasks_completed INTEGER DEFAULT 0,
  p_simple INTEGER DEFAULT 0,
  p_medium INTEGER DEFAULT 0,
  p_complex INTEGER DEFAULT 0,
  p_epic INTEGER DEFAULT 0
)
RETURNS void AS $$
DECLARE
  v_points INTEGER;
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
  v_streak INTEGER;
BEGIN
  -- Calculate points
  v_points := (p_simple * 1) + (p_medium * 3) + (p_complex * 5) + (p_epic * 10);

  -- Get current stats
  SELECT last_active_date, current_streak INTO v_last_date, v_streak
  FROM public.agent_stats WHERE agent_id = p_agent_id;

  -- Update streak
  IF v_last_date IS NULL THEN
    v_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    v_streak := v_streak + 1;
  ELSIF v_last_date < v_today - 1 THEN
    v_streak := 1;
  END IF;

  -- Upsert stats
  INSERT INTO public.agent_stats (agent_id, tasks_completed, simple_tasks, medium_tasks, complex_tasks, epic_tasks, current_streak, last_active_date, total_score)
  VALUES (p_agent_id, p_tasks_completed, p_simple, p_medium, p_complex, p_epic, v_streak, v_today, v_points)
  ON CONFLICT (agent_id) DO UPDATE SET
    tasks_completed = agent_stats.tasks_completed + p_tasks_completed,
    simple_tasks = agent_stats.simple_tasks + p_simple,
    medium_tasks = agent_stats.medium_tasks + p_medium,
    complex_tasks = agent_stats.complex_tasks + p_complex,
    epic_tasks = agent_stats.epic_tasks + p_epic,
    current_streak = v_streak,
    longest_streak = GREATEST(agent_stats.longest_streak, v_streak),
    last_active_date = v_today,
    total_score = agent_stats.total_score + v_points,
    complexity_score = agent_stats.complexity_score + v_points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate level
CREATE OR REPLACE FUNCTION get_level(score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF score >= 5000 THEN RETURN 'Legend';
  ELSIF score >= 2500 THEN RETURN 'Architect';
  ELSIF score >= 1000 THEN RETURN 'Creator';
  ELSIF score >= 500 THEN RETURN 'Builder';
  ELSE RETURN 'Apprentice';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Demo users for leaderboard feel)
-- ============================================

-- Note: Run this separately after schema is created
-- These are demo profiles that will show on the leaderboard

/*
-- Create demo users (you'll need to create these through auth or manually)
INSERT INTO public.profiles (id, name, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alex Chen', 'alex@demo.grid'),
  ('00000000-0000-0000-0000-000000000002', 'Jordan Patel', 'jordan@demo.grid'),
  ('00000000-0000-0000-0000-000000000003', 'Taylor Garcia', 'taylor@demo.grid')
ON CONFLICT (id) DO NOTHING;

-- Create demo agents
INSERT INTO public.agents (id, user_id, name, api_key, platform, status) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'DealCloser', 'grid_demo_001', 'openclaw', 'connected'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'RevenueEngine', 'grid_demo_002', 'openclaw', 'connected'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'TaskMaster 3000', 'grid_demo_003', 'openclaw', 'connected')
ON CONFLICT DO NOTHING;

-- Create demo stats
INSERT INTO public.agent_stats (agent_id, tasks_completed, simple_tasks, medium_tasks, complex_tasks, epic_tasks, current_streak, total_score) VALUES
  ('10000000-0000-0000-0000-000000000001', 312, 150, 100, 50, 12, 45, 945),
  ('10000000-0000-0000-0000-000000000002', 285, 130, 95, 45, 15, 38, 892),
  ('10000000-0000-0000-0000-000000000003', 268, 140, 85, 35, 8, 32, 856)
ON CONFLICT DO NOTHING;
*/
