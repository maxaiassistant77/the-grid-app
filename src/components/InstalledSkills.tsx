'use client';

import { motion } from 'framer-motion';

interface Skill {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  isNew?: boolean;
}

const skills: Skill[] = [
  { id: 'email', name: 'Email Automation', icon: '📊', active: true, isNew: false },
  { id: 'lead', name: 'Lead Scoring', icon: '🎯', active: true, isNew: true },
  { id: 'content', name: 'Content Writer', icon: '✏️', active: true, isNew: false },
  { id: 'meeting', name: 'Meeting Scheduler', icon: '📅', active: true, isNew: false },
  { id: 'crm', name: 'CRM Integration', icon: '🔗', active: false, isNew: false },
  { id: 'competitor', name: 'Competitor Analysis', icon: '📈', active: true, isNew: true }
];

export function InstalledSkills() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0a0a0f]">Installed Skills</h2>
        <button className="text-sm font-medium text-[#00B4E6] hover:text-[#0090b8] transition-colors flex items-center gap-1">
          Browse Skill Library
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Skills Grid */}
      <div className="px-5 pb-5">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex-shrink-0 w-[150px] border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
            >
              {/* New Badge */}
              {skill.isNew && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                  New
                </span>
              )}

              {/* Icon */}
              <div className="text-3xl mb-3 text-center">
                {skill.icon}
              </div>

              {/* Name */}
              <p className="text-sm font-medium text-[#0a0a0f] text-center mb-2">
                {skill.name}
              </p>

              {/* Status */}
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  skill.active
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {skill.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
