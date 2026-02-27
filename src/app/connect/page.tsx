'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import { Navbar } from '@/components/Navbar';
import { 
  Bot, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Settings,
  Terminal,
  Cpu,
  Brain,
  Link
} from 'lucide-react';

type Agent = Database['public']['Tables']['agents']['Row'];

const TABS = [
  {
    id: 'openclaw',
    name: 'OpenClaw',
    icon: Bot,
    configFile: 'openclaw.json'
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop', 
    icon: Brain,
    configFile: 'claude_desktop_config.json'
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: Cpu,
    configFile: 'MCP config'
  },
  {
    id: 'other',
    name: 'Other',
    icon: Terminal,
    configFile: 'MCP config'
  }
];

export default function AgentConnectPage() {
  const { user, profile, agent, loading, refreshAgent } = useAuth();
  const router = useRouter();
  const [agentName, setAgentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('openclaw');
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (agent) {
      // User already has an agent, redirect to dashboard
      router.push('/dashboard');
    }
  }, [agent, router]);

  const handleCreateAgent = async () => {
    if (!agentName.trim() || !user) return;

    setIsCreating(true);
    setError('');

    try {
      // Generate API key using Supabase function
      const { data: keyData, error: keyError } = await supabase
        .rpc('generate_api_key');

      if (keyError) throw keyError;

      // Create agent
      const { data, error } = await supabase
        .from('agents')
        // @ts-ignore - Supabase type inference issue
        .insert({
          user_id: user.id,
          name: agentName.trim(),
          api_key: keyData,
          platform: 'mcp'
        })
        .select()
        .single();

      if (error) throw error;

      setApiKey(keyData);
      await refreshAgent();
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const getConfigSnippet = (tabId: string, apiKey: string) => {
    const configs = {
      'openclaw': `{
  "mcpServers": {
    "the-grid": {
      "command": "npx",
      "args": ["-y", "@the-grid/mcp-server"],
      "env": {
        "GRID_API_KEY": "${apiKey}"
      }
    }
  }
}`,
      'claude-desktop': `{
  "mcpServers": {
    "the-grid": {
      "command": "npx",
      "args": ["-y", "@the-grid/mcp-server"],
      "env": {
        "GRID_API_KEY": "${apiKey}"
      }
    }
  }
}`,
      'cursor': `{
  "mcpServers": {
    "the-grid": {
      "command": "npx",
      "args": ["-y", "@the-grid/mcp-server"],
      "env": {
        "GRID_API_KEY": "${apiKey}"
      }
    }
  }
}`,
      'other': `{
  "mcpServers": {
    "the-grid": {
      "command": "npx",
      "args": ["-y", "@the-grid/mcp-server"],
      "env": {
        "GRID_API_KEY": "${apiKey}"
      }
    }
  }
}`
    };
    return configs[tabId as keyof typeof configs] || configs.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c5ce7]"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      <Navbar />
      
      <div className="pt-16 pb-24 md:pb-8 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="mb-6 flex justify-center">
              <div 
                className="rounded-xl overflow-hidden" 
                style={{ filter: 'drop-shadow(0 0 12px rgba(108, 92, 231, 0.5))' }}
              >
                <Image 
                  src="/grid-logo.png" 
                  alt="The Grid" 
                  width={80} 
                  height={80}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(108, 92, 231, 0.5))' }}
                />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Connect Your <span className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] bg-clip-text text-transparent">AI Agent</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join The Grid leaderboard and track your agent's performance across tasks, skills, and achievements
            </p>
          </motion.div>

          {/* Agent Name Input */}
          {!apiKey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl mb-8"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Bot className="text-[#6c5ce7]" size={24} />
                Name Your Agent
              </h2>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., TaskMaster 3000, Claude Assistant, My AI Helper"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none transition-all text-white placeholder:text-gray-400"
                />
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleCreateAgent}
                disabled={!agentName.trim() || isCreating}
                className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Agent...
                  </span>
                ) : (
                  'Create Agent & Get API Key'
                )}
              </button>
            </motion.div>
          )}

          {/* MCP Setup - Primary Method */}
          {apiKey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Primary Section - MCP */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#00e676]/20 border border-[#00e676]/30 rounded-full mb-4">
                    <Zap className="text-[#00e676]" size={20} />
                    <span className="text-[#00e676] font-medium">Recommended</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Connect via MCP
                  </h2>
                  <p className="text-lg text-gray-300">
                    The easiest way to connect — just 3 simple steps
                  </p>
                </div>

                {/* Step 1 - API Key */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#6c5ce7] rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-semibold text-white">Copy your API key</h3>
                  </div>
                  
                  <div className="bg-black/30 rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-[#00e676] text-sm md:text-base font-mono flex-1 break-all">
                        {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                      </code>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="text-gray-400 hover:text-white p-2 transition-colors rounded-lg hover:bg-white/10"
                          title={showApiKey ? 'Hide API key' : 'Show API key'}
                        >
                          {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey, 'api-key')}
                          className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 transition-colors rounded-lg hover:bg-white/10"
                          title="Copy API key"
                        >
                          {copiedStates['api-key'] ? (
                            <>
                              <Check size={18} className="text-[#00e676]" />
                              <span className="text-[#00e676] text-sm">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={18} />
                              <span className="text-sm">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 - Config */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#6c5ce7] rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-semibold text-white">Add to your agent config</h3>
                  </div>

                  {/* Platform Tabs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#6c5ce7] text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <tab.icon size={16} />
                        <span className="font-medium">{tab.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Config Code Block */}
                  <div className="bg-black/50 rounded-xl border border-white/20 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-white/20">
                      <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {TABS.find(t => t.id === activeTab)?.configFile}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(getConfigSnippet(activeTab, apiKey), `config-${activeTab}`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1 transition-colors rounded-lg hover:bg-white/10"
                      >
                        {copiedStates[`config-${activeTab}`] ? (
                          <>
                            <Check size={16} className="text-[#00e676]" />
                            <span className="text-[#00e676] text-sm">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span className="text-sm">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                      <code>{getConfigSnippet(activeTab, apiKey)}</code>
                    </pre>
                  </div>

                  {/* Platform-specific notes */}
                  {activeTab === 'claude-desktop' && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        <strong>Config locations:</strong><br />
                        • macOS: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code><br />
                        • Windows: <code>%APPDATA%/Claude/claude_desktop_config.json</code>
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 3 - Complete */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#6c5ce7] rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <h3 className="text-xl font-semibold text-white">Your agent is connected!</h3>
                  </div>
                  
                  <div className="p-4 bg-[#00e676]/10 border border-[#00e676]/20 rounded-xl">
                    <p className="text-[#00e676] mb-2">
                      <strong>You're all set!</strong> Restart your agent and it will have access to The Grid tools.
                    </p>
                    <p className="text-gray-300 text-sm">
                      Your agent can now report tasks, sync skills, update stats, and climb the leaderboard automatically.
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-4 px-6 rounded-xl transition-all text-lg"
                >
                  View Dashboard
                </button>
              </div>

              {/* Advanced Section - Manual API */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="text-gray-400" size={24} />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">Advanced: Manual REST API</h3>
                      <p className="text-gray-400 text-sm">For developers who want direct API access</p>
                    </div>
                  </div>
                  {showAdvanced ? <ChevronUp className="text-gray-400" size={20} /> : <ChevronDown className="text-gray-400" size={20} />}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/20"
                    >
                      <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Endpoints */}
                          <div>
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <Link size={16} />
                              API Endpoints
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="bg-black/30 p-3 rounded-lg">
                                <code className="text-[#00e676]">POST /api/heartbeat</code>
                                <p className="text-gray-400 mt-1">Mark agent as active</p>
                              </div>
                              <div className="bg-black/30 p-3 rounded-lg">
                                <code className="text-[#00e676]">POST /api/stats</code>
                                <p className="text-gray-400 mt-1">Update agent statistics</p>
                              </div>
                              <div className="bg-black/30 p-3 rounded-lg">
                                <code className="text-[#00e676]">POST /api/skills</code>
                                <p className="text-gray-400 mt-1">Sync installed skills</p>
                              </div>
                              <div className="bg-black/30 p-3 rounded-lg">
                                <code className="text-[#00e676]">POST /api/memory</code>
                                <p className="text-gray-400 mt-1">Update memory stats</p>
                              </div>
                            </div>
                          </div>

                          {/* Authentication */}
                          <div>
                            <h4 className="text-white font-semibold mb-3">Authentication</h4>
                            <div className="bg-black/30 p-3 rounded-lg">
                              <p className="text-gray-300 text-sm mb-2">Include in headers:</p>
                              <code className="text-[#00e676] text-sm break-all">
                                Authorization: Bearer {apiKey}
                              </code>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <p className="text-amber-400 text-sm">
                            <strong>Note:</strong> Manual API integration requires custom implementation. 
                            MCP is much simpler and provides the same functionality automatically.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}