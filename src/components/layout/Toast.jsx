import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl bg-[#10231c] text-[#eef2ed] dark:bg-[#eaf0e8] dark:text-[#0a1713] border border-white/10 dark:border-black/10 animate-slide-in max-w-[90vw]"
    >
      <CheckCircle2 className="w-4 h-4 text-[#37c597] dark:text-[#0b7a5a] shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}
