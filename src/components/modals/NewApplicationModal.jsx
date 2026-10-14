import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { TIER, getMemberStatus } from '../../data/initialData';

export default function NewApplicationModal({ isOpen, onClose, members, onSubmit }) {
  const activeMembers = members.filter((m) => getMemberStatus(m) === 'Active');

  const [name, setName] = useState('');
  const [tier, setTier] = useState('Associate');
  const [proposer, setProposer] = useState(activeMembers[0]?.name || '');
  const [seconder, setSeconder] = useState(activeMembers[1]?.name || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter the applicant's full name.");
      return;
    }
    if (proposer === seconder) {
      setError('Proposer and seconder must be different club members.');
      return;
    }

    onSubmit({
      name: cleanName,
      tier,
      prop: proposer,
      sec: seconder,
      note: note || 'Submitted via executive portal',
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
          <UserPlus className="w-5 h-5 text-[#c8321f]" />
          <h3 className="font-serif font-bold text-xl">New Membership Application</h3>
        </div>
        <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mb-4">
          Every application requires sponsorship from two active members prior to executive committee review.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
              Applicant full name & Chinese characters (if applicable)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Imran Kabir or Huang Tao 黄涛"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029] focus:outline-none focus:ring-2 focus:ring-[#e8b04a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
              Membership tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
            >
              {Object.keys(TIER).map((t) => (
                <option key={t} value={t}>
                  {t} · ৳{TIER[t].m.toLocaleString()}/mo (Admission: ৳{TIER[t].adm.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                Proposer (Sponsor 1)
              </label>
              <select
                value={proposer}
                onChange={(e) => {
                  setProposer(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
              >
                {activeMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                Seconder (Sponsor 2)
              </label>
              <select
                value={seconder}
                onChange={(e) => {
                  setSeconder(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
              >
                {activeMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
              Background notes or profession
            </label>
            <input
              type="text"
              placeholder="e.g. Managing Director at Sino-Bangla Logistics"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-transform"
            >
              Submit application for committee approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
