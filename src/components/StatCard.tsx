'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  onAdd: () => void;
}

export function StatCard({ title, value, prefix = '', suffix = '', icon, onAdd }: StatCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#00B4E6]/10 flex items-center justify-center text-[#00B4E6]">
          {icon}
        </div>
        <motion.button
          onClick={onAdd}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-[#00B4E6] hover:text-white flex items-center justify-center text-gray-500 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <motion.p
        className="text-2xl font-bold text-[#0a0a0f]"
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {prefix}{value.toLocaleString()}{suffix}
      </motion.p>
    </motion.div>
  );
}
