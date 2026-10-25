import {
  User,
  NewsItem,
  MediaItem,
  CalendarEvent,
  SharePost,
  ChatMessage,
  HistoryMemory,
} from '../types';

// Admin configuration: stored securely in application logic, never shown on public pages
export const DEFAULT_ADMIN_EMAIL = 'concorderuhungande@gmail.com';

const STORAGE_KEYS = {
  CURRENT_USER: 'bmf_current_user_v1',
  USERS: 'bmf_users_v1',
  NEWS: 'bmf_news_v1',
  MEDIA: 'bmf_media_v1',
  EVENTS: 'bmf_calendar_v1',
  POSTS: 'bmf_share_posts_v1',
  CHAT: 'bmf_chat_messages_v1',
  HISTORY: 'bmf_history_v1',
};

// Real-time broadcast channel for cross-tab communication
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('bmf_family_hub_sync') : null;

export function broadcastUpdate(type: string, payload?: unknown) {
  if (channel) {
    channel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

export function subscribeToUpdates(callback: (type: string, payload?: unknown) => void): () => void {
  if (!channel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      callback(event.data.type, event.data.payload);
    }
  };
  channel.addEventListener('message', handler);
  return () => {
    channel.removeEventListener('message', handler);
  };
}

// Initial state generators
export function getInitialUsers(): User[] {
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  // Seed default admin account
  const defaultAdmin: User = {
    id: 'user_admin_01',
    email: DEFAULT_ADMIN_EMAIL,
    fullName: 'Family Admin',
    whatsapp: '',
    notificationPref: 'both',
    status: 'approved',
    role: 'admin',
    createdAt: '2021-01-01T00:00:00.000Z',
    lastActive: Date.now(),
  };

  const initial = [defaultAdmin];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initial));
  return initial;
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  broadcastUpdate('USERS_UPDATED', users);
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as User;
    // Always refresh with latest status from users table
    const allUsers = getInitialUsers();
    const latest = allUsers.find((u) => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase());
    return latest || parsed;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  broadcastUpdate('AUTH_STATE_CHANGED', user);
}

// NEWS
export function getNews(): NewsItem[] {
  const stored = localStorage.getItem(STORAGE_KEYS.NEWS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveNews(items: NewsItem[]): void {
  localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(items));
  broadcastUpdate('NEWS_UPDATED', items);
}

// MEDIA
export function getMedia(): MediaItem[] {
  const stored = localStorage.getItem(STORAGE_KEYS.MEDIA);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveMedia(items: MediaItem[]): void {
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));
  broadcastUpdate('MEDIA_UPDATED', items);
}

// CALENDAR
export function getEvents(): CalendarEvent[] {
  const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveEvents(items: CalendarEvent[]): void {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(items));
  broadcastUpdate('EVENTS_UPDATED', items);
}

// SHARE POSTS
export function getSharePosts(): SharePost[] {
  const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveSharePosts(items: SharePost[]): void {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(items));
  broadcastUpdate('POSTS_UPDATED', items);
}

// CHAT
export function getChatMessages(): ChatMessage[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CHAT);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveChatMessages(items: ChatMessage[]): void {
  localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(items));
  broadcastUpdate('CHAT_UPDATED', items);
}

// HISTORY ("Our story began in 2021")
export function getHistoryMemories(): HistoryMemory[] {
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  // Starts with one entry: "2021 · BMF begins"
  const initial: HistoryMemory[] = [
    {
      id: 'mem_2021_init',
      year: 2021,
      title: 'BMF begins',
      text: 'BMF is the best mate family. Our story began in 2021.',
      createdAt: '2021-01-01T12:00:00.000Z',
      authorName: 'BMF Family',
    },
  ];
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(initial));
  return initial;
}

export function saveHistoryMemories(items: HistoryMemory[]): void {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(items));
  broadcastUpdate('HISTORY_UPDATED', items);
}
