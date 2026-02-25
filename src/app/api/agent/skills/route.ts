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

interface SkillUpdate {
  skills: {
    name: string;
    category: string;
    icon?: string;
    description?: string;
    enabled?: boolean;
  }[];
  remove_unlisted?: boolean; // Whether to remove skills not in this list
}

const SKILL_CATEGORIES = {
  productivity: 'Productivity',
  communication: 'Communication',
  development: 'Development',
  data: 'Data & Analytics',
  integration: 'Integration',
  automation: 'Automation',
  creative: 'Creative',
  other: 'Other'
};

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

    const body: SkillUpdate = await request.json();
    const supabase = await createClient();

    if (!body.skills || !Array.isArray(body.skills)) {
      return NextResponse.json(
        { error: 'Invalid skills data' },
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

    // If remove_unlisted is true, delete existing skills not in the new list
    if (body.remove_unlisted) {
      const skillNames = body.skills.map(s => s.name);
      
      if (skillNames.length > 0) {
        await supabase
          .from('agent_skills')
          .delete()
          .eq('agent_id', agent.id)
          .not('name', 'in', `(${skillNames.join(',')})`);
      }
    }

    // Upsert skills
    const skillsToUpsert = body.skills.map(skill => ({
      agent_id: agent.id,
      name: skill.name,
      category: skill.category in SKILL_CATEGORIES ? skill.category : 'other',
      icon: skill.icon || null,
      description: skill.description || null,
      enabled: skill.enabled !== false, // Default to true if not specified
      installed_at: new Date().toISOString()
    }));

    if (skillsToUpsert.length > 0) {
      await supabase
        .from('agent_skills')
        // @ts-ignore - Supabase type inference issue
        .upsert(skillsToUpsert, {
          onConflict: 'agent_id,name'
        });
    }

    // Update capability score based on skills
    const { data: skillCount } = await supabase
      .from('agent_skills')
      .select('id', { count: 'exact' })
      .eq('agent_id', agent.id)
      .eq('enabled', true);

    const capabilityScore = Math.min((skillCount?.length || 0) * 5, 100);

    await supabase
      .from('agent_stats')
      // @ts-ignore - Supabase type inference issue
      .upsert({
        agent_id: agent.id,
        capability_score: capabilityScore,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'agent_id'
      });

    // Check for skills achievements
    const achievements = await checkSkillAchievements(supabase, agent.user_id, skillCount?.length || 0);

    // Get updated skills
    const { data: updatedSkills } = await supabase
      .from('agent_skills')
      .select('*')
      .eq('agent_id', agent.id)
      .order('installed_at', { ascending: false });

    return NextResponse.json({
      success: true,
      agent_id: agent.id,
      skills_count: skillCount?.length || 0,
      capability_score: capabilityScore,
      skills: updatedSkills || [],
      new_achievements: achievements,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Skills update error:', error);
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

    const { data: skills } = await supabase
      .from('agent_skills')
      .select('*')
      .eq('agent_id', agent.id)
      .order('installed_at', { ascending: false });

    return NextResponse.json({
      agent_id: agent.id,
      skills: skills || [],
      skills_count: skills?.length || 0
    });

  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkSkillAchievements(supabase: any, userId: string, skillCount: number) {
  try {
    const newAchievements = [];

    // Check if user already has skills-5 achievement
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
      .eq('achievement_id', 'skills-5')
      .single();

    if (!existing && skillCount >= 5) {
      const { data: achievement } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', 'skills-5')
        .single();

      if (achievement) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: 'skills-5'
          });
        
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Skills achievement check error:', error);
    return [];
  }
}