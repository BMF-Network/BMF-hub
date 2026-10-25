import React from 'react';
import { TabType } from '../types';
import {
  Image as ImageIcon,
  Megaphone,
  CalendarDays,
  HeartHandshake,
  MessageSquare,
  Clock,
} from 'lucide-react';

interface TabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onlineCount?: number;
}

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'news', label: 'News', icon: Megaphone },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'share', label: 'Share', icon: HeartHandshake },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'history', label: 'History', icon: Clock },
];

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab, onlineCount = 0 }) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#22244A]/95 dark:bg-[#111227]/95 backdrop-blur-lg border-t border-[#E2B04A]/30 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-6 h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center relative transition-all duration-200 select-none ${
                isActive
                  ? 'text-[#E2B04A]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top highlight bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[#E2B04A] rounded-full shadow-[0_0_8px_#E2B04A]" />
              )}

              <div className="relative mt-1">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {/* Chat online indicator */}
                {tab.id === 'chat' && onlineCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#22244A]" />
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 transition-all ${
                  isActive ? 'font-bold text-[#E2B04A]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
