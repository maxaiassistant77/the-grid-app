import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
  const agentIdParam = request.nextUrl.searchParams.get('agent_id');

  // Auth via Bearer token (agent API key)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.replace('Bearer ', '');
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('api_key', apiKey)
      .single();
    if (!agent) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    const agentId = agentIdParam || agent.id;
    const { data: history } = await supabase
      .from('agent_daily_stats')
      .select('*')
      .eq('agent_id', agentId)
      .order('date', { ascending: true })
      .limit(days);
    return NextResponse.json({ history: history || [], agent_id: agentId, days });
  }

  // Auth via session cookie (browser profile page)
  const browserSupabase = await createClient();
  const { data: { user } } = await browserSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the agent for this user (or use provided agent_id if it belongs to user)
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const agentId = agentIdParam || agent.id;
  
  const { data: history } = await supabase
    .from('agent_daily_stats')
    .select('*')
    .eq('agent_id', agentId)
    .order('date', { ascending: true })
    .limit(days);

  return NextResponse.json({ history: history || [], agent_id: agentId, days });
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
