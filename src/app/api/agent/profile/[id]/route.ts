import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const supabase = await createClient();

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

    // Get user achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', agent.user_id);

    // Calculate level
    const totalScore = stats?.total_score || 0;
    let level = 'Apprentice';
    if (totalScore >= 5000) level = 'Legend';
    else if (totalScore >= 2500) level = 'Architect';
    else if (totalScore >= 1000) level = 'Creator';
    else if (totalScore >= 500) level = 'Builder';

    // Build radar chart data
    const radarData = {
      activity: Math.min((stats?.activity_score || 0) / 10, 100),
      capability: Math.min((skills?.length || 0) * 10, 100),
      complexity: Math.min((stats?.complexity_score || 0) / 50, 100),
      memory: Math.min((stats?.memory_strength || 0), 100),
      proactivity: Math.min((stats?.proactivity_score || 0), 100),
      integration: Math.min((integrations?.length || 0) * 15, 100)
    };

    // Get complexity distribution
    const complexityDistribution = {
      simple: stats?.simple_tasks || 0,
      medium: stats?.medium_tasks || 0,
      complex: stats?.complex_tasks || 0,
      epic: stats?.epic_tasks || 0
    };

    // Calculate streaks and status
    const isOnline = agent.status === 'connected' && agent.last_seen_at 
      ? (Date.now() - new Date(agent.last_seen_at).getTime()) < 15 * 60 * 1000 // 15 minutes
      : false;

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        platform: agent.platform,
        model: agent.model,
        status: isOnline ? 'online' : 'offline',
        last_seen_at: agent.last_seen_at,
        created_at: agent.created_at
      },
      profile: agent.profiles,
      stats: {
        total_score: totalScore,
        level,
        tasks_completed: stats?.tasks_completed || 0,
        current_streak: stats?.current_streak || 0,
        longest_streak: stats?.longest_streak || 0,
        sessions_count: stats?.sessions_count || 0,
        total_session_duration: stats?.total_session_duration || 0,
        uptime_percentage: stats?.uptime_percentage || 0
      },
      radar_data: radarData,
      complexity_distribution: complexityDistribution,
      skills: (skills || []).map(skill => ({
        name: skill.name,
        category: skill.category,
        icon: skill.icon,
        description: skill.description,
        installed_at: skill.installed_at
      })),
      integrations: (integrations || []).map(integration => ({
        name: integration.name,
        connected_at: integration.connected_at
      })),
      memory: memory ? {
        total_memories: memory.total_memories,
        memory_depth_days: memory.memory_depth_days,
        categories: memory.categories,
        last_memory_at: memory.last_memory_at
      } : {
        total_memories: 0,
        memory_depth_days: 0,
        categories: {},
        last_memory_at: null
      },
      achievements: (userAchievements || []).map(ua => ({
        id: ua.achievements.id,
        name: ua.achievements.name,
        description: ua.achievements.description,
        icon: ua.achievements.icon,
        category: ua.achievements.category,
        unlocked_at: ua.unlocked_at
      })),
      recent_activities: (activities || []).map(activity => ({
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