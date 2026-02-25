'use client';

import { motion } from 'framer-motion';

interface Activity {
  id: string;
  icon: string;
  text: string;
  timeAgo: string;
}

const activities: Activity[] = [
  { id: '1', icon: '📧', text: 'Sent 3 follow-up emails', timeAgo: '2h ago' },
  { id: '2', icon: '✏️', text: 'Generated blog post draft', timeAgo: '4h ago' },
  { id: '3', icon: '📅', text: 'Scheduled 2 meetings', timeAgo: '6h ago' },
  { id: '4', icon: '📊', text: 'Analyzed competitor pricing', timeAgo: '8h ago' }
];

export function DailyActivity() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#0a0a0f]">What Your AI Did Today</h2>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-50">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
              {activity.icon}
            </div>

            {/* Text */}
            <p className="flex-1 font-medium text-[#0a0a0f]">
              {activity.text}
            </p>

            {/* Time */}
            <span className="text-sm text-gray-400">
              {activity.timeAgo}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
