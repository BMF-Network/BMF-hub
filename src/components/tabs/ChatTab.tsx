import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../../types';
import { Send, MessageSquare, Shield, Smile } from 'lucide-react';

interface ChatTabProps {
  messages: ChatMessage[];
  currentUser: User;
  allUsers: User[];
  onSendMessage: (text: string) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  currentUser,
  allUsers,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Compute Online Now members based on heartbeat (within last 60 seconds)
  const now = Date.now();
  const onlineMembers = allUsers.filter(
    (u) => u.status === 'approved' && u.lastActive && now - u.lastActive < 65000
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12.5rem)] min-h-[500px] max-h-[750px] bg-white dark:bg-[#1a1b35] rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 overflow-hidden mb-20">
      {/* Top Header: Title & Online Now Members */}
      <div className="p-4 bg-slate-50/70 dark:bg-[#14152b] border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#22244A] dark:text-white gold-underline">
              Family Real-Time Chat
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Private and encrypted family room
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {onlineMembers.length} Online Now
          </span>
        </div>

        {/* Online Now avatars list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {onlineMembers.map((member) => {
            const isMe = member.id === currentUser.id;
            return (
              <div
                key={member.id}
                className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs"
                title={`${member.fullName}${isMe ? ' (You)' : ''}`}
              >
                {/* Round circle with first initial and green dot */}
                <div className="relative w-6 h-6 rounded-full bg-[#22244A] text-[#E2B04A] flex items-center justify-center text-[10px] font-bold">
                  {member.fullName.charAt(0).toUpperCase()}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1.5 ring-white dark:ring-slate-800" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[80px]">
                  {member.fullName.split(' ')[0]}
                  {isMe && ' (You)'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFBFD] dark:bg-[#121326]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-700 dark:text-slate-200 mb-1">
              No messages yet
            </h4>
            <p className="text-xs max-w-xs leading-relaxed">
              Say hello to the family! Send the first message in our private group chat.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender name for others */}
                {!isMe && (
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 ml-1 mb-1">
                    {msg.userName}
                  </span>
                )}

                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                    isMe
                      ? 'bg-[#22244A] text-white rounded-br-xs'
                      : 'bg-white dark:bg-[#20213d] text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <div
                    className={`text-[9px] mt-1 text-right select-none ${
                      isMe ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white dark:bg-[#1a1b35] border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message as ${currentUser.fullName}...`}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-2xl bg-[#22244A] text-[#E2B04A] hover:bg-[#2c2f60] transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
