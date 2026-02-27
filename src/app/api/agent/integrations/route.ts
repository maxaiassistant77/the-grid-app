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

interface IntegrationsUpdate {
  integrations: {
    name: string;
    connected: boolean;
    config?: any;
  }[];
  remove_unlisted?: boolean; // Whether to remove integrations not in this list
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

    const body: IntegrationsUpdate = await request.json();
    const supabase = createAdminClient();

    if (!body.integrations || !Array.isArray(body.integrations)) {
      return NextResponse.json(
        { error: 'Invalid integrations data' },
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

    // If remove_unlisted is true, delete existing integrations not in the new list
    if (body.remove_unlisted) {
      const integrationNames = body.integrations.map(i => i.name);
      
      if (integrationNames.length > 0) {
        await supabase
          .from('agent_integrations')
          .delete()
          .eq('agent_id', agent.id)
          .not('name', 'in', `(${integrationNames.join(',')})`);
      }
    }

    // Upsert integrations
    const integrationsToUpsert = body.integrations.map(integration => ({
      agent_id: agent.id,
      name: integration.name,
      connected: integration.connected,
      config: integration.config || {},
      connected_at: integration.connected ? new Date().toISOString() : null
    }));

    if (integrationsToUpsert.length > 0) {
      await supabase
        .from('agent_integrations')
        // @ts-ignore - Supabase type inference issue
        .upsert(integrationsToUpsert, {
          onConflict: 'agent_id,name'
        });
    }

    // Update integration depth score based on connected integrations
    const { data: connectedCount } = await supabase
      .from('agent_integrations')
      .select('id', { count: 'exact' })
      .eq('agent_id', agent.id)
      .eq('connected', true);

    const integrationDepth = Math.min((connectedCount?.length || 0) * 10, 100);

    await supabase
      .from('agent_stats')
      // @ts-ignore - Supabase type inference issue
      .upsert({
        agent_id: agent.id,
        integration_depth: integrationDepth,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'agent_id'
      });

    // Get updated integrations
    const { data: updatedIntegrations } = await supabase
      .from('agent_integrations')
      .select('*')
      .eq('agent_id', agent.id)
      .order('connected_at', { ascending: false });

    return NextResponse.json({
      success: true,
      agent_id: agent.id,
      integrations_count: connectedCount?.length || 0,
      integration_depth: integrationDepth,
      integrations: updatedIntegrations || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Integrations update error:', error);
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

    const supabase = createAdminClient();

    const { data: integrations } = await supabase
      .from('agent_integrations')
      .select('*')
      .eq('agent_id', agent.id)
      .order('connected_at', { ascending: false });

    return NextResponse.json({
      agent_id: agent.id,
      integrations: integrations || [],
      integrations_count: integrations?.length || 0
    });

  } catch (error) {
    console.error('Integrations fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}