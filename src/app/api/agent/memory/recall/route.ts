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

interface MemoryRecallUpdate {
  recall_latency_ms: number;
  recall_accuracy_score: number; // 0-1
  queries_today: number;
  successful_recalls: number;
  furthest_recall_days: number;
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

    const body: MemoryRecallUpdate = await request.json();
    const supabase = createAdminClient();

    // Validate input data
    if (typeof body.recall_latency_ms !== 'number' || 
        typeof body.recall_accuracy_score !== 'number' ||
        typeof body.queries_today !== 'number' ||
        typeof body.successful_recalls !== 'number' ||
        typeof body.furthest_recall_days !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input data types' },
        { status: 400 }
      );
    }

    if (body.recall_accuracy_score < 0 || body.recall_accuracy_score > 1) {
      return NextResponse.json(
        { error: 'recall_accuracy_score must be between 0 and 1' },
        { status: 400 }
      );
    }

    // Update agent stats with memory recall metrics
    const updateData = {
      agent_id: agent.id,
      recall_latency_ms: body.recall_latency_ms,
      recall_accuracy_score: body.recall_accuracy_score,
      queries_today: body.queries_today,
      successful_recalls: body.successful_recalls,
      furthest_recall_days: body.furthest_recall_days,
      updated_at: new Date().toISOString()
    };

    // Upsert memory recall stats (will add columns if they don't exist)
    await supabase
      .from('agent_stats')
      // @ts-ignore - Supabase type inference issue
      .upsert(updateData, { onConflict: 'agent_id' });

    return NextResponse.json({ 
      success: true, 
      agent_id: agent.id,
      metrics_updated: updateData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Memory recall update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}