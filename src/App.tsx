import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  TabType,
  NewsItem,
  MediaItem,
  CalendarEvent,
  SharePost,
  ChatMessage,
  HistoryMemory,
  NotificationLog,
} from './types';
import {
  getCurrentUser,
  saveCurrentUser,
  getInitialUsers,
  saveUsers,
  getNews,
  saveNews,
  getMedia,
  saveMedia,
  getEvents,
  saveEvents,
  getSharePosts,
  saveSharePosts,
  getChatMessages,
  saveChatMessages,
  getHistoryMemories,
  saveHistoryMemories,
  subscribeToUpdates,
  DEFAULT_ADMIN_EMAIL,
} from './utils/storage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TabBar } from './components/TabBar';
import { AuthFlow } from './components/AuthFlow';
import { ProfileModal } from './components/ProfileModal';
import { AdminModal } from './components/AdminModal';
import { MediaTab } from './components/tabs/MediaTab';
import { NewsTab } from './components/tabs/NewsTab';
import { CalendarTab } from './components/tabs/CalendarTab';
import { ShareTab } from './components/tabs/ShareTab';
import { ChatTab } from './components/tabs/ChatTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { CheckCircle2, Bell } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => getInitialUsers());
  const [currentTab, setCurrentTab] = useState<TabType>('share');

  // Tab Data States
  const [news, setNews] = useState<NewsItem[]>(() => getNews());
  const [media, setMedia] = useState<MediaItem[]>(() => getMedia());
  const [events, setEvents] = useState<CalendarEvent[]>(() => getEvents());
  const [sharePosts, setSharePosts] = useState<SharePost[]>(() => getSharePosts());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getChatMessages());
  const [memories, setMemories] = useState<HistoryMemory[]>(() => getHistoryMemories());
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);

  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Cross-tab real-time sync listener
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((type, payload) => {
      switch (type) {
        case 'USERS_UPDATED':
          if (Array.isArray(payload)) setUsers(payload as User[]);
          break;
        case 'NEWS_UPDATED':
          if (Array.isArray(payload)) setNews(payload as NewsItem[]);
          break;
        case 'MEDIA_UPDATED':
          if (Array.isArray(payload)) setMedia(payload as MediaItem[]);
          break;
        case 'EVENTS_UPDATED':
          if (Array.isArray(payload)) setEvents(payload as CalendarEvent[]);
          break;
        case 'POSTS_UPDATED':
          if (Array.isArray(payload)) setSharePosts(payload as SharePost[]);
          break;
        case 'CHAT_UPDATED':
          if (Array.isArray(payload)) setChatMessages(payload as ChatMessage[]);
          break;
        case 'HISTORY_UPDATED':
          if (Array.isArray(payload)) setMemories(payload as HistoryMemory[]);
          break;
        case 'AUTH_STATE_CHANGED':
          setCurrentUser(getCurrentUser());
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  // Heartbeat: update lastActive every 20 seconds for Online Now indicators
  useEffect(() => {
    if (!currentUser || currentUser.status !== 'approved') return;

    const interval = setInterval(() => {
      const now = Date.now();
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === currentUser.id ? { ...u, lastActive: now } : u));
        saveUsers(next);
        return next;
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Dispatch automated notifications helper for Admin actions
  const dispatchNotification = useCallback(
    async (eventType: 'news' | 'calendar' | 'media', title: string, message: string) => {
      try {
        const res = await fetch('/api/notifications/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType,
            title,
            message,
            members: users,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.log) {
            setNotificationLogs((prev) => [data.log, ...prev].slice(0, 30));
          }
          showToast(
            `Automated notice sent to approved members (${data.deliveredEmails || 0} Emails, ${data.deliveredWhatsApp || 0} WhatsApps)`
          );
        }
      } catch {
        // Fallback local notification log
        const logEntry: NotificationLog = {
          id: 'local_notif_' + Date.now(),
          type: eventType,
          title,
          body: message,
          timestamp: new Date().toISOString(),
          recipientsCount: users.filter((u) => u.status === 'approved').length,
          emailRecipients: users.filter((u) => u.status === 'approved' && u.email).map((u) => u.email),
          whatsAppRecipients: users.filter((u) => u.status === 'approved' && u.whatsapp).map((u) => u.whatsapp!),
        };
        setNotificationLogs((prev) => [logEntry, ...prev]);
        showToast(`Notified family members via preferred channels.`);
      }
    },
    [users]
  );

  // Authentication Handlers
  const handleLoginSuccess = (user: User) => {
    saveCurrentUser(user);
    setCurrentUser(user);
    // Refresh user's lastActive
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === user.id ? { ...u, lastActive: Date.now() } : u));
      saveUsers(updated);
      return updated;
    });
  };

  const handleRegisterUser = (newUser: User) => {
    const updatedUsers = [...users.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase()), newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const handleLogout = () => {
    saveCurrentUser(null);
    setCurrentUser(null);
  };

  const handleUpdateProfile = (updated: User) => {
    saveCurrentUser(updated);
    setCurrentUser(updated);
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === updated.id ? updated : u));
      saveUsers(next);
      return next;
    });
    showToast('Profile updated successfully.');
  };

  // Admin Member Actions
  const handleApproveMember = (userId: string) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, status: 'approved' as const } : u));
      saveUsers(next);
      return next;
    });
    showToast('Member approved and granted access.');
  };

  const handleRejectMember = (userId: string) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, status: 'rejected' as const } : u));
      saveUsers(next);
      return next;
    });
    showToast('Member registration declined.');
  };

  const handleRemoveMember = (userId: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      saveUsers(next);
      return next;
    });
    showToast('Member removed from family group.');
  };

  // News Actions
  const handleAddNews = async (item: Omit<NewsItem, 'id' | 'createdAt' | 'authorName'>) => {
    if (!currentUser) return;
    const newItem: NewsItem = {
      ...item,
      id: 'news_' + Date.now(),
      createdAt: new Date().toISOString(),
      authorName: currentUser.fullName,
    };

    const nextNews = [newItem, ...news];
    setNews(nextNews);
    saveNews(nextNews);

    // Automated notification to members
    await dispatchNotification('news', newItem.title, newItem.message);
  };

  // Media Actions
  const handleAddMedia = async (item: Omit<MediaItem, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploaderName'>) => {
    if (!currentUser) return;
    const newMedia: MediaItem = {
      ...item,
      id: 'media_' + Date.now(),
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.id,
      uploaderName: currentUser.fullName,
    };

    const nextMedia = [newMedia, ...media];
    setMedia(nextMedia);
    saveMedia(nextMedia);

    // Automated notification to members
    await dispatchNotification('media', `New Family ${item.type === 'video' ? 'Video' : 'Photo'} Added`, newMedia.title);
  };

  // Calendar Actions
  const handleAddEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!currentUser) return;
    const newEvent: CalendarEvent = {
      ...event,
      id: 'event_' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    const nextEvents = [...events, newEvent];
    setEvents(nextEvents);
    saveEvents(nextEvents);

    // Automated notification to members
    await dispatchNotification(
      'calendar',
      `New Event: ${newEvent.title}`,
      `Scheduled for ${newEvent.date}${newEvent.time ? ` at ${newEvent.time}` : ''}`
    );
  };

  // Share Actions
  const handleAddSharePost = async (post: Omit<SharePost, 'id' | 'createdAt' | 'userId' | 'userName'>) => {
    if (!currentUser) return;
    const newPost: SharePost = {
      ...post,
      id: 'post_' + Date.now(),
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.fullName,
    };

    const nextPosts = [newPost, ...sharePosts];
    setSharePosts(nextPosts);
    saveSharePosts(nextPosts);
    showToast('Shared to family feed!');
  };

  const handleDeleteSharePost = (postId: string) => {
    const nextPosts = sharePosts.filter((p) => p.id !== postId);
    setSharePosts(nextPosts);
    saveSharePosts(nextPosts);
    showToast('Post deleted.');
  };

  // Chat Actions
  const handleSendMessage = (text: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      text,
      userId: currentUser.id,
      userName: currentUser.fullName,
      timestamp: new Date().toISOString(),
    };

    const nextChat = [...chatMessages, newMsg];
    setChatMessages(nextChat);
    saveChatMessages(nextChat);
  };

  // History Actions
  const handleAddMemory = async (memory: Omit<HistoryMemory, 'id' | 'createdAt' | 'authorName'>) => {
    if (!currentUser) return;
    const newMem: HistoryMemory = {
      ...memory,
      id: 'mem_' + Date.now(),
      createdAt: new Date().toISOString(),
      authorName: currentUser.fullName,
    };

    const nextMems = [...memories, newMem];
    setMemories(nextMems);
    saveHistoryMemories(nextMems);
    showToast('Memory added to family history!');
  };

  // Security gate: If no current user or user is not approved, show Login / Sign-up / Pending flow
  if (!currentUser || currentUser.status !== 'approved') {
    return (
      <AuthFlow
        onLoginSuccess={handleLoginSuccess}
        users={users}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const onlineCount = users.filter((u) => u.status === 'approved' && Date.now() - (u.lastActive || 0) < 65000).length;

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#111227] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#22244A] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#E2B04A] text-xs font-semibold flex items-center gap-2 animate-bounce-short max-w-sm text-center">
          <Bell className="w-4 h-4 text-[#E2B04A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        onOpenProfile={() => setShowProfile(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onLogout={handleLogout}
        pendingCount={pendingCount}
        currentTab={currentTab}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {currentTab === 'media' && (
          <MediaTab
            media={media}
            currentUser={currentUser}
            onAddMedia={handleAddMedia}
          />
        )}

        {currentTab === 'news' && (
          <NewsTab
            news={news}
            currentUser={currentUser}
            onAddNews={handleAddNews}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarTab
            events={events}
            currentUser={currentUser}
            onAddEvent={handleAddEvent}
          />
        )}

        {currentTab === 'share' && (
          <ShareTab
            posts={sharePosts}
            currentUser={currentUser}
            onAddPost={handleAddSharePost}
            onDeletePost={handleDeleteSharePost}
          />
        )}

        {currentTab === 'chat' && (
          <ChatTab
            messages={chatMessages}
            currentUser={currentUser}
            allUsers={users}
            onSendMessage={handleSendMessage}
          />
        )}

        {currentTab === 'history' && (
          <HistoryTab
            memories={memories}
            currentUser={currentUser}
            onAddMemory={handleAddMemory}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Fixed Bottom Tab Bar (Exactly 6 Tabs) */}
      <TabBar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onlineCount={onlineCount}
      />

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setShowProfile(false)}
          onUpdateUser={handleUpdateProfile}
        />
      )}

      {/* Admin Modal */}
      {showAdmin && (
        <AdminModal
          currentUser={currentUser}
          users={users}
          onApproveMember={handleApproveMember}
          onRejectMember={handleRejectMember}
          onRemoveMember={handleRemoveMember}
          onClose={() => setShowAdmin(false)}
          notificationLogs={notificationLogs}
        />
      )}
    </div>
  );
}
