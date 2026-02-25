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

interface MemoryUpdate {
  total_memories: number;
  memory_depth_days?: number;
  categories?: {
    [category: string]: number;
  };
  last_memory_at?: string;
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

    const body: MemoryUpdate = await request.json();
    const supabase = await createClient();

    if (typeof body.total_memories !== 'number' || body.total_memories < 0) {
      return NextResponse.json(
        { error: 'Invalid total_memories value' },
        { status: 400 }
      );
    }

    // Update agent last seen
    await supabase
      .from('agents')
      // @ts-ignore - Supabase type inference issue
      .update({
        last_seen_at: new Date().toISOString()
      })
      .eq('id', agent.id);

    // Upsert memory data
    const memoryData = {
      agent_id: agent.id,
      total_memories: body.total_memories,
      memory_depth_days: body.memory_depth_days || 0,
      last_memory_at: body.last_memory_at || new Date().toISOString(),
      categories: body.categories || {},
      updated_at: new Date().toISOString()
    };

    await supabase
      .from('agent_memory')
      // @ts-ignore - Supabase type inference issue
      .upsert(memoryData, {
        onConflict: 'agent_id'
      });

    // Calculate memory strength score
    let memoryStrength = 0;
    
    // Base score from total memories
    memoryStrength += Math.min(body.total_memories * 0.1, 50);
    
    // Bonus for memory depth (how far back memories go)
    if (body.memory_depth_days) {
      memoryStrength += Math.min(body.memory_depth_days * 0.05, 25);
    }
    
    // Bonus for category diversity
    const categoryCount = Object.keys(body.categories || {}).length;
    memoryStrength += Math.min(categoryCount * 2, 20);
    
    // Bonus for recent activity
    if (body.last_memory_at) {
      const lastMemoryDate = new Date(body.last_memory_at);
      const daysSinceLastMemory = Math.floor(
        (Date.now() - lastMemoryDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastMemory <= 1) {
        memoryStrength += 5;
      }
    }

    // Update quality score in agent stats
    await supabase
      .from('agent_stats')
      // @ts-ignore - Supabase type inference issue
      .upsert({
        agent_id: agent.id,
        memory_strength: Math.round(memoryStrength),
        quality_score: Math.round(memoryStrength), // Simplified - would include other quality metrics
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'agent_id'
      });

    // Get updated memory data
    const { data: updatedMemory } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agent.id)
      .single();

    return NextResponse.json({
      success: true,
      agent_id: agent.id,
      memory: updatedMemory,
      memory_strength: Math.round(memoryStrength),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Memory update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const supabase = await createClient();

    const { data: memory } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agent.id)
      .single();

    return NextResponse.json({
      agent_id: agent.id,
      memory: memory || {
        total_memories: 0,
        memory_depth_days: 0,
        categories: {},
        last_memory_at: null
      }
    });

  } catch (error) {
    console.error('Memory fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}