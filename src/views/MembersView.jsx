import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Eye, CreditCard, Check, X, ShieldAlert } from 'lucide-react';
import {
  TIER,
  formatMoney,
  getMemberStatus,
  getMemberDue,
} from '../data/initialData';

export default function MembersView({
  members,
  applications,
  onOpenMemberModal,
  onOpenNewAppModal,
  onCollectDues,
  onApproveApp,
  onDeclineApp,
}) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      const matchQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.alt && m.alt.toLowerCase().includes(q)) ||
        m.id.toLowerCase().includes(q);
      const matchTier = !tierFilter || m.tier === tierFilter;
      const matchStatus = !statusFilter || getMemberStatus(m) === statusFilter;
      return matchQuery && matchTier && matchStatus;
    });
  }, [members, search, tierFilter, statusFilter]);

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#4b6258] dark:text-[#98b0a5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search name, Chinese name, or member ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d] focus:outline-none focus:ring-2 focus:ring-[#e8b04a]"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          aria-label="Filter by Tier"
          className="px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d]"
        >
          <option value="">All tiers</option>
          {Object.keys(TIER).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by Status"
          className="px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d]"
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Overdue">Overdue</option>
          <option value="Suspended">Suspended</option>
        </select>

        <button
          type="button"
          onClick={onOpenNewAppModal}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white text-sm font-semibold shadow-xs active:scale-[0.98] transition-transform"
        >
          <UserPlus className="w-4 h-4" />
          <span>New application</span>
        </button>
      </div>

      {/* Members Directory Table */}
      <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#eef2ed]/60 dark:bg-[#07140f]/60 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dues owed</th>
                <th className="py-3 px-4 text-right">Spend (MTD)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
              {filteredMembers.map((m) => {
                const status = getMemberStatus(m);
                const due = getMemberDue(m);
                return (
                  <tr key={m.id} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-[#4b6258] dark:text-[#98b0a5]">
                      {m.id}
                    </td>
                    <td className="py-3 px-4">
                      <b className="text-[#10231c] dark:text-[#eaf0e8] font-semibold">{m.name}</b>
                      {m.alt && (
                        <span className="font-serif text-xs text-[#0b7a5a] dark:text-[#37c597] ml-2 font-medium">
                          {m.alt}
                        </span>
                      )}
                      <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-[#e2eae4] dark:bg-[#183029] text-[#4b6258] dark:text-[#98b0a5] font-mono">
                        {m.nat}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#4b6258] dark:text-[#98b0a5]">{m.tier}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : status === 'Overdue'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-medium ${
                        due > 0 ? 'text-[#c8321f] dark:text-[#ef5a45]' : 'text-[#4b6258] dark:text-[#98b0a5]'
                      }`}
                    >
                      {due > 0 ? formatMoney(due) : '–'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-[#10231c] dark:text-[#eaf0e8]">
                      {formatMoney(m.spend)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenMemberModal(m)}
                          className="px-2.5 py-1 rounded-lg border border-[#10231c]/15 dark:border-white/15 text-xs font-medium hover:bg-[#e2eae4] dark:hover:bg-[#183029]"
                        >
                          View
                        </button>
                        {m.over > 0 && (
                          <button
                            type="button"
                            onClick={() => onCollectDues(m)}
                            className="px-2.5 py-1 rounded-lg bg-[#c8321f] hover:bg-[#a62716] text-white text-xs font-semibold shadow-2xs"
                          >
                            Collect
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-[#4b6258] dark:text-[#98b0a5]">
                    No members match your criteria. Try adjusting the search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications Awaiting Executive Committee */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-xl flex items-center gap-2">
          <span>Applications awaiting executive committee approval</span>
          <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-[#e8b04a]/20 text-[#9a6b0c] dark:text-[#e8b04a] font-semibold">
            {applications.length} pending
          </span>
        </h2>

        {applications.length > 0 ? (
          <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#eef2ed]/60 dark:bg-[#07140f]/60 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Tier</th>
                    <th className="py-3 px-4">Proposer</th>
                    <th className="py-3 px-4">Seconder</th>
                    <th className="py-3 px-4">Background Note</th>
                    <th className="py-3 px-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                  {applications.map((a) => (
                    <tr key={a.id} className="hover:bg-black/2 dark:hover:bg-white/2">
                      <td className="py-3 px-4 font-semibold text-[#10231c] dark:text-[#eaf0e8]">
                        {a.name}
                      </td>
                      <td className="py-3 px-4 text-[#4b6258] dark:text-[#98b0a5]">{a.tier}</td>
                      <td className="py-3 px-4 text-[#10231c] dark:text-[#eaf0e8]">{a.prop}</td>
                      <td className="py-3 px-4 text-[#10231c] dark:text-[#eaf0e8]">{a.sec}</td>
                      <td className="py-3 px-4 text-xs text-[#4b6258] dark:text-[#98b0a5]">{a.note}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onApproveApp(a)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0b7a5a] hover:bg-[#085942] text-white text-xs font-semibold shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeclineApp(a)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg border border-[#10231c]/15 dark:border-white/15 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#4b6258] dark:text-[#98b0a5]">
            No pending applications at this time. All new candidates have been resolved.
          </p>
        )}
      </div>
    </div>
  );
}
