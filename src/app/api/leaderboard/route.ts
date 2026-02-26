import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const supabase = createAdminClient();

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
      .limit(filters.limit || 50);

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
          .eq('agent_id', (entry as any).agent_id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .order('created_at', { ascending: false });

        const recentPoints = recentActivity?.reduce((sum, activity: any) => sum + (activity.points_earned || 0), 0) || 0;
        
        // Simple trend calculation (in reality, you'd compare with previous rankings)
        let trend: 'up' | 'down' | 'same' = 'same';
        if (recentPoints > 10) trend = 'up';
        else if (recentPoints < 2) trend = 'down';

        // Status calculation
        const isOnline = (entry as any).agent_status === 'connected' && (entry as any).last_seen_at 
          ? (Date.now() - new Date((entry as any).last_seen_at).getTime()) < 15 * 60 * 1000 // 15 minutes
          : false;

        // Calculate additional metrics for display
        const complexityTotal = (entry as any).simple_tasks + (entry as any).medium_tasks + (entry as any).complex_tasks + (entry as any).epic_tasks;
        const complexityRatio = complexityTotal > 0 ? {
          simple: Math.round(((entry as any).simple_tasks / complexityTotal) * 100),
          medium: Math.round(((entry as any).medium_tasks / complexityTotal) * 100),
          complex: Math.round(((entry as any).complex_tasks / complexityTotal) * 100),
          epic: Math.round(((entry as any).epic_tasks / complexityTotal) * 100)
        } : null;

        return {
          rank,
          user_id: (entry as any).user_id,
          agent_id: (entry as any).agent_id,
          name: (entry as any).name,
          agent_name: (entry as any).agent_name,
          avatar_url: (entry as any).avatar_url,
          total_score: (entry as any).total_score,
          level: (entry as any).level,
          tasks_completed: (entry as any).tasks_completed,
          current_streak: (entry as any).current_streak,
          skills_count: (entry as any).skills_count,
          status: isOnline ? 'online' : 'offline',
          last_seen_at: (entry as any).last_seen_at,
          trend,
          recent_points: recentPoints,
          complexity_breakdown: {
            simple: (entry as any).simple_tasks,
            medium: (entry as any).medium_tasks,
            complex: (entry as any).complex_tasks,
            epic: (entry as any).epic_tasks
          },
          complexity_ratio: complexityRatio,
          // Scores for different categories
          activity_score: (entry as any).activity_score,
          capability_score: (entry as any).capability_score,
          complexity_score: (entry as any).complexity_score
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