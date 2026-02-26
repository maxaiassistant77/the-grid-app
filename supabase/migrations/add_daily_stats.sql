-- Add agent_daily_stats table for tracking performance over time
CREATE TABLE IF NOT EXISTS public.agent_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_score INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  skills_count INTEGER DEFAULT 0,
  memory_count INTEGER DEFAULT 0,
  activity_score INTEGER DEFAULT 0,
  capability_score INTEGER DEFAULT 0,
  complexity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_daily_stats_agent_id ON public.agent_daily_stats(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_daily_stats_date ON public.agent_daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_agent_daily_stats_agent_date ON public.agent_daily_stats(agent_id, date);