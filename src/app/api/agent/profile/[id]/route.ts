import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const supabase = createAdminClient();

    // Get agent with user profile
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get agent stats
    const { data: stats } = await supabase
      .from('agent_stats')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    // Get agent skills
    const { data: skills } = await supabase
      .from('agent_skills')
      .select('*')
      .eq('agent_id', agentId)
      .eq('enabled', true)
      .order('installed_at', { ascending: false });

    // Get agent integrations
    const { data: integrations } = await supabase
      .from('agent_integrations')
      .select('*')
      .eq('agent_id', agentId)
      .eq('connected', true);

    // Get agent memory
    const { data: memory } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    // Get recent activity
    const { data: activities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get complexity distribution from activity_logs
    const { data: taskActivities } = await supabase
      .from('activity_logs')
      .select('complexity')
      .eq('agent_id', agentId)
      .eq('type', 'task');

    // Get user achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', (agent as any).user_id);

    // Calculate level
    const totalScore = (stats as any)?.total_score || 0;
    let level = 'Apprentice';
    if (totalScore >= 5000) level = 'Legend';
    else if (totalScore >= 2500) level = 'Architect';
    else if (totalScore >= 1000) level = 'Creator';
    else if (totalScore >= 500) level = 'Builder';

    // Build radar chart data with proper calculations
    const tasksCompleted = (stats as any)?.tasks_completed || 0;
    const skillsCount = skills?.length || 0;
    const totalMemories = memory?.total_memories || 0;
    const complexTasks = ((stats as any)?.complex_tasks || 0) + ((stats as any)?.epic_tasks || 0) * 2;
    const subagentsSpawned = (stats as any)?.subagents_spawned || 0;

    const radarData = {
      activity: Math.min((tasksCompleted / 500) * 100, 100),
      capability: Math.min((skillsCount / 50) * 100, 100), 
      complexity: tasksCompleted > 0 ? Math.min((complexTasks / (tasksCompleted + 1)) * 100, 100) : 0,
      memory: Math.min((totalMemories / 500) * 100, 100),
      proactivity: Math.min((subagentsSpawned / 50) * 100, 100),
      integration: Math.min((integrations?.length || 0) * 15, 100)
    };

    // Get complexity distribution from real activity_logs data
    const complexityDistribution = {
      simple: taskActivities?.filter(t => (t as any).complexity === 'simple').length || 0,
      medium: taskActivities?.filter(t => (t as any).complexity === 'medium').length || 0,
      complex: taskActivities?.filter(t => (t as any).complexity === 'complex').length || 0,
      epic: taskActivities?.filter(t => (t as any).complexity === 'epic').length || 0
    };

    // Calculate streaks and status
    const isOnline = (agent as any).status === 'connected' && (agent as any).last_seen_at 
      ? (Date.now() - new Date((agent as any).last_seen_at).getTime()) < 15 * 60 * 1000 // 15 minutes
      : false;

    return NextResponse.json({
      agent: {
        id: (agent as any).id,
        name: (agent as any).name,
        platform: (agent as any).platform,
        model: (agent as any).model,
        status: isOnline ? 'online' : 'offline',
        last_seen_at: (agent as any).last_seen_at,
        created_at: (agent as any).created_at
      },
      profile: (agent as any).profiles,
      stats: {
        total_score: totalScore,
        level,
        tasks_completed: (stats as any)?.tasks_completed || 0,
        current_streak: (stats as any)?.current_streak || 0,
        longest_streak: (stats as any)?.longest_streak || 0,
        sessions_count: (stats as any)?.sessions_count || 0,
        total_session_duration: (stats as any)?.total_session_duration || 0,
        uptime_percentage: (stats as any)?.uptime_percentage || 0
      },
      radar_data: radarData,
      complexity_distribution: complexityDistribution,
      skills: (skills || []).map((skill: any) => ({
        name: skill.name,
        category: skill.category,
        icon: skill.icon,
        description: skill.description,
        installed_at: skill.installed_at
      })),
      integrations: (integrations || []).map((integration: any) => ({
        name: integration.name,
        connected_at: integration.connected_at
      })),
      memory: memory ? {
        total_memories: (memory as any).total_memories,
        memory_depth_days: (memory as any).memory_depth_days,
        categories: (memory as any).categories,
        last_memory_at: (memory as any).last_memory_at
      } : {
        total_memories: 0,
        memory_depth_days: 0,
        categories: {},
        last_memory_at: null
      },
      achievements: (userAchievements || []).map((ua: any) => ({
        id: ua.achievements.id,
        name: ua.achievements.name,
        description: ua.achievements.description,
        icon: ua.achievements.icon,
        category: ua.achievements.category,
        unlocked_at: ua.unlocked_at
      })),
      recent_activities: (activities || []).map((activity: any) => ({
        type: activity.type,
        complexity: activity.complexity,
        description: activity.description,
        points_earned: activity.points_earned,
        created_at: activity.created_at
      }))
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}