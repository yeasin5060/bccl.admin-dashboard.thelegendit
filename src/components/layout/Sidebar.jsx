import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BedDouble,
  UtensilsCrossed,
  Dumbbell,
  CreditCard,
  BarChart3,
  CalendarDays,
} from 'lucide-react';
import { ROLE_VIEWS, TRANSLATIONS } from '../../data/initialData';

const NAV_ITEMS = [
  { id: 'dash', icon: LayoutDashboard },
  { id: 'members', icon: Users },
  { id: 'staff', icon: Briefcase },
  { id: 'stay', icon: BedDouble },
  { id: 'pos', icon: UtensilsCrossed },
  { id: 'fit', icon: Dumbbell },
  { id: 'pay', icon: CreditCard },
  { id: 'rep', icon: BarChart3 },
  { id: 'events', icon: CalendarDays },
];

export default function Sidebar({ currentView, setView, role, lang }) {
  const allowedViews = ROLE_VIEWS[role] || [];

  return (
    <aside className="sticky top-0 z-40 h-auto md:h-screen w-full md:w-64 bg-[#07140f] text-[#dfe9e2] flex flex-row md:flex-col p-3 md:p-4 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 shrink-0">
      {/* Brand logo & header */}
      <div className="flex items-center gap-3 pb-0 md:pb-5 px-1 md:px-2 border-b-0 md:border-b border-white/10">
        <div className="relative shrink-0">
          <svg viewBox="0 0 40 40" className="w-10 h-10 shadow-md rounded-xl" aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="#0b6e52" />
            <circle cx="18" cy="20" r="8.5" fill="#e0412f" />
            <path
              d="M4 33 Q20 19 36 33"
              fill="none"
              stroke="#e8b04a"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="hidden sm:block">
          <b className="font-serif text-lg tracking-wide text-white block leading-tight">
            BCC Club OS
          </b>
          <small className="text-[10px] text-[#8fa89c] block mt-0.5 tracking-tight font-sans">
            বাংলাদেশ চীন ক্লাব · 孟中俱乐部
          </small>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-row md:flex-col gap-1.5 my-0 md:my-4 flex-1 items-center md:items-stretch overflow-x-auto md:overflow-x-visible">
        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const isAllowed = allowedViews.includes(id);
          const isActive = currentView === id;
          const label = TRANSLATIONS[lang]?.[id] || id;

          return (
            <button
              key={id}
              disabled={!isAllowed}
              onClick={() => {
                if (isAllowed) setView(id);
              }}
              title={!isAllowed ? 'Not available for this role' : label}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left whitespace-nowrap md:w-full ${
                isActive
                  ? 'bg-[#12332a] text-white shadow-[inset_3px_0_0_#e0412f]'
                  : isAllowed
                  ? 'text-[#b8cbc1] hover:bg-[#0f261e] hover:text-white'
                  : 'opacity-30 cursor-not-allowed text-[#72857a]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 stroke-[2]" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="hidden md:block mt-auto pt-4 border-t border-white/10 text-[11px] text-[#7f998d]">
        <div className="lattice-pattern h-10 rounded-lg mb-2.5 border border-[#e8b04a]/20 shadow-inner" />
        <div className="flex items-center justify-between text-[11px]">
          <span>Bangladesh China Club Ltd</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-[10px] text-[#5d756a] mt-1">
          Interactive demo · Data state maintained in memory.
        </p>
      </div>
    </aside>
  );
}
