'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import { Navbar } from '@/components/Navbar';

type Agent = Database['public']['Tables']['agents']['Row'];

const PLATFORMS = [
  {
    id: 'openclaw',
    name: 'OpenClaw',
    description: 'The ultimate AI assistant platform',
    icon: '🤖',
    status: 'active',
    setupInstructions: 'Add the API key to your OpenClaw agent configuration'
  },
  {
    id: 'claude_cowork',
    name: 'Claude Cowork',
    description: 'Coming soon - AI collaboration platform',
    icon: '🧠',
    status: 'coming-soon'
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Connect your own AI agent',
    icon: '⚙️',
    status: 'active',
    setupInstructions: 'Use our API endpoints to report agent activity'
  }
];

export default function AgentConnectPage() {
  const { user, profile, agent, loading, refreshAgent } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('openclaw');
  const [agentName, setAgentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error' | null>(null);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
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
          platform: selectedPlatform
        })
        .select()
        .single();

      if (error) throw error;

      setApiKey(keyData);
      await refreshAgent();
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('testing');

    // Simulate connection test (in reality, this would ping the agent)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, randomly succeed or fail
    const success = Math.random() > 0.3;
    setConnectionStatus(success ? 'success' : 'error');
    setIsTestingConnection(false);

    if (success) {
      // Update agent status to connected
      await supabase
        .from('agents')
        // @ts-ignore - Supabase type inference issue
        .update({ 
          status: 'connected',
          last_seen_at: new Date().toISOString()
        })
        .eq('api_key', apiKey);

      await refreshAgent();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
      
      <div className="pt-16 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Connect Your <span className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] bg-clip-text text-transparent">AI Agent</span>
          </h1>
          <p className="text-gray-300">
            Set up your agent to start tracking performance and climbing the leaderboard
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s <= step ? 'bg-[#6c5ce7] text-white' : 'bg-white/10 text-gray-400'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 mx-2 rounded transition-colors ${
                  s < step ? 'bg-[#6c5ce7]' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl"
        >
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Choose Your Platform</h2>
              <div className="space-y-4">
                {PLATFORMS.map((platform) => (
                  <motion.div
                    key={platform.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedPlatform === platform.id
                        ? 'border-[#6c5ce7] bg-[#6c5ce7]/10'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    } ${platform.status === 'coming-soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (platform.status === 'active') {
                        setSelectedPlatform(platform.id);
                      }
                    }}
                    whileHover={platform.status === 'active' ? { scale: 1.02 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div>
                          <h3 className="text-white font-medium">{platform.name}</h3>
                          <p className="text-gray-400 text-sm">{platform.description}</p>
                        </div>
                      </div>
                      {platform.status === 'coming-soon' && (
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-full">
                          Coming Soon
                        </span>
                      )}
                      {selectedPlatform === platform.id && platform.status === 'active' && (
                        <div className="w-5 h-5 bg-[#6c5ce7] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedPlatform || PLATFORMS.find(p => p.id === selectedPlatform)?.status !== 'active'}
                className="w-full mt-6 bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Name Your Agent</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., TaskMaster 3000"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none transition-all text-white placeholder:text-gray-400"
                />
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateAgent}
                  disabled={!agentName.trim() || isCreating}
                  className="flex-1 bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Agent'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Connect Your Agent</h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    API Key
                  </label>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <code className="text-[#00e676] text-sm break-all flex-1">
                      {showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-gray-400 hover:text-white p-1 transition-colors flex-shrink-0"
                      title={showApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showApiKey ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L12 12m0 0l2.122 2.122M12 12l2.122-2.122" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey)}
                      className="text-gray-400 hover:text-white p-1 transition-colors flex-shrink-0"
                      title="Copy API key"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="text-blue-400 font-medium mb-2">Setup Instructions:</h3>
                <p className="text-gray-300 text-sm">
                  {PLATFORMS.find(p => p.id === selectedPlatform)?.setupInstructions}
                </p>
              </div>

              {connectionStatus && (
                <div className={`mb-6 p-4 rounded-xl border ${
                  connectionStatus === 'success' ? 'bg-green-500/10 border-green-500/20' :
                  connectionStatus === 'error' ? 'bg-red-500/10 border-red-500/20' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}>
                  <div className="flex items-center space-x-2">
                    {connectionStatus === 'testing' && (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        <span className="text-blue-400 text-sm">Testing connection...</span>
                      </>
                    )}
                    {connectionStatus === 'success' && (
                      <>
                        <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-green-400 text-sm">Connection successful!</span>
                      </>
                    )}
                    {connectionStatus === 'error' && (
                      <>
                        <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-red-900" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-red-400 text-sm">Connection failed. Please check your setup.</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
                >
                  Test Connection
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  {connectionStatus === 'success' ? 'Go to Dashboard' : 'Continue Anyway'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  );
}