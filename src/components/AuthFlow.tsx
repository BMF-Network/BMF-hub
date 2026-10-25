import React, { useState } from 'react';
import { User } from '../types';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { DEFAULT_ADMIN_EMAIL } from '../utils/storage';

interface AuthFlowProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
  onRegisterUser: (newUser: User) => void;
}

type AuthStep = 'enter_email' | 'link_sent' | 'name_and_code' | 'pending_approval' | 'admin_verify';

export const AuthFlow: React.FC<AuthFlowProps> = ({
  onLoginSuccess,
  users,
  onRegisterUser,
}) => {
  const [step, setStep] = useState<AuthStep>('enter_email');
  const [email, setEmail] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notificationPref, setNotificationPref] = useState<'both' | 'email' | 'whatsapp'>('both');
  const [familyCode, setFamilyCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // 1. Submit Email to get sign-in link
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Call server endpoint
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      await res.json();

      // Check if this email is already registered
      const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (existing) {
        if (existing.status === 'pending') {
          setPendingUser(existing);
          setStep('pending_approval');
        } else if (existing.status === 'approved') {
          // Approved member -> sign in
          onLoginSuccess(existing);
        } else {
          setError('Your membership request was declined. Please contact the admin.');
        }
      } else {
        // New member -> show link sent confirmation
        setStep('link_sent');
      }
    } catch {
      // Graceful fallback if server unavailable
      const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (existing && existing.status === 'approved') {
        onLoginSuccess(existing);
      } else if (existing && existing.status === 'pending') {
        setPendingUser(existing);
        setStep('pending_approval');
      } else {
        setStep('link_sent');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Member opens link -> proceeds to register name and family code
  const handleOpenEmailLink = () => {
    setError(null);
    setStep('name_and_code');
  };

  // 3. Submit real full name + family code (checked server-side)
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.split(' ').filter(Boolean).length < 2) {
      setError('Please enter your real full name (both first and last name).');
      return;
    }

    if (!familyCode.trim()) {
      setError('Please enter the secret family code.');
      return;
    }

    setLoading(true);

    try {
      // SERVER-SIDE CODE VERIFICATION: never purely validated in browser
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: familyCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.message || 'Incorrect family code. Please check with your family admin.');
        setLoading(false);
        return;
      }

      // Check if user is configured as admin
      const isAdminEmail = email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();

      const newUser: User = {
        id: 'usr_' + Date.now(),
        email: email.trim().toLowerCase(),
        fullName: trimmedName,
        whatsapp: whatsapp.trim() || undefined,
        notificationPref: notificationPref,
        // Admin is automatically approved, others start as pending
        status: isAdminEmail ? 'approved' : 'pending',
        role: isAdminEmail ? 'admin' : 'member',
        createdAt: new Date().toISOString(),
        lastActive: Date.now(),
      };

      onRegisterUser(newUser);

      if (newUser.status === 'approved') {
        onLoginSuccess(newUser);
      } else {
        setPendingUser(newUser);
        setStep('pending_approval');
      }
    } catch {
      setError('Unable to verify code with server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Switch to Admin Verification step
  const handleOpenAdminVerify = () => {
    setError(null);
    setAdminEmailInput('');
    setStep('admin_verify');
  };

  // Strictly verify that the email is concorderuhungande@gmail.com and ONLY that before entering
  const handleVerifyAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = adminEmailInput.trim().toLowerCase();
    const authorizedOnly = 'concorderuhungande@gmail.com'.toLowerCase();

    // Confirm that the email is that ONLY
    if (trimmed !== authorizedOnly) {
      setError('Verification failed: Access denied. Only concorderuhungande@gmail.com is authorized as administrator.');
      return;
    }

    setLoading(true);

    try {
      // Confirm with server endpoint before entering
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        setError(data.message || 'Server rejected administrator authorization.');
        setLoading(false);
        return;
      }

      // Confirmed! Find or initialize the administrator user
      const admin = users.find((u) => u.email.toLowerCase() === authorizedOnly) || {
        id: 'usr_admin',
        email: 'concorderuhungande@gmail.com',
        fullName: 'Concorde (Family Admin)',
        whatsapp: '+44 7000 000000',
        notificationPref: 'both',
        status: 'approved',
        role: 'admin',
        createdAt: '2021-01-01T00:00:00Z',
        lastActive: Date.now(),
      };

      onLoginSuccess(admin);
    } catch {
      setError('Server connection error during admin verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F5F6FA] dark:bg-[#111227] flex flex-col justify-center items-center p-4 overflow-hidden">
      {/* FAINT BIG COPY OF LOGO IN BACKGROUND (Design requirement: large, with a faint big copy in the background) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] dark:opacity-[0.03] select-none overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="/assets/aistudio/file_0000000091b48211a5f5bca86c5b1c54_d466055e.jpg"
          alt=""
          className="w-[180vw] max-w-[900px] object-contain scale-125"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Brand Card */}
        <div className="bg-white dark:bg-[#1a1b35] rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(34,36,74,0.08)] border border-slate-100 dark:border-slate-800 text-center">
          {/* Logo (Large) */}
          <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#22244A] p-3 shadow-lg flex items-center justify-center border-2 border-[#E2B04A] mb-4">
            <img
              src="/assets/aistudio/file_0000000091b48211a5f5bca86c5b1c54_d466055e.jpg"
              alt="BMF Logo"
              className="w-full h-full object-contain filter-logo-white"
            />
          </div>

          {/* Heading */}
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#22244A] dark:text-white tracking-tight mb-1">
            BMF Family Hub
          </h1>

          {/* Motto in Great Vibes script */}
          <p className="font-motto text-[#E2B04A] text-2xl sm:text-3xl mb-1">
            Our love never fail
          </p>

          {/* Tagline */}
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 tracking-wide">
            The best mate family · Since 2021
          </p>

          <div className="gold-underline w-16 mx-auto mb-6" />

          {/* Error notice */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'enter_email' && (
            <form onSubmit={handleSendLink} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Member Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A] focus:border-transparent transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  We will send a private sign-in link to your email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#22244A] hover:bg-[#2c2f60] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Sign-in Link'}
                <ArrowRight className="w-4 h-4 text-[#E2B04A]" />
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={handleOpenAdminVerify}
                  className="text-xs text-[#22244A] dark:text-[#E2B04A] hover:underline font-semibold flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Family Admin Login
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Link Sent confirmation (with simulated link opening) */}
          {step === 'link_sent' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">
                Check Your Email
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                A private sign-in link has been sent to <span className="font-semibold text-[#22244A] dark:text-[#E2B04A]">{email}</span>.
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#22244A] dark:text-[#E2B04A] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Simulate Email Link Click
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Click below to open the link and complete your registration details.
                </p>
                <button
                  type="button"
                  onClick={handleOpenEmailLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#E2B04A] hover:bg-[#ecc058] text-[#121324] font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  Open Sign-in Link Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep('enter_email')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* STEP 3: Enter Real Full Name and Family Code */}
          {step === 'name_and_code' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4 text-left">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E2B04A]">
                  New Member Setup
                </span>
                <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-1">
                  Complete Your Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Please enter your real full name and family code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Real Full Name (First and Last) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Sarah Johnson"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+44 7123 456789"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
                <span className="text-[10px] text-slate-400">
                  Private: only you and the admin can see your phone number.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family Code *
                </label>
                <input
                  type="text"
                  required
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  placeholder="Enter secret family code"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2B04A] bg-amber-50/20 dark:bg-amber-950/20 text-slate-800 dark:text-slate-100 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
                <span className="text-[10px] text-slate-400">
                  Verified server-side: provided by family admin.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['both', 'email', 'whatsapp'] as const).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setNotificationPref(pref)}
                      className={`py-2 px-1 text-xs rounded-xl font-medium border capitalize text-center transition ${
                        notificationPref === pref
                          ? 'bg-[#22244A] text-[#E2B04A] border-[#22244A] font-bold'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#22244A] hover:bg-[#2c2f60] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 mt-2"
              >
                {loading ? 'Verifying with server...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4 text-[#E2B04A]" />
              </button>

              <button
                type="button"
                onClick={() => setStep('enter_email')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline pt-1"
              >
                Back to email
              </button>
            </form>
          )}

          {/* STEP 4: Pending Admin Approval */}
          {step === 'pending_approval' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-[#E2B04A] flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7 animate-spin-slow" />
              </div>

              <h3 className="font-heading font-bold text-xl text-[#22244A] dark:text-white">
                Pending Admin Approval
              </h3>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-200 leading-relaxed text-left space-y-2">
                <p>
                  <strong>Welcome to BMF Family Hub!</strong>
                </p>
                <p>
                  Your registration for <span className="font-semibold">{pendingUser?.fullName || 'new member'}</span> has been submitted.
                </p>
                <p>
                  To keep our family space safe and private, new members must be approved by the family admin before gaining access.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Check if approved in users list
                    const fresh = users.find((u) => u.email.toLowerCase() === (pendingUser?.email.toLowerCase() || email.toLowerCase()));
                    if (fresh && fresh.status === 'approved') {
                      onLoginSuccess(fresh);
                    } else {
                      setError('Still pending admin approval. Please check back shortly.');
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#22244A] text-white text-xs font-semibold hover:bg-[#2c2f60] transition"
                >
                  Refresh Approval Status
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('enter_email');
                    setEmail('');
                    setPendingUser(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                >
                  Log out / Return to login
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Administrator Identity Verification */}
          {step === 'admin_verify' && (
            <div className="space-y-4 text-left">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#E2B04A] text-[#121324] flex items-center justify-center mx-auto mb-2 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-[#22244A] dark:text-white">
                  Administrator Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm administrator credentials before entering
                </p>
              </div>

              <form onSubmit={handleVerifyAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Authorized Administrator Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      placeholder="concorderuhungande@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Security Policy: Verified against server. Only the designated administrator email is granted access.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#22244A] hover:bg-[#2c2f60] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying with server...' : 'Verify Email & Enter'}
                    <ArrowRight className="w-4 h-4 text-[#E2B04A]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('enter_email');
                      setError(null);
                    }}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline pt-1"
                  >
                    Return to member login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
