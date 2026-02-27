import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { avatarEmoji } = await request.json();

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

    // Update the agent's connection_config with the avatar emoji
    const updatedConfig = {
      ...(agent as any).connection_config,
      avatar_emoji: avatarEmoji || null
    };

    const { data, error } = await adminSupabase
      .from('agents')
      // @ts-ignore - Supabase type inference issue
      .update({ 
        connection_config: updatedConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', (agent as any).id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent avatar:', error);
      return NextResponse.json(
        { error: 'Failed to update avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      agent: data,
      avatarEmoji: updatedConfig.avatar_emoji
    });

  } catch (error) {
    console.error('Agent avatar update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}