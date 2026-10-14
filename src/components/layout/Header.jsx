import React from 'react';
import { Moon, Sun, ShieldCheck } from 'lucide-react';
import { ROLE_NAMES, TRANSLATIONS } from '../../data/initialData';

export default function Header({
  currentView,
  role,
  setRole,
  lang,
  setLang,
  isDark,
  setIsDark,
}) {
  const currentTitle = TRANSLATIONS[lang]?.[currentView] || currentView;
  const otherLanguages = ['en', 'bn', 'zh'].filter((l) => l !== lang);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 flex-wrap px-4 sm:px-8 py-3.5 bg-[#eef2ed]/90 dark:bg-[#0a1713]/90 backdrop-blur-md border-b border-[#10231c]/10 dark:border-white/10 transition-colors">
      <div>
        <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#10231c] dark:text-[#eaf0e8] tracking-tight">
          {currentTitle}
        </h1>
        <div className="flex gap-3 text-xs text-[#4b6258] dark:text-[#98b0a5] font-serif mt-0.5">
          {otherLanguages.map((l) => (
            <span key={l} lang={l} className="opacity-90">
              {TRANSLATIONS[l]?.[currentView]}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap ml-auto">
        {/* Role Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#11241d] px-2.5 py-1.5 rounded-xl border border-[#10231c]/15 dark:border-white/15 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#0b7a5a] dark:text-[#37c597]" />
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] hidden sm:inline">Role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Signed in role"
            className="text-xs font-semibold bg-transparent text-[#10231c] dark:text-[#eaf0e8] focus:outline-none cursor-pointer"
          >
            <option value="admin" className="bg-white dark:bg-[#11241d]">General manager</option>
            <option value="front" className="bg-white dark:bg-[#11241d]">Front desk</option>
            <option value="cashier" className="bg-white dark:bg-[#11241d]">Outlet cashier</option>
            <option value="hr" className="bg-white dark:bg-[#11241d]">HR and accounts</option>
          </select>
        </div>

        {/* Trilingual Toggle */}
        <div
          role="group"
          aria-label="Language selector"
          className="flex border border-[#10231c]/15 dark:border-white/15 rounded-full overflow-hidden bg-white/70 dark:bg-[#11241d]/70 p-0.5 shadow-xs"
        >
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              lang === 'en'
                ? 'bg-[#10231c] text-[#eef2ed] dark:bg-[#eaf0e8] dark:text-[#0a1713] font-semibold shadow-xs'
                : 'text-[#4b6258] dark:text-[#98b0a5] hover:text-[#10231c]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('bn')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              lang === 'bn'
                ? 'bg-[#10231c] text-[#eef2ed] dark:bg-[#eaf0e8] dark:text-[#0a1713] font-semibold shadow-xs'
                : 'text-[#4b6258] dark:text-[#98b0a5] hover:text-[#10231c]'
            }`}
          >
            বাং
          </button>
          <button
            type="button"
            onClick={() => setLang('zh')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              lang === 'zh'
                ? 'bg-[#10231c] text-[#eef2ed] dark:bg-[#eaf0e8] dark:text-[#0a1713] font-semibold shadow-xs'
                : 'text-[#4b6258] dark:text-[#98b0a5] hover:text-[#10231c]'
            }`}
          >
            中文
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-xl bg-white dark:bg-[#11241d] border border-[#10231c]/15 dark:border-white/15 text-[#4b6258] dark:text-[#98b0a5] hover:text-[#10231c] dark:hover:text-white transition-colors shadow-xs"
        >
          {isDark ? <Sun className="w-4 h-4 text-[#e8b04a]" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
