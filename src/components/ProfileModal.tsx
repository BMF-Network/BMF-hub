import React, { useState } from 'react';
import { User, NotificationPreference } from '../types';
import { X, User as UserIcon, Mail, Phone, Bell, Shield, Check } from 'lucide-react';

interface ProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateUser: (updated: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  onClose,
  onUpdateUser,
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp || '');
  const [notificationPref, setNotificationPref] = useState<NotificationPreference>(currentUser.notificationPref);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.split(' ').filter(Boolean).length < 2) {
      setError('Please provide your real full name (both first and last name).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      fullName: trimmedName,
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.trim() || undefined,
      notificationPref,
      lastActive: Date.now(),
    };

    onUpdateUser(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1b35] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition"
          aria-label="Close Profile"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#22244A] text-[#E2B04A] flex items-center justify-center text-lg font-bold shadow-md">
            {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-[#22244A] dark:text-white">
              Member Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your personal family information
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mb-5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <Shield className="w-4 h-4 shrink-0 text-[#E2B04A] mt-0.5" />
          <span>
            <strong>Family Privacy Guarantee:</strong> Emails and WhatsApp numbers are private. Only you and the admin can view them. Other family members only see your real full name.
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Real Full Name (First and Last)
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Private Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp Number (with Country Code)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+44 7123 456789"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#E2B04A]" />
              How would you like to receive family notices?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'both', label: 'Email & WhatsApp' },
                { id: 'email', label: 'Email Only' },
                { id: 'whatsapp', label: 'WhatsApp Only' },
                { id: 'none', label: 'Unsubscribe' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setNotificationPref(opt.id as NotificationPreference)}
                  className={`p-2 rounded-xl text-xs font-medium border text-left transition flex items-center justify-between ${
                    notificationPref === opt.id
                      ? 'bg-[#22244A] text-white border-[#22244A] font-semibold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {notificationPref === opt.id && <Check className="w-3.5 h-3.5 text-[#E2B04A]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
