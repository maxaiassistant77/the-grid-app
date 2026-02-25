'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'success';
}

export function StatCard({ title, value, prefix = '', suffix = '', variant = 'default' }: StatCardProps) {
  const bgColor = variant === 'success' ? 'bg-green-50' : 'bg-gray-50';
  const textColor = variant === 'success' ? 'text-green-600' : 'text-[#0a0a0f]';

  return (
    <motion.div
      className={`${bgColor} rounded-2xl p-6 border border-gray-100`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <motion.p
        className={`text-3xl font-bold ${textColor} mb-1`}
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {prefix}{value.toLocaleString()}{suffix}
      </motion.p>
      <p className="text-sm text-gray-500">{title}</p>
    </motion.div>
  );
}
