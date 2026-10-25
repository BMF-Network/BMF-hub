import React, { useState } from 'react';
import { MediaItem, User } from '../../types';
import { Image as ImageIcon, Video, Plus, X, Calendar, Play, Filter, Sparkles } from 'lucide-react';
import { resizeImageFile, checkVideoDuration } from '../../utils/imageResize';

interface MediaTabProps {
  media: MediaItem[];
  currentUser: User;
  onAddMedia: (item: Omit<MediaItem, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploaderName'>) => Promise<void>;
  onDeleteMedia?: (id: string) => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  media,
  currentUser,
  onAddMedia,
}) => {
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

  const filteredMedia = media.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      if (file.type.startsWith('video/')) {
        setMediaType('video');
        // Validate duration
        const duration = await checkVideoDuration(file);
        if (duration > 60) {
          setError(`Selected video is too long (${Math.round(duration)}s). Please choose a shorter clip.`);
          setIsProcessing(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          setFileDataUrl(reader.result as string);
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } else {
        setMediaType('photo');
        // Resize large photos before uploading
        const compressed = await resizeImageFile(file, 1280, 0.82);
        setFileDataUrl(compressed);
        setIsProcessing(false);
      }
    } catch {
      setError('Could not process this media file.');
      setIsProcessing(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileDataUrl) {
      setError('Please choose a photo or video to upload.');
      return;
    }

    if (!uploadTitle.trim()) {
      setError('Please enter a title or caption for this media.');
      return;
    }

    setIsProcessing(true);
    try {
      await onAddMedia({
        title: uploadTitle.trim(),
        type: mediaType,
        url: fileDataUrl,
      });

      setShowUploadModal(false);
      setUploadTitle('');
      setFileDataUrl(null);
      setError(null);
    } catch {
      setError('Failed to upload media. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title with Gold Underline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#22244A] dark:text-white gold-underline">
            Family Media Gallery
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cherished photos and videos of our family moments
          </p>
        </div>

        {/* Admin Upload Button */}
        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold shadow-md transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#E2B04A]" />
            Upload Media (Admin)
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
        {(['all', 'photo', 'video'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              filter === tab
                ? 'bg-[#22244A] text-[#E2B04A] dark:bg-[#E2B04A] dark:text-[#121324] shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {tab === 'all' ? 'All Media' : tab === 'photo' ? 'Photos' : 'Videos'}
          </button>
        ))}
      </div>

      {/* Grid or Friendly Empty State */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1b35] rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-[#E2B04A] flex items-center justify-center mx-auto mb-4 border border-[#E2B04A]/30">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[#22244A] dark:text-white mb-2">
            No family media uploaded yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            The admin will share cherished family memories soon. Check back shortly or explore the other family tabs!
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E2B04A] text-[#121324] font-bold text-xs shadow transition hover:bg-[#ebd27a]"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload First Memory
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-800"
            >
              {item.type === 'video' ? (
                <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                  <video src={item.url} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition">
                    <div className="w-10 h-10 rounded-full bg-white/80 group-hover:bg-[#E2B04A] text-[#121324] flex items-center justify-center shadow-lg transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white text-[10px]">
                    <Video className="w-3.5 h-3.5" />
                  </span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}

              {/* Title overlay */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <p className="text-xs font-semibold truncate leading-snug">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Large View Modal (Lightbox) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#181932] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition"
              aria-label="Close media preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] flex items-center justify-center bg-black">
              {selectedItem.type === 'video' ? (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-auto max-w-full"
                />
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              )}
            </div>

            <div className="p-4 bg-[#1b1c3a] text-white">
              <h3 className="font-heading font-bold text-lg text-[#E2B04A]">
                {selectedItem.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Uploaded by {selectedItem.uploaderName}</span>
                <span>•</span>
                <span>{new Date(selectedItem.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1b35] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-lg font-bold text-[#22244A] dark:text-white mb-1">
              Upload Family Media
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add photos or videos to the family gallery (Admin only)
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title or Caption *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Summer Family Gathering 2024"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Photo or Video *
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#22244A] file:text-white hover:file:bg-[#2c2f60] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Photos are automatically resized for crisp, fast mobile loading.
                </span>
              </div>

              {/* Preview */}
              {fileDataUrl && (
                <div className="rounded-xl overflow-hidden max-h-48 bg-slate-900 flex items-center justify-center border border-slate-200">
                  {mediaType === 'video' ? (
                    <video src={fileDataUrl} controls className="max-h-48" />
                  ) : (
                    <img src={fileDataUrl} alt="Preview" className="max-h-48 object-contain" />
                  )}
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-[#E2B04A]/30 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E2B04A]" />
                Approved members will receive automatic notices based on their preferences.
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Upload & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
