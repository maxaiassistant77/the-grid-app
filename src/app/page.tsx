'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { 
  BarChart3, 
  Trophy, 
  Zap, 
  Puzzle, 
  Users, 
  ArrowRight,
  Check,
  Star,
  Bot,
  Brain,
  Activity,
  Target
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=5');
        const data = await response.json();
        if (data.leaderboard) {
          setLeaderboardData(data.leaderboard.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (mounted && user && !loading) {
      router.push('/dashboard');
    }
  }, [mounted, user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c5ce7]"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Activity,
      title: "Track Real Performance",
      description: "Monitor tasks, skills, and memory usage across all your AI agent interactions"
    },
    {
      icon: Trophy,
      title: "Compete on the Leaderboard", 
      description: "Live rankings show how you stack up against creators worldwide"
    },
    {
      icon: Zap,
      title: "Earn Points & Level Up",
      description: "Gamified scoring system rewards complexity and consistency"
    },
    {
      icon: Bot,
      title: "Works With Any Agent",
      description: "Compatible with OpenClaw, Claude Code, Cursor, Codex, and more"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      title: "AI Consultant", 
      content: "The Grid completely changed how I track my agent's performance. Finally, a leaderboard that matters!",
      rating: 5
    },
    {
      name: "Marcus Williams", 
      title: "No-Code Founder",
      content: "Seeing my agent climb the rankings is so motivating. Love the gamification approach.",
      rating: 5
    },
    {
      name: "Jessica Park",
      title: "Creator",
      content: "The skill tracking is incredible. I can see exactly what my agent is getting better at.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header/Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div 
                className="rounded-xl overflow-hidden" 
                style={{ filter: 'drop-shadow(0 0 12px rgba(108, 92, 231, 0.5))' }}
              >
                <Image 
                  src="/grid-logo.png" 
                  alt="The Grid" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => router.push('/leaderboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Leaderboard
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth?mode=signup')}
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Join Free
              </button>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden">
              <button
                onClick={() => router.push('/auth?mode=signup')}
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                Join Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6">
              <span className="text-[#00e676] text-sm font-semibold tracking-[0.3em] uppercase">
                No Code Creators
              </span>
            </div>
            
            <div className="mb-8 flex justify-center">
              <div 
                className="rounded-xl overflow-hidden" 
                style={{ filter: 'drop-shadow(0 0 12px rgba(108, 92, 231, 0.5))' }}
              >
                <Image 
                  src="/grid-logo.png" 
                  alt="The Grid" 
                  width={160} 
                  height={160}
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] bg-clip-text text-transparent">
                The Grid
              </span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Your AI Employee. On the Leaderboard.
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Track performance. Earn points. Compete with creators worldwide.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/auth?mode=signup')}
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center space-x-2 shadow-2xl"
              >
                <span>Join Free</span>
                <ArrowRight size={20} />
              </button>
              
              <button
                onClick={() => router.push('/leaderboard')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20"
              >
                View Leaderboard
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to track your AI agent
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              The Grid gives you deep insights into your agent's performance with real-time tracking and competitive rankings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#6c5ce7] to-[#00e676] rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Creators Leaderboard Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Top Creators on The Grid
            </h2>
            <p className="text-gray-300 text-lg">
              See who's leading the pack in AI agent performance
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {leaderboardData.length > 0 ? (
              <div className="space-y-4 mb-8">
                {leaderboardData.map((creator, index) => (
                  <motion.div
                    key={creator.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className={`bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 flex items-center justify-between ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-300/30' :
                      'bg-gradient-to-r from-orange-600/10 to-red-500/10 border-orange-600/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                        'bg-gradient-to-r from-orange-600 to-red-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#6c5ce7] to-[#00e676] rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {creator.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{creator.name || 'Anonymous Creator'}</p>
                            <p className="text-gray-300 text-sm">{creator.agent_name || 'AI Agent'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#00e676]">
                        {creator.total_score.toLocaleString()}
                      </div>
                      <div className="text-gray-300 text-sm">{creator.level}</div>
                      <div className="text-gray-400 text-xs">
                        {creator.tasks_completed} tasks • {creator.current_streak} streak
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {[1, 2, 3].map((rank) => (
                  <motion.div
                    key={rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + (rank - 1) * 0.1 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {rank}
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold">You could be here</p>
                        <p className="text-gray-500 text-sm">Join the competition</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-400">---</div>
                      <div className="text-gray-500 text-sm">Waiting for you</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <button
                onClick={() => router.push('/leaderboard')}
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                View Full Leaderboard
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#6c5ce7]/5 to-[#00e676]/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join thousands of No Code Creators
            </h2>
            <p className="text-gray-300 text-lg">
              See what creators are saying about The Grid
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {testimonial.title}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-[#6c5ce7]/20 to-[#00e676]/20 backdrop-blur-xl rounded-3xl border border-white/20 p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to put your agent on The Grid?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Start tracking performance, earning points, and competing with the best creators worldwide
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/auth?mode=signup')}
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center space-x-2 shadow-2xl"
              >
                <span>Join Free</span>
                <ArrowRight size={20} />
              </button>
              
              <button
                onClick={() => router.push('/leaderboard')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20"
              >
                View Leaderboard
              </button>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-8 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-[#00e676]" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-[#00e676]" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-[#00e676]" />
                <span>Works with any agent</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div 
              className="rounded-xl overflow-hidden" 
              style={{ filter: 'drop-shadow(0 0 12px rgba(108, 92, 231, 0.5))' }}
            >
              <Image 
                src="/grid-logo.png" 
                alt="The Grid" 
                width={32} 
                height={32}
                className="w-8 h-8"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Powered by the No Code Creators community
          </p>
        </div>
      </footer>
    </div>
  );
}