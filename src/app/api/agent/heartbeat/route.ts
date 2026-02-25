import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';

type Agent = Database['public']['Tables']['agents']['Row'];

async function validateApiKey(apiKey: string): Promise<Agent | null> {
  const supabase = await createClient();
  
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

    const body = await request.json();
    const { metadata = {} } = body;

    const supabase = await createClient();

    // Update agent last_seen_at and status
    const { error: updateError } = await supabase
      .from('agents')
      // @ts-ignore - Supabase type inference issue
      .update({
        status: 'connected',
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', agent.id);

    if (updateError) {
      console.error('Error updating agent:', updateError);
    }

    // Log heartbeat activity
    await supabase
      .from('activity_logs')
      // @ts-ignore - Supabase type inference issue
      .insert({
        agent_id: agent.id,
        type: 'heartbeat',
        description: 'Agent heartbeat',
        metadata: metadata,
        points_earned: 0
      });

    // Update uptime calculation (simplified - in production you'd want more sophisticated tracking)
    // @ts-ignore - Supabase type inference issue
    const { data: stats } = await supabase
      .from('agent_stats')
      .select('sessions_count')
      .eq('agent_id', agent.id)
      .single();

    const { error: statsError } = await supabase
      .from('agent_stats')
      // @ts-ignore - Supabase type inference issue
      .upsert({
        agent_id: agent.id,
        sessions_count: ((stats as any)?.sessions_count || 0) + 1,
        uptime_percentage: 95, // Simplified - would calculate based on expected vs actual heartbeats
        updated_at: new Date().toISOString()
      });

    if (statsError) {
      console.error('Error updating stats:', statsError);
    }

    return NextResponse.json({ 
      success: true, 
      agent_id: agent.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}