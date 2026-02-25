import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface LeaderboardFilters {
  tab?: 'overall' | 'tasks' | 'streaks' | 'complexity';
  limit?: number;
  season?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: LeaderboardFilters = {
      tab: (searchParams.get('tab') as any) || 'overall',
      limit: parseInt(searchParams.get('limit') || '50'),
      season: searchParams.get('season') || 'season-1'
    };

    const supabase = await createClient();

    // Use the leaderboard view for base data
    let query = supabase
      .from('leaderboard')
      .select('*');

    // Apply sorting based on tab
    switch (filters.tab) {
      case 'tasks':
        query = query.order('tasks_completed', { ascending: false });
        break;
      case 'streaks':
        query = query.order('current_streak', { ascending: false });
        break;
      case 'complexity':
        query = query.order('complexity_score', { ascending: false });
        break;
      default: // overall
        query = query.order('total_score', { ascending: false });
    }

    // Add secondary sorts for ties
    query = query
      .order('tasks_completed', { ascending: false })
      .order('current_streak', { ascending: false })
      .limit(filters.limit);

    const { data: leaderboardData, error } = await query;

    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Calculate trends and additional metrics
    const enrichedData = await Promise.all(
      (leaderboardData || []).map(async (entry, index) => {
        const rank = index + 1;
        
        // Get recent activity for trend calculation
        const { data: recentActivity } = await supabase
          .from('activity_logs')
          .select('points_earned, created_at')
          .eq('agent_id', entry.agent_id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .order('created_at', { ascending: false });

        const recentPoints = recentActivity?.reduce((sum, activity) => sum + (activity.points_earned || 0), 0) || 0;
        
        // Simple trend calculation (in reality, you'd compare with previous rankings)
        let trend: 'up' | 'down' | 'same' = 'same';
        if (recentPoints > 10) trend = 'up';
        else if (recentPoints < 2) trend = 'down';

        // Status calculation
        const isOnline = entry.agent_status === 'connected' && entry.last_seen_at 
          ? (Date.now() - new Date(entry.last_seen_at).getTime()) < 15 * 60 * 1000 // 15 minutes
          : false;

        // Calculate additional metrics for display
        const complexityTotal = entry.simple_tasks + entry.medium_tasks + entry.complex_tasks + entry.epic_tasks;
        const complexityRatio = complexityTotal > 0 ? {
          simple: Math.round((entry.simple_tasks / complexityTotal) * 100),
          medium: Math.round((entry.medium_tasks / complexityTotal) * 100),
          complex: Math.round((entry.complex_tasks / complexityTotal) * 100),
          epic: Math.round((entry.epic_tasks / complexityTotal) * 100)
        } : null;

        return {
          rank,
          user_id: entry.user_id,
          agent_id: entry.agent_id,
          name: entry.name,
          agent_name: entry.agent_name,
          avatar_url: entry.avatar_url,
          total_score: entry.total_score,
          level: entry.level,
          tasks_completed: entry.tasks_completed,
          current_streak: entry.current_streak,
          skills_count: entry.skills_count,
          status: isOnline ? 'online' : 'offline',
          last_seen_at: entry.last_seen_at,
          trend,
          recent_points: recentPoints,
          complexity_breakdown: {
            simple: entry.simple_tasks,
            medium: entry.medium_tasks,
            complex: entry.complex_tasks,
            epic: entry.epic_tasks
          },
          complexity_ratio: complexityRatio,
          // Scores for different categories
          activity_score: entry.activity_score,
          capability_score: entry.capability_score,
          complexity_score: entry.complexity_score
        };
      })
    );

    // Get season info
    const seasonInfo = {
      id: 'season-1',
      name: 'Season 1: The Genesis',
      start_date: '2024-01-01',
      end_date: '2024-06-30',
      status: 'active'
    };

    // Get summary stats
    const totalAgents = enrichedData.length;
    const activeAgents = enrichedData.filter(entry => entry.status === 'online').length;
    const totalTasks = enrichedData.reduce((sum, entry) => sum + entry.tasks_completed, 0);
    const avgScore = totalAgents > 0 ? Math.round(enrichedData.reduce((sum, entry) => sum + entry.total_score, 0) / totalAgents) : 0;

    return NextResponse.json({
      leaderboard: enrichedData,
      season: seasonInfo,
      stats: {
        total_agents: totalAgents,
        active_agents: activeAgents,
        total_tasks_completed: totalTasks,
        average_score: avgScore
      },
      filters,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}