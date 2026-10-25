import React, { useState } from 'react';
import { SharePost, ShareType, StickerEmoji, User } from '../../types';
import { HeartHandshake, Plus, Trash2, Image as ImageIcon, Video, X, Sparkles } from 'lucide-react';
import { resizeImageFile, checkVideoDuration } from '../../utils/imageResize';

interface ShareTabProps {
  posts: SharePost[];
  currentUser: User;
  onAddPost: (post: Omit<SharePost, 'id' | 'createdAt' | 'userId' | 'userName'>) => Promise<void>;
  onDeletePost: (postId: string) => void;
}

const STICKERS: { emoji: StickerEmoji; label: string }[] = [
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🙏', label: 'Praying hands' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '😊', label: 'Smile' },
  { emoji: '💪', label: 'Strong arm' },
  { emoji: '🌹', label: 'Rose' },
  { emoji: '🕊️', label: 'Dove' },
];

export const ShareTab: React.FC<ShareTabProps> = ({
  posts,
  currentUser,
  onAddPost,
  onDeletePost,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [postType, setPostType] = useState<ShareType>('Feeling');
  const [text, setText] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<StickerEmoji | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

  // Newest first
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      if (file.type.startsWith('video/')) {
        // Enforce maximum 30 seconds for short videos
        const duration = await checkVideoDuration(file);
        if (duration > 30) {
          setError(`Video must be 30 seconds or shorter (selected video is ${Math.round(duration)}s).`);
          setIsProcessing(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          setMediaUrl(reader.result as string);
          setMediaType('video');
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } else {
        // Compress photo
        const compressed = await resizeImageFile(file, 1280, 0.82);
        setMediaUrl(compressed);
        setMediaType('photo');
        setIsProcessing(false);
      }
    } catch {
      setError('Could not process this file. Please try another.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !mediaUrl && !selectedSticker) {
      setError('Please enter some text, pick a sticker, or attach a photo/video.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onAddPost({
        type: postType,
        text: text.trim(),
        sticker: selectedSticker || undefined,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
      });

      setShowModal(false);
      setText('');
      setSelectedSticker(null);
      setMediaUrl(null);
      setMediaType(null);
    } catch {
      setError('Failed to share post. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPostTypeColor = (type: ShareType) => {
    switch (type) {
      case 'Feeling':
        return 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200';
      case 'Quote':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200';
      case 'Advice':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-[#E2B04A] border-amber-200';
      case 'Wish':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title with Gold Underline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#22244A] dark:text-white gold-underline">
            Family Share Feed
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Share a feeling, quote, piece of advice, or heartfelt wish
          </p>
        </div>

        {/* Any member can post */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#E2B04A]" />
          Create Post
        </button>
      </div>

      {/* Feed or Empty State */}
      {sortedPosts.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1b35] rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/30 text-[#E2B04A] flex items-center justify-center mx-auto mb-4 border border-[#E2B04A]/20">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[#22244A] dark:text-white mb-2">
            No family shares yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Be the first to share an inspiring thought, daily feeling, prayer, or warm wish with the family!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2B04A] text-[#121324] font-bold text-xs shadow transition hover:bg-[#ebd27a]"
          >
            <Plus className="w-3.5 h-3.5" />
            Share Something
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => {
            const isAuthor = post.userId === currentUser.id;
            const canDelete = isAuthor || isAdmin;

            return (
              <article
                key={post.id}
                className="bg-white dark:bg-[#1a1b35] rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#22244A] text-[#E2B04A] flex items-center justify-center text-xs font-bold shadow-sm">
                      {post.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {post.userName}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()} at{' '}
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPostTypeColor(
                        post.type
                      )}`}
                    >
                      {post.type}
                    </span>

                    {/* Delete button: Author or Admin */}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this family post?')) {
                            onDeletePost(post.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                        title={isAdmin && !isAuthor ? 'Delete post (Admin)' : 'Delete your post'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sticker badge if present */}
                {post.sticker && (
                  <div className="mb-2">
                    <span className="text-2xl inline-block drop-shadow-sm select-none" role="img" aria-label="sticker">
                      {post.sticker}
                    </span>
                  </div>
                )}

                {/* Post Text */}
                {post.text && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line mb-3">
                    {post.text}
                  </p>
                )}

                {/* Media Attachment */}
                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden bg-slate-950 mt-2 max-h-80 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    {post.mediaType === 'video' ? (
                      <video src={post.mediaUrl} controls className="max-h-80 w-auto max-w-full" />
                    ) : (
                      <img src={post.mediaUrl} alt="Post attachment" className="max-h-80 w-auto max-w-full object-contain" />
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1b35] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-lg font-bold text-[#22244A] dark:text-white mb-1">
              Share with Family
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Your real name ({currentUser.fullName}) will be displayed with this post.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Post Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Feeling', 'Quote', 'Advice', 'Wish'] as ShareType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPostType(t)}
                      className={`py-2 px-1 text-xs rounded-xl font-bold border text-center transition ${
                        postType === t
                          ? 'bg-[#22244A] text-[#E2B04A] border-[#22244A]'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Message
                </label>
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What would you like to share with the family today?..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              {/* Exact 8 stickers (choose one) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Add One Sticker</span>
                  {selectedSticker && (
                    <button
                      type="button"
                      onClick={() => setSelectedSticker(null)}
                      className="text-[10px] text-rose-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {STICKERS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedSticker(selectedSticker === s.emoji ? null : s.emoji)}
                      className={`p-2 rounded-xl text-xl flex flex-col items-center justify-center transition border ${
                        selectedSticker === s.emoji
                          ? 'bg-[#E2B04A]/20 border-[#E2B04A] scale-110 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                      title={s.label}
                    >
                      <span>{s.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Photo or Video */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Photo or Short Video (Max 30s)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />

                {mediaUrl && (
                  <div className="relative mt-2 rounded-xl overflow-hidden bg-slate-900 max-h-40 flex items-center justify-center border border-slate-200">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} controls className="max-h-40" />
                    ) : (
                      <img src={mediaUrl} alt="Preview" className="max-h-40 object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl(null);
                        setMediaType(null);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isProcessing ? 'Posting...' : 'Share with Family'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
