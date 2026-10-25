import React, { useState } from 'react';
import { HistoryMemory, User } from '../../types';
import { Clock, Plus, X, Sparkles, BookOpen } from 'lucide-react';

interface HistoryTabProps {
  memories: HistoryMemory[];
  currentUser: User;
  onAddMemory: (memory: Omit<HistoryMemory, 'id' | 'createdAt' | 'authorName'>) => Promise<void>;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  memories,
  currentUser,
  onAddMemory,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorted by year chronologically (earliest to latest or newest to earliest? Let's do ascending or chronological timeline so the journey unfolds from 2021 onwards)
  const sortedMemories = [...memories].sort((a, b) => a.year - b.year);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      setError('Please provide a title and memory story.');
      return;
    }

    if (!year || year < 1900 || year > 2100) {
      setError('Please enter a valid year.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddMemory({
        year: Number(year),
        title: title.trim(),
        text: text.trim(),
      });

      setShowModal(false);
      setTitle('');
      setText('');
      setYear(new Date().getFullYear());
    } catch {
      setError('Failed to record memory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title with Gold Underline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#22244A] dark:text-white gold-underline">
            Our Story &amp; History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Preserving milestones and memories across the generations
          </p>
        </div>

        {/* Any member can add a memory */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#E2B04A]" />
          Add Memory
        </button>
      </div>

      {/* Intro Hero Banner (Exact text: "BMF is the best mate family. Our story began in 2021.") */}
      <div className="bg-gradient-to-r from-[#22244A] to-[#2e3164] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-[#E2B04A]/30">
        <div className="relative z-10 max-w-lg">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E2B04A] flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Family Chronicles
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold mb-2">
            BMF is the best mate family. Our story began in 2021.
          </h3>
          <p className="font-motto text-[#E2B04A] text-2xl tracking-wide">
            Our love never fail
          </p>
        </div>

        {/* Subtle decorative watermark */}
        <div className="absolute -bottom-6 -right-6 w-36 h-36 opacity-10 pointer-events-none">
          <Clock className="w-full h-full text-white" />
        </div>
      </div>

      {/* Timeline view sorted by year */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E2B04A]/40 space-y-6 ml-3 sm:ml-4 pt-2">
        {sortedMemories.map((mem) => (
          <div key={mem.id} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-[#22244A] border-2 border-[#E2B04A] text-[#E2B04A] flex items-center justify-center text-[10px] font-bold shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#E2B04A]" />
            </div>

            {/* Content Card */}
            <article className="bg-white dark:bg-[#1a1b35] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 transition hover:border-[#E2B04A]/30">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#E2B04A]/15 text-[#E2B04A] border border-[#E2B04A]/30 tracking-wider">
                  {mem.year}
                </span>
                <span className="text-[11px] text-slate-400">
                  Shared by {mem.authorName}
                </span>
              </div>

              <h4 className="font-heading text-lg font-bold text-[#22244A] dark:text-white mb-2">
                {mem.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {mem.text}
              </p>
            </article>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1b35] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-lg font-bold text-[#22244A] dark:text-white mb-1">
              Add a Family Memory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Record a milestone or cherished memory in our family timeline.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  required
                  min={1900}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  placeholder="e.g., 2021"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., First Family Vacation in Cornwall"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Story &amp; Reflections *
                </label>
                <textarea
                  rows={4}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tell what happened and why this memory is meaningful to our family..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
