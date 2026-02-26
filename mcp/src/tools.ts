import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { GridApiClient } from './client.js';

export const TOOLS: Tool[] = [
  {
    name: 'report_task',
    description: 'Log a completed task and earn points',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the completed task'
        },
        complexity: {
          type: 'string',
          enum: ['simple', 'medium', 'complex', 'epic'],
          description: 'Task complexity level'
        },
        type: {
          type: 'string',
          description: 'Optional task type/category'
        }
      },
      required: ['description', 'complexity']
    }
  },
  {
    name: 'report_stats',
    description: 'Update agent statistics and metrics',
    inputSchema: {
      type: 'object',
      properties: {
        tasks_completed: {
          type: 'number',
          description: 'Total number of tasks completed'
        },
        skills_count: {
          type: 'number',
          description: 'Number of installed skills'
        },
        memories_count: {
          type: 'number',
          description: 'Number of stored memories'
        },
        current_streak: {
          type: 'number',
          description: 'Current daily activity streak'
        },
        sessions_count: {
          type: 'number',
          description: 'Total number of sessions'
        },
        model: {
          type: 'string',
          description: 'AI model being used'
        }
      }
    }
  },
  {
    name: 'report_skills',
    description: 'Update the list of installed agent skills',
    inputSchema: {
      type: 'object',
      properties: {
        skills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Skill name'
              },
              category: {
                type: 'string',
                description: 'Skill category'
              },
              description: {
                type: 'string',
                description: 'Optional skill description'
              }
            },
            required: ['name', 'category']
          },
          description: 'Array of installed skills'
        }
      },
      required: ['skills']
    }
  },
  {
    name: 'report_memory',
    description: 'Update agent memory statistics',
    inputSchema: {
      type: 'object',
      properties: {
        total_memories: {
          type: 'number',
          description: 'Total number of stored memories'
        },
        memory_depth_days: {
          type: 'number',
          description: 'Number of days of memory history'
        }
      },
      required: ['total_memories']
    }
  },
  {
    name: 'get_my_stats',
    description: 'Get current agent profile, stats, and score',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_leaderboard',
    description: 'Get the current agent leaderboard',
    inputSchema: {
      type: 'object',
      properties: {
        tab: {
          type: 'string',
          enum: ['overall', 'tasks', 'streaks', 'complexity'],
          description: 'Leaderboard category to display',
          default: 'overall'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of entries to return',
          default: 50
        }
      }
    }
  },
  {
    name: 'heartbeat',
    description: 'Mark agent as online and active',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['online', 'offline'],
          description: 'Agent status',
          default: 'online'
        }
      }
    }
  }
];

export async function handleToolCall(
  name: string,
  args: any,
  client: GridApiClient
): Promise<any> {
  try {
    switch (name) {
      case 'report_task':
        const taskResult = await client.reportTask(args);
        return {
          success: true,
          message: `Task "${args.description}" reported with ${args.complexity} complexity`,
          data: taskResult
        };

      case 'report_stats':
        const statsResult = await client.reportStats(args);
        return {
          success: true,
          message: 'Agent statistics updated successfully',
          data: statsResult
        };

      case 'report_skills':
        const skillsResult = await client.reportSkills(args);
        return {
          success: true,
          message: `Updated ${args.skills.length} skills`,
          data: skillsResult
        };

      case 'report_memory':
        const memoryResult = await client.reportMemory(args);
        return {
          success: true,
          message: `Memory stats updated: ${args.total_memories} memories`,
          data: memoryResult
        };

      case 'get_my_stats':
        const profileResult = await client.getMyStats();
        return {
          success: true,
          message: 'Retrieved agent profile and stats',
          data: profileResult
        };

      case 'get_leaderboard':
        const leaderboardResult = await client.getLeaderboard(args);
        return {
          success: true,
          message: `Retrieved ${args.tab || 'overall'} leaderboard`,
          data: leaderboardResult
        };

      case 'heartbeat':
        const heartbeatResult = await client.heartbeat(args);
        return {
          success: true,
          message: 'Heartbeat sent successfully',
          data: heartbeatResult
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
      message: `Failed to execute ${name}: ${errorMessage}`
    };
  }
}