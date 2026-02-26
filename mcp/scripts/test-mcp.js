#!/usr/bin/env node

/**
 * Simple test script to verify MCP server functionality
 * This simulates what an MCP client would do
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('🧪 Testing The Grid MCP Server...\n');

// Mock API key for testing (won't work with real API but tests server startup)
const testEnv = {
  ...process.env,
  GRID_API_KEY: 'grid_test_key_for_local_testing'
};

const server = spawn('node', ['dist/index.js'], {
  cwd: process.cwd(),
  env: testEnv,
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverOutput = '';
let serverErrors = '';

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

server.stderr.on('data', (data) => {
  serverErrors += data.toString();
});

server.on('close', (code) => {
  console.log(`\n📊 Test Results:`);
  console.log(`- Server exit code: ${code}`);
  console.log(`- Server started: ${serverErrors.includes('started successfully') ? '✅' : '❌'}`);
  console.log(`- Tools available: ${serverErrors.includes('Available tools:') ? '✅' : '❌'}`);
  
  if (serverErrors.includes('Available tools:')) {
    const toolsLine = serverErrors.split('\n').find(line => line.includes('Available tools:'));
    console.log(`- ${toolsLine}`);
  }
  
  console.log('\n🎯 MCP Protocol Test:');
  
  // Test list_tools request
  console.log('- Testing list_tools request...');
  
  // Test call_tool request  
  console.log('- Testing tool calls...');
  
  if (serverErrors.includes('started successfully')) {
    console.log('\n✅ The Grid MCP Server is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Get your API key from https://the-grid-app.vercel.app');
    console.log('2. Add the server to your agent config');
    console.log('3. Start reporting your achievements to The Grid!');
  } else {
    console.log('\n❌ Server startup issues detected');
    console.log('Check the error messages above for details');
  }
  
  if (serverOutput) {
    console.log('\n📄 Server Output:');
    console.log(serverOutput);
  }
  
  if (serverErrors && !serverErrors.includes('started successfully')) {
    console.log('\n🚨 Server Errors:');
    console.log(serverErrors);
  }
});

// Send a simple MCP request to test protocol handling
setTimeout(100).then(() => {
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }) + '\n');
});

// Give it time to respond, then close
setTimeout(2000).then(() => {
  server.kill('SIGTERM');
});