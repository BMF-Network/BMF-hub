import React from 'react';
import { User, TabType } from '../types';
import { ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  pendingCount: number;
  currentTab: TabType;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenProfile,
  onOpenAdmin,
  onLogout,
  pendingCount,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#22244A] text-white shadow-md border-b border-[#E2B04A]/25 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand: White version of BMF Logo + Title + Script Motto */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 p-1 shrink-0">
            <img
              src="/assets/aistudio/file_0000000091b48211a5f5bca86c5b1c54_d466055e.jpg"
              alt="BMF Logo"
              className="w-full h-full object-contain filter-logo-white"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                BMF <span className="text-[#E2B04A] font-normal">Family Hub</span>
              </span>
              {isAdmin && (
                <span className="hidden sm:inline-flex text-[10px] font-semibold bg-[#E2B04A]/20 text-[#F5D982] border border-[#E2B04A]/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="font-motto text-[#E2B04A] text-base leading-none -mt-0.5 tracking-wide">
              Our love never fail
            </p>
          </div>
        </div>

        {/* Action buttons: Admin (if admin), Profile, and Log out */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#E2B04A] text-[#121324] hover:bg-[#ebd27a] transition-colors shadow-sm"
              title="Admin Member Management"
              aria-label="Admin Member Management"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden xs:inline">Admin</span>
              {pendingCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-100 border border-white/10 transition-colors"
            title="Profile"
            aria-label="Profile"
          >
            <UserIcon className="w-4 h-4 text-[#E2B04A]" />
            <span className="hidden sm:inline">Profile</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
