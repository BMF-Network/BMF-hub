import React, { useState } from 'react';
import { NewsItem, NewsLabel, User } from '../../types';
import { Megaphone, Plus, X, Calendar, AlertTriangle, Bell, Info } from 'lucide-react';

interface NewsTabProps {
  news: NewsItem[];
  currentUser: User;
  onAddNews: (item: Omit<NewsItem, 'id' | 'createdAt' | 'authorName'>) => Promise<void>;
}

export const NewsTab: React.FC<NewsTabProps> = ({
  news,
  currentUser,
  onAddNews,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [label, setLabel] = useState<NewsLabel>('News');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

  // Newest first
  const sortedNews = [...news].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Please provide both title and announcement message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddNews({
        title: title.trim(),
        message: message.trim(),
        label,
        date: date || new Date().toISOString().split('T')[0],
      });

      setShowAddModal(false);
      setTitle('');
      setMessage('');
      setLabel('News');
    } catch {
      setError('Failed to post announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabelBadge = (itemLabel: NewsLabel) => {
    switch (itemLabel) {
      case 'Important':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle className="w-3 h-3" />
            Important
          </span>
        );
      case 'Reminder':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-[#E2B04A] border border-amber-200 dark:border-amber-900/50">
            <Bell className="w-3 h-3" />
            Reminder
          </span>
        );
      case 'News':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
            <Info className="w-3 h-3" />
            News
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title with Gold Underline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#22244A] dark:text-white gold-underline">
            Family Announcements
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official news and updates from the family admin
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold shadow-md transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#E2B04A]" />
            Post Announcement (Admin)
          </button>
        )}
      </div>

      {/* List or Empty State */}
      {sortedNews.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1b35] rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#22244A]/5 dark:bg-white/5 text-[#22244A] dark:text-[#E2B04A] flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[#22244A] dark:text-white mb-2">
            No announcements posted yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Stay tuned for upcoming family gatherings, milestones, and important updates!
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2B04A] text-[#121324] font-bold text-xs shadow transition hover:bg-[#ebd27a]"
            >
              <Plus className="w-3.5 h-3.5" />
              Write First Announcement
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedNews.map((item) => (
            <article
              key={item.id}
              className="bg-white dark:bg-[#1a1b35] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800/80 transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {getLabelBadge(item.label)}
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>
              </div>

              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#22244A] dark:text-white mb-2">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {item.message}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {item.authorName || 'Family Admin'}</span>
                <span className="font-motto text-[#E2B04A] text-lg">
                  BMF
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Admin Post Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1b35] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-lg font-bold text-[#22244A] dark:text-white mb-1">
              Post Family Announcement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              All approved members will receive automatic notices based on their preferences.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Label *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['News', 'Important', 'Reminder'] as NewsLabel[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className={`py-2 px-1 text-xs rounded-xl font-bold border text-center transition ${
                        label === l
                          ? 'bg-[#22244A] text-[#E2B04A] border-[#22244A]'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Annual Family Reunion Date Confirmed!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event / Announcement Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write the full announcement details here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
