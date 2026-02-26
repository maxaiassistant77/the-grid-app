import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  
  // Auth via Bearer token
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const apiKey = authHeader.replace('Bearer ', '');
  
  // Find agent by API key
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('api_key', apiKey)
    .single();
  
  if (!agent) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Also support query param for agent_id (for profile viewing)
  const agentId = request.nextUrl.searchParams.get('agent_id') || agent.id;
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
  
  const { data: history } = await supabase
    .from('agent_daily_stats')
    .select('*')
    .eq('agent_id', agentId)
    .order('date', { ascending: true })
    .limit(days);
  
  return NextResponse.json({
    history: history || [],
    agent_id: agentId,
    days,
  });
}

// Snapshot current stats for today
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const apiKey = authHeader.replace('Bearer ', '');
  
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('api_key', apiKey)
    .single();
  
  if (!agent) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Get current stats
  const { data: stats } = await supabase
    .from('agent_stats')
    .select('*')
    .eq('agent_id', agent.id)
    .single();

  // Get skills count
  const { count: skillsCount } = await supabase
    .from('agent_skills')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.id);

  // Get memory count
  const { data: memoryData } = await supabase
    .from('agent_memory')
    .select('total_memories')
    .eq('agent_id', agent.id)
    .single();

  const today = new Date().toISOString().split('T')[0];

  const { data: snapshot, error } = await supabase
    .from('agent_daily_stats')
    .upsert({
      agent_id: agent.id,
      date: today,
      total_score: stats?.total_score || 0,
      tasks_completed: stats?.tasks_completed || 0,
      current_streak: stats?.current_streak || 0,
      skills_count: skillsCount || 0,
      memory_count: memoryData?.total_memories || 0,
      activity_score: stats?.activity_score || 0,
      capability_score: stats?.capability_score || 0,
      complexity_score: stats?.complexity_score || 0,
    }, {
      onConflict: 'agent_id,date',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    snapshot,
  });
}
