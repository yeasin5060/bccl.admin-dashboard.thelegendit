import React, { useState } from 'react';
import { X, CalendarPlus } from 'lucide-react';
import { formatMoney } from '../../data/initialData';

export default function UseTemplateModal({ isOpen, onClose, template, onCreateEvent }) {
  if (!isOpen || !template) return null;

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  const formattedDate = defaultDate.toISOString().slice(0, 10);

  const [date, setDate] = useState(formattedDate);
  const [time, setTime] = useState('18:30');
  const [venue, setVenue] = useState(template.venue);
  const [capacity, setCapacity] = useState(template.cap);
  const [price, setPrice] = useState(template.price);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateEvent({
      n: template.n,
      cat: template.cat,
      d: date,
      t: time,
      venue,
      cap: parseInt(capacity) || template.cap,
      price: parseFloat(price) || 0,
      x: template.x,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#11241d] text-[#10231c] dark:text-[#eaf0e8] w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 relative animate-slide-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#e2eae4] dark:bg-[#183029] flex items-center justify-center text-[#4b6258] dark:text-[#98b0a5] hover:text-[#10231c] dark:hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{template.ic}</span>
          <h3 className="font-serif font-bold text-xl">{template.n}</h3>
        </div>
        <p className="text-xs text-[#0b7a5a] dark:text-[#37c597] font-serif mb-4">
          <span lang="zh">{template.z}</span> · <span lang="bn">{template.b}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                Event Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                Start Time
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
              Venue
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                Ticket Price (BDT)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
              />
            </div>
          </div>

          <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] pt-1">
            Budget estimated at {formatMoney(template.budget)}. Standard plan imports {template.x.length + 6} preparation tasks.
          </p>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-transform"
            >
              <CalendarPlus className="w-4 h-4" />
              Schedule & open for RSVP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
