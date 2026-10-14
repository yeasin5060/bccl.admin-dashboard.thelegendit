import React from 'react';
import { X, Calendar, MapPin, Users, CheckSquare, Square, Ticket } from 'lucide-react';
import { formatMoney } from '../../data/initialData';

export default function EventDetailModal({
  isOpen,
  onClose,
  event,
  onToggleChecklist,
  onRegisterMember,
}) {
  if (!isOpen || !event) return null;

  const totalTasks = event.chk?.length || 1;
  const completedTasks = event.chk?.filter((c) => c.d)?.length || 0;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);
  const ticketRevenue = (event.reg || 0) * (event.price || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#11241d] text-[#10231c] dark:text-[#eaf0e8] w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 relative animate-slide-in max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#e2eae4] dark:bg-[#183029] flex items-center justify-center text-[#4b6258] dark:text-[#98b0a5] hover:text-[#10231c] dark:hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif font-bold text-2xl tracking-tight">{event.n}</h3>

        <div className="flex flex-wrap gap-4 text-xs text-[#4b6258] dark:text-[#98b0a5] my-2">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0b7a5a] dark:text-[#37c597]" />
            {event.d} at {event.t}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#c8321f]" />
            {event.venue}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#e8b04a]" />
            {event.reg} of {event.cap} registered ({formatMoney(ticketRevenue)} revenue)
          </span>
        </div>

        {/* Progress bar */}
        <div className="my-4">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Preparation & Logistics Readiness</span>
            <span className="text-[#0b7a5a] dark:text-[#37c597]">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#e2eae4] dark:bg-[#183029] overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#0b7a5a] to-[#e8b04a] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4b6258] dark:text-[#98b0a5] mb-2">
            Execution Checklist ({completedTasks}/{totalTasks})
          </h4>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {event.chk?.map((task, i) => (
              <label
                key={i}
                onClick={() => onToggleChecklist(event.id, i)}
                className={`flex items-center gap-3 p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  task.d
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 text-[#0b7a5a] dark:text-[#37c597]'
                    : 'bg-[#e2eae4]/50 dark:bg-[#183029]/50 text-[#10231c] dark:text-[#eaf0e8] hover:bg-[#e2eae4] dark:hover:bg-[#183029]'
                }`}
              >
                {task.d ? (
                  <CheckSquare className="w-4 h-4 text-[#0b7a5a] dark:text-[#37c597] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#4b6258] dark:text-[#98b0a5] shrink-0" />
                )}
                <span className={task.d ? 'line-through opacity-85' : ''}>{task.s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Register Action */}
        <div className="pt-5 mt-4 border-t border-[#10231c]/10 dark:border-white/10 flex gap-3">
          <button
            type="button"
            onClick={() => onRegisterMember(event.id)}
            disabled={event.reg >= event.cap}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0b7a5a] hover:bg-[#085942] disabled:opacity-50 text-white font-semibold text-xs shadow-md active:scale-[0.98] transition-transform"
          >
            <Ticket className="w-4 h-4" />
            {event.reg >= event.cap ? 'Event is full' : 'Register a member ticket'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-xs font-semibold hover:bg-[#e2eae4] dark:hover:bg-[#183029]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
