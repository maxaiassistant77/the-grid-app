'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: number, note: string) => void;
  title: string;
  type: 'tasks' | 'hours' | 'revenue';
}

export function LogModal({ isOpen, onClose, onSubmit, title, type }: LogModalProps) {
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;

    onSubmit(numValue, note);
    setValue('');
    setNote('');
    onClose();
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'tasks': return 'e.g., 5';
      case 'hours': return 'e.g., 2.5';
      case 'revenue': return 'e.g., 150';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'tasks': return 'Tasks Completed';
      case 'hours': return 'Hours Saved';
      case 'revenue': return 'Revenue Generated ($)';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#0a0a0f]">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {getLabel()}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={getPlaceholder()}
                    min="0"
                    step={type === 'hours' ? '0.5' : '1'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4E6] focus:ring-2 focus:ring-[#00B4E6]/20 outline-none transition-all text-[#0a0a0f] placeholder:text-gray-400"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    What did your agent do? <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., Built email automation workflow"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4E6] focus:ring-2 focus:ring-[#00B4E6]/20 outline-none transition-all text-[#0a0a0f] placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#00B4E6] text-white font-medium hover:bg-[#00a0cc] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Log Activity
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
