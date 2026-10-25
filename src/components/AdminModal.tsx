import React, { useState } from 'react';
import { User, NotificationLog } from '../types';
import { X, ShieldCheck, CheckCircle2, UserX, Clock, Bell, Trash2, Mail, Phone } from 'lucide-react';

interface AdminModalProps {
  currentUser: User;
  users: User[];
  onApproveMember: (userId: string) => void;
  onRejectMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onClose: () => void;
  notificationLogs: NotificationLog[];
}

export const AdminModal: React.FC<AdminModalProps> = ({
  currentUser,
  users,
  onApproveMember,
  onRejectMember,
  onRemoveMember,
  onClose,
  notificationLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'notifications'>('members');

  if (currentUser.role !== 'admin') {
    return null;
  }

  const pendingMembers = users.filter((u) => u.status === 'pending');
  const approvedMembers = users.filter((u) => u.status === 'approved' && u.id !== currentUser.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1b35] rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E2B04A] text-[#121324] flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#22244A] dark:text-white">
                Admin Management Screen
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Member Approvals &amp; Access Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'members'
                ? 'bg-white dark:bg-[#22244A] text-[#22244A] dark:text-[#E2B04A] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Family Members
            {pendingMembers.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-extrabold">
                {pendingMembers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-[#22244A] text-[#22244A] dark:text-[#E2B04A] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Dispatch Logs
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {activeTab === 'members' && (
            <>
              {/* Pending section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-[#E2B04A] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Approvals ({pendingMembers.length})
                  </h3>
                </div>

                {pendingMembers.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No registrations currently waiting for approval.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {member.fullName}
                          </h4>
                          {/* Private contact details: Admin CAN view them */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {member.email}
                            </span>
                            {member.whatsapp && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-500" />
                                {member.whatsapp}
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-[10px] bg-amber-200/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full mt-1.5 font-medium">
                            Notices: {member.notificationPref}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => onApproveMember(member.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => onRejectMember(member.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approved Members section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Approved Family Members ({approvedMembers.length + 1})
                </h3>

                <div className="space-y-2">
                  {/* Current Admin entry */}
                  <div className="p-3 rounded-2xl bg-[#22244A]/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {currentUser.fullName}
                        </span>
                        <span className="text-[10px] bg-[#E2B04A] text-[#121324] font-bold px-1.5 py-0.5 rounded">
                          Admin (You)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {approvedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {member.fullName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{member.email}</span>
                          {member.whatsapp && <span>· {member.whatsapp}</span>}
                          <span>· Notice: {member.notificationPref}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Remove member "${member.fullName}" from the family hub?`)) {
                            onRemoveMember(member.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <strong>Automatic Notifications:</strong> Whenever the admin posts in News, uploads Media, or adds a Calendar event, email notices (Trigger Email from Firestore) and WhatsApp alerts (WhatsApp Business API) are automatically sent to approved members.
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Automatic Dispatches
              </h4>

              {notificationLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No automated notifications dispatched yet. Post News, add a Calendar event, or upload Media to trigger alerts.
                </div>
              ) : (
                <div className="space-y-2">
                  {notificationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-white">
                          [{log.type.toUpperCase()}] {log.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {log.body}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400">
                        <span>Delivered to {log.recipientsCount} recipient(s)</span>
                        <span>
                          {log.emailRecipients.length} Email(s) · {log.whatsAppRecipients.length} WhatsApp
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
