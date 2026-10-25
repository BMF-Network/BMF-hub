export type TabType = 'media' | 'news' | 'calendar' | 'share' | 'chat' | 'history';

export type UserRole = 'admin' | 'member';
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type NotificationPreference = 'email' | 'whatsapp' | 'both' | 'none';

export interface User {
  id: string;
  email: string;
  fullName: string;
  whatsapp?: string;
  notificationPref: NotificationPreference;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  lastActive: number;
}

export type NewsLabel = 'Important' | 'Reminder' | 'News';

export interface NewsItem {
  id: string;
  title: string;
  message: string;
  label: NewsLabel;
  date: string;
  createdAt: string;
  authorName: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  uploaderName: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  description?: string;
  createdAt: string;
  createdBy: string;
}

export type ShareType = 'Feeling' | 'Quote' | 'Advice' | 'Wish';

export type StickerEmoji = '❤️' | '🙏' | '🎉' | '⭐' | '😊' | '💪' | '🌹' | '🕊️';

export interface SharePost {
  id: string;
  type: ShareType;
  text: string;
  sticker?: StickerEmoji;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  createdAt: string;
  userId: string;
  userName: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface HistoryMemory {
  id: string;
  year: number;
  title: string;
  text: string;
  createdAt: string;
  authorName: string;
}

export interface NotificationLog {
  id: string;
  type: string;
  title: string;
  body: string;
  timestamp: string;
  recipientsCount: number;
  emailRecipients: string[];
  whatsAppRecipients: string[];
}
