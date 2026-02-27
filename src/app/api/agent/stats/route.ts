import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/lib/supabase/types';

type Agent = Database['public']['Tables']['agents']['Row'];

async function validateApiKey(apiKey: string): Promise<Agent | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

function determineComplexity(activity: any): string {
  const toolsCount = activity.tools_count || 0;
  const durationMinutes = activity.duration_minutes || 0;
  const hasSubagents = activity.type === 'subagent' || (activity.metadata && activity.metadata.subagents_spawned > 0);

  // Epic: 25+ tools OR any subagent spawned OR multi-hour autonomous work  
  if (hasSubagents || toolsCount >= 25 || durationMinutes >= 120) {
    return 'epic';
  }

  // Complex: 11-25 tools OR 30+ minute tasks
  if (toolsCount >= 11 || durationMinutes >= 30) {
    return 'complex';
  }

  // Medium: 4-10 tools OR 5+ minute tasks
  if (toolsCount >= 4 || durationMinutes >= 5) {
    return 'medium';
  }

  // Simple: 1-3 tools, <5 min
  return 'simple';
}

interface StatsUpdate {
  tasks_completed?: number;
  session_duration?: number; // minutes
  tools_used?: number;
  subagents_spawned?: number;
  complexity_breakdown?: {
    simple?: number;
    medium?: number;
    complex?: number;
    epic?: number;
  };
  activities?: {
    type: 'task' | 'session_start' | 'session_end' | 'tool_use' | 'subagent';
    complexity?: 'simple' | 'medium' | 'complex' | 'epic';
    description?: string;
    metadata?: any;
    tools_count?: number;
    duration_minutes?: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const agent = await validateApiKey(apiKey);

    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const body: StatsUpdate = await request.json();
    const supabase = createAdminClient();

    // Update agent status and last seen
    await supabase
      .from('agents')
      // @ts-ignore - Supabase type inference issue
      .update({
        status: 'connected',
        last_seen_at: new Date().toISOString()
      })
      .eq('id', agent.id);

    // Log activities
    if (body.activities) {
      const activityLogs = body.activities.map(activity => {
        // Auto-determine complexity if not provided, or if type is 'task'
        const complexity = (activity.type === 'task' && (activity.tools_count || activity.duration_minutes)) 
          ? determineComplexity(activity)
          : activity.complexity || 'simple';
        
        let points = 0;
        
        // Calculate points based on complexity
        if (activity.type === 'task') {
          switch (complexity) {
            case 'simple': points = 1; break;
            case 'medium': points = 3; break;
            case 'complex': points = 5; break;
            case 'epic': points = 10; break;
          }
        }

        return {
          agent_id: agent.id,
          type: activity.type,
          complexity: complexity,
          description: activity.description || null,
          metadata: {
            ...activity.metadata,
            tools_count: activity.tools_count,
            duration_minutes: activity.duration_minutes
          },
          points_earned: points
        };
      });

      await supabase
        .from('activity_logs')
        // @ts-ignore - Supabase type inference issue
        .insert(activityLogs);
    }

    // Update stats using the stored function
    if (body.tasks_completed || body.complexity_breakdown) {
      const breakdown = body.complexity_breakdown || {};
      
      await supabase
        // @ts-ignore - Supabase type inference issue
        .rpc('update_agent_stats', {
          p_agent_id: agent.id,
          p_tasks_completed: body.tasks_completed || 0,
          p_simple: breakdown.simple || 0,
          p_medium: breakdown.medium || 0,
          p_complex: breakdown.complex || 0,
          p_epic: breakdown.epic || 0
        });
    }

    // Update additional metrics
    const updateData: any = {
      agent_id: agent.id,
      updated_at: new Date().toISOString()
    };

    if (body.session_duration) {
      updateData.total_session_duration = body.session_duration;
    }
    if (body.tools_used) {
      updateData.tools_used = body.tools_used;
    }
    if (body.subagents_spawned) {
      updateData.subagents_spawned = body.subagents_spawned;
    }

    // Upsert agent stats
    await supabase
      .from('agent_stats')
      // @ts-ignore - Supabase type inference issue
      .upsert(updateData, { onConflict: 'agent_id' });

    // Calculate new scores and check achievements
    const { data: updatedStats } = await supabase
      .from('agent_stats')
      .select('*')
      .eq('agent_id', agent.id)
      .single();

    // Check for new achievements
    if (updatedStats) {
      const achievements = await checkAchievements(supabase, agent.user_id, updatedStats);
      
      return NextResponse.json({ 
        success: true, 
        agent_id: agent.id,
        stats: updatedStats,
        new_achievements: achievements,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      success: true, 
      agent_id: agent.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkAchievements(supabase: any, userId: string, stats: any) {
  try {
    // Get all achievements
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*');

    if (!allAchievements) return [];

    // Get user's current achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set(userAchievements?.map((ua: any) => ua.achievement_id) || []);
    const newAchievements = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      // Check achievement conditions
      switch (achievement.id) {
        case 'first-task':
          shouldUnlock = stats.tasks_completed >= 1;
          break;
        case 'tasks-10':
          shouldUnlock = stats.tasks_completed >= 10;
          break;
        case 'tasks-50':
          shouldUnlock = stats.tasks_completed >= 50;
          break;
        case 'tasks-100':
          shouldUnlock = stats.tasks_completed >= 100;
          break;
        case 'tasks-500':
          shouldUnlock = stats.tasks_completed >= 500;
          break;
        case 'streak-3':
          shouldUnlock = stats.current_streak >= 3;
          break;
        case 'streak-7':
          shouldUnlock = stats.current_streak >= 7;
          break;
        case 'streak-30':
          shouldUnlock = stats.current_streak >= 30;
          break;
        case 'streak-100':
          shouldUnlock = stats.current_streak >= 100;
          break;
        case 'score-100':
          shouldUnlock = stats.total_score >= 100;
          break;
        case 'score-500':
          shouldUnlock = stats.total_score >= 500;
          break;
        case 'score-1000':
          shouldUnlock = stats.total_score >= 1000;
          break;
        case 'score-5000':
          shouldUnlock = stats.total_score >= 5000;
          break;
        case 'complex-first':
          shouldUnlock = stats.complex_tasks >= 1;
          break;
        case 'epic-first':
          shouldUnlock = stats.epic_tasks >= 1;
          break;
      }

      if (shouldUnlock) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id
          });
        
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Achievement check error:', error);
    return [];
  }
}