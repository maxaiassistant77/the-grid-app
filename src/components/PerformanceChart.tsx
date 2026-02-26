'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, Award, Target } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';

interface DailyStats {
  date: string;
  total_score: number;
  tasks_completed: number;
  current_streak: number;
  activity_score: number;
  capability_score: number;
  complexity_score: number;
}

interface PerformanceChartProps {
  agentId: string;
}

export function PerformanceChart({ agentId }: PerformanceChartProps) {
  const [data, setData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(7);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: DailyStats } | null>(null);

  useEffect(() => {
    loadData();
  }, [agentId, selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agent/history?agent_id=${agentId}&days=${selectedPeriod}`);
      const result = await response.json();
      setData(result.history || []);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate fake data if no real data exists (for demo/empty state)
  const generateFakeData = () => {
    const fakeData: DailyStats[] = [];
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      fakeData.push({
        date,
        total_score: Math.floor(Math.random() * 50) + (selectedPeriod - i) * 20,
        tasks_completed: Math.floor(Math.random() * 8) + 2,
        current_streak: Math.max(0, Math.floor(Math.random() * 10)),
        activity_score: Math.floor(Math.random() * 20) + 60,
        capability_score: Math.floor(Math.random() * 15) + 70,
        complexity_score: Math.floor(Math.random() * 25) + 50,
      });
    }
    return fakeData;
  };

  const chartData = data.length > 0 ? data : generateFakeData();
  const hasRealData = data.length > 0;

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Performance History</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-[#6c5ce7] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  const maxScore = Math.max(...chartData.map(d => d.total_score), 100);
  const minScore = Math.min(...chartData.map(d => d.total_score), 0);
  const scoreRange = maxScore - minScore;

  // Calculate summary stats
  const totalGrowth = chartData.length > 1 
    ? chartData[chartData.length - 1].total_score - chartData[0].total_score 
    : 0;
  const avgDailyScore = chartData.reduce((sum, d) => sum + d.total_score, 0) / chartData.length;
  const bestDay = chartData.reduce((best, d) => 
    d.total_score > best.total_score ? d : best, chartData[0]
  );
  const totalTasks = chartData.reduce((sum, d) => sum + d.tasks_completed, 0);

  // SVG dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) => padding.left + (index / (chartData.length - 1)) * chartWidth;
  const yScale = (score: number) => padding.top + ((maxScore - score) / scoreRange) * chartHeight;

  // Generate path for the line
  const pathData = chartData.map((d, i) => {
    const x = xScale(i);
    const y = yScale(d.total_score);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate gradient area path
  const areaData = chartData.map((d, i) => {
    const x = xScale(i);
    const y = yScale(d.total_score);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ` L ${xScale(chartData.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
      {!hasRealData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
        >
          <p className="text-amber-300 text-sm flex items-center gap-2">
            <Target size={16} />
            Demo data shown - start completing tasks to see your real performance!
          </p>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-[#6c5ce7]" />
          Performance History
        </h3>
        
        {/* Period selector */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {([7, 14, 30] as const).map((days) => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === days
                  ? 'bg-[#6c5ce7] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative mb-6">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6c5ce7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6c5ce7" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6c5ce7" />
              <stop offset="100%" stopColor="#00e676" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding.top + (i * chartHeight / 4);
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Y-axis labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const value = Math.round(maxScore - (i * scoreRange / 4));
            const y = padding.top + (i * chartHeight / 4);
            return (
              <text
                key={i}
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#9ca3af"
                fontSize="12"
              >
                {value}
              </text>
            );
          })}

          {/* Area fill */}
          <motion.path
            d={areaData}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Main line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Data points */}
          {chartData.map((d, i) => {
            const x = xScale(i);
            const y = yScale(d.total_score);
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#00e676"
                stroke="#ffffff"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * i }}
                whileHover={{ scale: 1.5, r: 6 }}
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredPoint({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    data: d
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* X-axis labels */}
          {chartData.map((d, i) => {
            if (i % Math.ceil(chartData.length / 6) !== 0) return null; // Show every nth label
            const x = xScale(i);
            const y = height - padding.bottom + 15;
            const dateLabel = format(parseISO(d.date), 'MMM d');
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="11"
              >
                {dateLabel}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 pointer-events-none"
              style={{
                left: hoveredPoint.x,
                top: hoveredPoint.y - 10,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="bg-[#1a1a2e] border border-[#6c5ce7]/30 rounded-lg p-3 shadow-2xl">
                <div className="text-white font-medium text-sm">
                  {format(parseISO(hoveredPoint.data.date), 'MMM d, yyyy')}
                </div>
                <div className="text-[#00e676] font-bold text-lg">
                  {hoveredPoint.data.total_score.toLocaleString()} pts
                </div>
                <div className="text-gray-400 text-xs">
                  {hoveredPoint.data.tasks_completed} tasks completed
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-xl p-4 text-center"
        >
          <div className="text-[#00e676] font-bold text-xl">
            {totalGrowth >= 0 ? '+' : ''}{totalGrowth}
          </div>
          <div className="text-gray-300 text-sm">Total Growth</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-xl p-4 text-center"
        >
          <div className="text-[#6c5ce7] font-bold text-xl">
            {Math.round(avgDailyScore)}
          </div>
          <div className="text-gray-300 text-sm">Avg Daily Score</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-xl p-4 text-center"
        >
          <div className="text-yellow-400 font-bold text-xl">
            {bestDay.total_score}
          </div>
          <div className="text-gray-300 text-sm">Best Day</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-xl p-4 text-center"
        >
          <div className="text-white font-bold text-xl">{totalTasks}</div>
          <div className="text-gray-300 text-sm">Total Tasks</div>
        </motion.div>
      </div>

      {!hasRealData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="inline-flex items-center gap-2 text-gray-400 text-sm"
          >
            <Calendar size={16} />
            Your journey starts now - complete tasks to build your history!
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}