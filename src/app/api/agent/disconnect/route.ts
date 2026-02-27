import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user's agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Update the agent status to disconnected
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('agents')
      // @ts-ignore - Supabase type inference issue
      .update({ 
        status: 'disconnected',
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', (agent as any).id)
      .select()
      .single();

    if (error) {
      console.error('Error disconnecting agent:', error);
      return NextResponse.json(
        { error: 'Failed to disconnect agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Agent disconnected successfully',
      agent: data
    });

  } catch (error) {
    console.error('Agent disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}