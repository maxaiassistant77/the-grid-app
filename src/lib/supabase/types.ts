export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          user_id: string
          name: string
          api_key: string
          platform: string
          model: string | null
          status: string
          last_seen_at: string | null
          connection_config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          api_key: string
          platform?: string
          model?: string | null
          status?: string
          last_seen_at?: string | null
          connection_config?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          api_key?: string
          platform?: string
          model?: string | null
          status?: string
          last_seen_at?: string | null
          connection_config?: any
          created_at?: string
          updated_at?: string
        }
      }
      agent_stats: {
        Row: {
          id: string
          agent_id: string
          tasks_completed: number
          sessions_count: number
          total_session_duration: number
          tools_used: number
          subagents_spawned: number
          uptime_percentage: number
          simple_tasks: number
          medium_tasks: number
          complex_tasks: number
          epic_tasks: number
          memory_strength: number
          proactivity_score: number
          integration_depth: number
          current_streak: number
          longest_streak: number
          last_active_date: string | null
          total_score: number
          activity_score: number
          capability_score: number
          complexity_score: number
          quality_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          tasks_completed?: number
          sessions_count?: number
          total_session_duration?: number
          tools_used?: number
          subagents_spawned?: number
          uptime_percentage?: number
          simple_tasks?: number
          medium_tasks?: number
          complex_tasks?: number
          epic_tasks?: number
          memory_strength?: number
          proactivity_score?: number
          integration_depth?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string | null
          total_score?: number
          activity_score?: number
          capability_score?: number
          complexity_score?: number
          quality_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          tasks_completed?: number
          sessions_count?: number
          total_session_duration?: number
          tools_used?: number
          subagents_spawned?: number
          uptime_percentage?: number
          simple_tasks?: number
          medium_tasks?: number
          complex_tasks?: number
          epic_tasks?: number
          memory_strength?: number
          proactivity_score?: number
          integration_depth?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string | null
          total_score?: number
          activity_score?: number
          capability_score?: number
          complexity_score?: number
          quality_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      agent_skills: {
        Row: {
          id: string
          agent_id: string
          name: string
          category: string
          icon: string | null
          description: string | null
          enabled: boolean
          installed_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          name: string
          category: string
          icon?: string | null
          description?: string | null
          enabled?: boolean
          installed_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          name?: string
          category?: string
          icon?: string | null
          description?: string | null
          enabled?: boolean
          installed_at?: string
        }
      }
      agent_integrations: {
        Row: {
          id: string
          agent_id: string
          name: string
          connected: boolean
          config: any
          connected_at: string | null
        }
        Insert: {
          id?: string
          agent_id: string
          name: string
          connected?: boolean
          config?: any
          connected_at?: string | null
        }
        Update: {
          id?: string
          agent_id?: string
          name?: string
          connected?: boolean
          config?: any
          connected_at?: string | null
        }
      }
      agent_memory: {
        Row: {
          id: string
          agent_id: string
          total_memories: number
          memory_depth_days: number
          last_memory_at: string | null
          categories: any
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          total_memories?: number
          memory_depth_days?: number
          last_memory_at?: string | null
          categories?: any
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          total_memories?: number
          memory_depth_days?: number
          last_memory_at?: string | null
          categories?: any
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          agent_id: string
          type: string
          complexity: string | null
          description: string | null
          metadata: any
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          type: string
          complexity?: string | null
          description?: string | null
          metadata?: any
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          type?: string
          complexity?: string | null
          description?: string | null
          metadata?: any
          points_earned?: number
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          requirement_value: number
          points: number
        }
        Insert: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          requirement_value?: number
          points?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: string
          requirement_value?: number
          points?: number
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          user_id: string
          name: string
          avatar_url: string | null
          agent_id: string | null
          agent_name: string | null
          agent_status: string | null
          total_score: number
          tasks_completed: number
          current_streak: number
          activity_score: number
          capability_score: number
          complexity_score: number
          simple_tasks: number
          medium_tasks: number
          complex_tasks: number
          epic_tasks: number
          last_seen_at: string | null
          skills_count: number
          level: string
        }
      }
    }
    Functions: {
      generate_api_key: {
        Args: {}
        Returns: string
      }
      update_agent_stats: {
        Args: {
          p_agent_id: string
          p_tasks_completed?: number
          p_simple?: number
          p_medium?: number
          p_complex?: number
          p_epic?: number
        }
        Returns: void
      }
      get_level: {
        Args: {
          score: number
        }
        Returns: string
      }
    }
  }
}