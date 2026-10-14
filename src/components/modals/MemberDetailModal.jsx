import React from 'react';
import { X, UserCheck, CreditCard, Send, ShieldAlert } from 'lucide-react';
import {
  TIER,
  formatMoney,
  getMemberStatus,
  getMemberDue,
  createPRNG,
} from '../../data/initialData';

export default function MemberDetailModal({
  isOpen,
  onClose,
  member,
  onCollectDues,
  onSendReminder,
}) {
  if (!isOpen || !member) return null;

  const status = getMemberStatus(member);
  const dues = getMemberDue(member);
  const tierInfo = TIER[member.tier] || { adm: 0, m: 2000, g: 4 };

  // Generate simulated recent transactions ledger
  const seed = member.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 7);
  const prng = createPRNG(seed);
  const ledger = [
    { title: 'Monthly subscription', amount: -tierInfo.m },
    {
      title: 'Silk Route dinner',
      amount: -Math.round((1500 + prng() * 4000) / 10) * 10,
    },
    {
      title: 'Tea Garden Café',
      amount: -Math.round((200 + prng() * 600) / 10) * 10,
    },
    { title: 'Payment received (bKash)', amount: tierInfo.m },
    { title: 'Gym day pass', amount: -500 },
  ];

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

        {/* Member Profile */}
        <div className="border-b border-[#10231c]/10 dark:border-white/10 pb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-2xl tracking-tight">{member.name}</h3>
            {member.alt && (
              <span className="font-serif text-lg text-[#0b7a5a] dark:text-[#37c597] opacity-90">
                {member.alt}
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-[#e2eae4] dark:bg-[#183029] font-mono text-[#4b6258] dark:text-[#98b0a5]">
              {member.nat}
            </span>
          </div>

          <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mt-1">
            {member.id} · <span className="font-semibold">{member.tier}</span> member since {member.year}
          </p>

          <div className="flex items-center gap-3 mt-3 flex-wrap text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-full font-semibold ${
                status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : status === 'Overdue'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
              }`}
            >
              {status}
            </span>
            <span className="text-[#4b6258] dark:text-[#98b0a5]">
              Guests up to <b className="text-[#10231c] dark:text-[#eaf0e8]">{tierInfo.g}</b> per visit ·{' '}
              <b className="text-[#10231c] dark:text-[#eaf0e8]">{formatMoney(tierInfo.m)}</b> monthly dues
            </span>
          </div>
        </div>

        {/* Recent Ledger */}
        <div className="my-5">
          <h4 className="text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase tracking-wider mb-2">
            Statement & Recent Charges
          </h4>
          <div className="overflow-x-auto rounded-xl border border-[#10231c]/10 dark:border-white/10">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                {ledger.map((item, idx) => (
                  <tr key={idx} className="hover:bg-black/2 dark:hover:bg-white/2">
                    <td className="py-2.5 px-3 text-[#10231c] dark:text-[#eaf0e8]">{item.title}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-medium ${
                        item.amount < 0
                          ? 'text-[#10231c] dark:text-[#eaf0e8]'
                          : 'text-[#0b7a5a] dark:text-[#37c597]'
                      }`}
                    >
                      {item.amount < 0 ? '−' : '+'}
                      {formatMoney(Math.abs(item.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap pt-2">
          {member.over > 0 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCollectDues(member);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white text-xs font-semibold shadow-xs"
              >
                <CreditCard className="w-4 h-4" />
                Collect {formatMoney(dues)}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSendReminder(member);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-[#10231c] dark:text-[#eaf0e8] hover:bg-[#e2eae4] dark:hover:bg-[#183029] text-xs font-semibold"
              >
                <Send className="w-4 h-4 text-[#4b6258] dark:text-[#98b0a5]" />
                Send reminder
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <UserCheck className="w-4 h-4" />
              Member account and subscription are fully up to date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
