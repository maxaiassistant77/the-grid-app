'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ActivityLog } from '@/lib/types';
import { getActivities } from '@/lib/store';

interface ActivityFeedProps {
  refreshTrigger?: number;
}

export function ActivityFeed({ refreshTrigger }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setActivities(getActivities());
  }, [refreshTrigger]);

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'tasks': return '&#9989;';
      case 'hours': return '&#9203;';
      case 'revenue': return '&#128176;';
      case 'challenge': return '&#127775;';
    }
  };

  const getActivityLabel = (activity: ActivityLog) => {
    switch (activity.type) {
      case 'tasks': return `Logged ${activity.value} task${activity.value > 1 ? 's' : ''} completed`;
      case 'hours': return `Logged ${activity.value} hour${activity.value > 1 ? 's' : ''} saved`;
      case 'revenue': return `Logged $${activity.value.toLocaleString()} revenue`;
      case 'challenge': return `Submitted challenge entry`;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-4xl mb-3">&#128203;</p>
          <h3 className="text-lg font-semibold text-[#0a0a0f] mb-1">No Activity Yet</h3>
          <p className="text-gray-500 text-sm">Start logging your AI agent&apos;s wins to build your activity feed!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#0a0a0f] flex items-center gap-2">
          <span className="text-xl">&#128200;</span> Recent Activity
        </h2>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activities.slice(0, 20).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: index * 0.02 }}
              className="px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className="text-lg flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: getActivityIcon(activity.type) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0a0a0f]">
                    {getActivityLabel(activity)}
                    {activity.note && (
                      <span className="text-gray-500"> - {activity.note}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
