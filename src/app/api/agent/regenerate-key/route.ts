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

    // Generate new API key using Supabase function (requires admin client)
    const adminSupabase = createAdminClient();
    const { data: newApiKey, error: keyError } = await adminSupabase
      .rpc('generate_api_key');

    if (keyError) {
      console.error('Error generating API key:', keyError);
      return NextResponse.json(
        { error: 'Failed to generate new API key' },
        { status: 500 }
      );
    }

    // Update the agent with the new API key
    const { data, error } = await adminSupabase
      .from('agents')
      // @ts-ignore - Supabase type inference issue
      .update({ 
        api_key: newApiKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', (agent as any).id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent with new API key:', error);
      return NextResponse.json(
        { error: 'Failed to update agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'API key regenerated successfully',
      // Don't return the full key in the response for security
      keyPreview: newApiKey.substring(0, 12) + '...'
    });

  } catch (error) {
    console.error('API key regeneration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}