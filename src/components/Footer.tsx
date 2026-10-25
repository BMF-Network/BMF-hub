import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#1b1c3a] dark:bg-[#0c0d1c] text-slate-300 py-8 px-4 border-t border-[#E2B04A]/20 pb-24 text-center">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-white/5 p-2 border border-white/10 flex items-center justify-center mb-3 shadow-inner">
          <img
            src="/assets/aistudio/file_0000000091b48211a5f5bca86c5b1c54_d466055e.jpg"
            alt="BMF Monogram"
            className="w-full h-full object-contain filter-logo-white opacity-90"
          />
        </div>

        {/* Motto in Great Vibes script */}
        <p className="font-motto text-[#E2B04A] text-2xl tracking-wide mb-1">
          Our love never fail
        </p>

        {/* Tagline */}
        <p className="font-body text-xs font-medium text-slate-400 tracking-wider">
          The best mate family · Since 2021
        </p>

        <div className="mt-4 pt-3 border-t border-white/10 w-32 flex justify-center">
          <span className="text-[11px] text-slate-500">
            Private Family Sanctuary
          </span>
        </div>
      </div>
    </footer>
  );
};
