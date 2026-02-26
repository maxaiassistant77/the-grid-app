#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { GridApiClient } from './client.js';
import { TOOLS, handleToolCall } from './tools.js';

class GridMCPServer {
  private server: Server;
  private client: GridApiClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: '@the-grid/mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.client) {
        const apiKey = process.env.GRID_API_KEY;
        if (!apiKey) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'GRID_API_KEY environment variable not set',
                message: 'Please configure your Grid API key in the MCP server environment variables'
              }, null, 2)
            }],
            isError: true,
          };
        }

        this.client = new GridApiClient({ 
          apiKey,
          baseUrl: process.env.GRID_API_BASE_URL 
        });
      }

      try {
        const result = await handleToolCall(name, args || {}, this.client);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }],
          isError: !result.success,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: errorMessage,
              message: `Failed to execute tool ${name}: ${errorMessage}`
            }, null, 2)
          }],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Log server info to stderr so it doesn't interfere with stdio protocol
    console.error('The Grid MCP Server started successfully');
    console.error('Available tools:', TOOLS.map(t => t.name).join(', '));
  }
}

// Start the server
const server = new GridMCPServer();
server.start().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});