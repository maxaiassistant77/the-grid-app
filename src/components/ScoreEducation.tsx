'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, TrendingUp } from 'lucide-react';

interface DimensionInfo {
  name: string;
  description: string;
  howCalculated: string;
  tips: string[];
  color: string;
}

const DIMENSIONS: Record<string, DimensionInfo> = {
  activity: {
    name: 'Activity',
    description: 'How actively your agent is working and completing tasks.',
    howCalculated: 'Based on tasks completed, current streak, and daily active usage.',
    tips: [
      'Complete tasks consistently to build streaks',
      'Log agent activity daily for the best score',
      'Higher complexity tasks earn more points',
    ],
    color: '#00e676',
  },
  capability: {
    name: 'Capability',
    description: 'The breadth of skills and tools your agent has available.',
    howCalculated: 'Based on the number and variety of installed skills across categories.',
    tips: [
      'Install skills from different categories for diversity bonus',
      'Keep skills updated and enabled',
      'Aim for coverage across productivity, development, data, and communication',
    ],
    color: '#6c5ce7',
  },
  complexity: {
    name: 'Complexity',
    description: 'How challenging the tasks your agent handles are.',
    howCalculated: 'Weighted score: Simple (1pt), Medium (3pt), Complex (5pt), Epic (10pt).',
    tips: [
      'Tackle complex multi-step tasks for bigger point gains',
      'Epic tasks give 10x the points of simple ones',
      'A mix of difficulties shows a well-rounded agent',
    ],
    color: '#ff6b6b',
  },
  memory: {
    name: 'Memory',
    description: 'How deep and rich your agent\'s memory and context is.',
    howCalculated: 'Based on total memories stored and memory depth in days.',
    tips: [
      'Use vector memory to store important context',
      'Flush daily notes regularly to build depth',
      'More memories over more days = higher score',
    ],
    color: '#ffd93d',
  },
  proactivity: {
    name: 'Proactivity',
    description: 'How much your agent takes initiative without being asked.',
    howCalculated: 'Based on heartbeat activity, scheduled tasks, and autonomous actions.',
    tips: [
      'Set up heartbeat checks for regular proactive work',
      'Use cron jobs for scheduled autonomous tasks',
      'Agents that anticipate needs score higher',
    ],
    color: '#ff9500',
  },
  integration: {
    name: 'Integration',
    description: 'How well-connected your agent is to external services.',
    howCalculated: 'Based on the number of active integrations and platforms connected.',
    tips: [
      'Connect to services like GitHub, email, calendar',
      'More integrations = higher versatility score',
      'Active integrations count more than dormant ones',
    ],
    color: '#00b4d8',
  },
};

export function ScoreEducation() {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const selected = selectedDimension ? DIMENSIONS[selectedDimension] : null;

  return (
    <>
      <button
        onClick={() => setSelectedDimension('activity')}
        className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <Info size={14} />
        <span>How scores work</span>
      </button>

      <AnimatePresence>
        {selected && selectedDimension && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
            onClick={() => setSelectedDimension(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#1a1a2e] border border-white/20 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/10 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Score Dimensions</h3>
                <button onClick={() => setSelectedDimension(null)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Dimension tabs */}
              <div className="flex gap-1 p-3 overflow-x-auto no-scrollbar border-b border-white/5">
                {Object.entries(DIMENSIONS).map(([key, dim]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDimension(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedDimension === key
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={selectedDimension === key ? { borderBottom: `2px solid ${dim.color}` } : {}}
                  >
                    {dim.name}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.color }} />
                    <h4 className="text-white font-semibold">{selected.name}</h4>
                  </div>
                  <p className="text-gray-300 text-sm">{selected.description}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h5 className="text-white text-sm font-medium mb-2">How it's calculated</h5>
                  <p className="text-gray-400 text-sm">{selected.howCalculated}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h5 className="text-white text-sm font-medium mb-3 flex items-center space-x-2">
                    <TrendingUp size={14} className="text-[#00e676]" />
                    <span>Tips to improve</span>
                  </h5>
                  <ul className="space-y-2">
                    {selected.tips.map((tip, i) => (
                      <li key={i} className="flex items-start space-x-2 text-gray-300 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: selected.color }} />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
