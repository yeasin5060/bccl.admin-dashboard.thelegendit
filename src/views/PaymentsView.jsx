import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  PAYMENT_METHODS,
  PAYMENT_FEES,
  formatMoney,
  formatTimeHHMM,
  OUTLET_NAMES,
} from '../data/initialData';

export default function PaymentsView({
  transactions,
  onOpenTakePaymentModal,
  onRefundTransaction,
  onSettleTransaction,
}) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Successful transactions today
  const successTxns = useMemo(
    () => transactions.filter((t) => t.st === 'Success'),
    [transactions]
  );

  const grossToday = useMemo(
    () => successTxns.reduce((sum, t) => sum + t.amount, 0),
    [successTxns]
  );

  // Group by method
  const methodStats = useMemo(() => {
    return PAYMENT_METHODS.map((m) => {
      const txs = successTxns.filter((t) => t.method === m);
      const total = txs.reduce((sum, t) => sum + t.amount, 0);
      const fee = total * (PAYMENT_FEES[m] || 0);
      return { method: m, count: txs.length, total, fee };
    });
  }, [successTxns]);

  const maxMethodTotal = useMemo(() => {
    const max = Math.max(...methodStats.map((m) => m.total));
    return max > 0 ? max : 1;
  }, [methodStats]);

  const totalFees = useMemo(
    () => methodStats.reduce((sum, m) => sum + m.fee, 0),
    [methodStats]
  );
  const netSettlement = grossToday - totalFees;
  const pendingOrFailedCount = useMemo(
    () => transactions.filter((t) => t.st !== 'Success' && t.st !== 'Refunded').length,
    [transactions]
  );

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return transactions.filter((t) => {
      const matchQ =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.outlet.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q);
      const matchMethod = !methodFilter || t.method === methodFilter;
      const matchStatus = !statusFilter || t.st === statusFilter;
      return matchQ && matchMethod && matchStatus;
    });
  }, [transactions, search, methodFilter, statusFilter]);

  const GATEWAYS = [
    { name: 'bKash', desc: 'Merchant Direct API v1.3' },
    { name: 'Nagad', desc: 'Merchant API & QR Service' },
    { name: 'Alipay', desc: 'Cross-Border Aggregated QR' },
    { name: 'WeChat Pay', desc: 'Tencent Cross-Border QR' },
    { name: 'Cards', desc: 'Visa, Mastercard, UnionPay' },
  ];

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Gross collected today
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#0b7a5a] dark:text-[#37c597]">
            {formatMoney(grossToday)}
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block">
            all settled channels
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Gateway interchange fee
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#9a6b0c] dark:text-[#e8b04a]">
            {formatMoney(totalFees)}
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block">
            merchant processing cost
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Net treasury settlement
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#10231c] dark:text-[#eaf0e8]">
            {formatMoney(netSettlement)}
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block">
            credited to club bank
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Failed or pending
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#c8321f] dark:text-[#ef5a45]">
            {pendingOrFailedCount}
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block">
            requires review or retry
          </span>
        </div>
      </div>

      {/* Main Grid: Methods Breakdown + Gateways Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Col: By Payment Method */}
        <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg">Collected by channel</h2>
            <button
              type="button"
              onClick={onOpenTakePaymentModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white font-semibold text-xs shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Charge terminal</span>
            </button>
          </div>

          <div className="space-y-3">
            {methodStats.map((item) => {
              const pct = Math.round((item.total / maxMethodTotal) * 100);
              return (
                <div key={item.method} className="flex items-center gap-3 text-xs">
                  <span className="w-28 text-[#4b6258] dark:text-[#98b0a5] font-medium truncate">
                    {item.method}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-[#e2eae4] dark:bg-[#183029] overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#0b7a5a] to-[#e8b04a] rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-20 text-right font-mono font-medium text-[#10231c] dark:text-[#eaf0e8]">
                    {formatMoney(item.total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Gateways Status */}
        <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs space-y-3">
          <h2 className="font-serif font-bold text-lg flex items-center justify-between">
            <span>Payment gateway pipelines</span>
            <span className="text-xs font-sans text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Operational
            </span>
          </h2>

          <div className="divide-y divide-[#10231c]/10 dark:divide-white/10 text-xs">
            {GATEWAYS.map((g) => (
              <div key={g.name} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0b7a5a] dark:bg-[#37c597] shadow-xs" />
                  <div>
                    <b className="text-[#10231c] dark:text-[#eaf0e8] text-sm">{g.name}</b>
                    <span className="text-[#4b6258] dark:text-[#98b0a5] block">{g.desc}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-semibold text-[11px]">
                  Online
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] pt-1">
            PCI-DSS compliant sandbox environment. Cross-border settlement supports BDT, CNY, and USD.
          </p>
        </div>
      </div>

      {/* Transactions History */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-xl">Transactions history register</h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#4b6258] dark:text-[#98b0a5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search reference, outlet, or payment method…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d]"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d]"
          >
            <option value="">All payment methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d]"
          >
            <option value="">All statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#eef2ed]/60 dark:bg-[#07140f]/60 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Outlet</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                {filteredTransactions.slice(0, 40).map((t) => (
                  <tr key={t.id} className="hover:bg-black/2 dark:hover:bg-white/2">
                    <td className="py-3 px-4 font-mono text-xs text-[#4b6258] dark:text-[#98b0a5]">
                      {formatTimeHHMM(t.t)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#10231c] dark:text-[#eaf0e8]">
                      {t.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#10231c] dark:text-[#eaf0e8]">
                      {t.outlet}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#4b6258] dark:text-[#98b0a5]">
                      {t.method}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-[#10231c] dark:text-[#eaf0e8]">
                      {formatMoney(t.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          t.st === 'Success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : t.st === 'Failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                            : t.st === 'Pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                        }`}
                      >
                        {t.st}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {t.st === 'Success' ? (
                        <button
                          type="button"
                          onClick={() => onRefundTransaction(t.id)}
                          className="px-2.5 py-1 rounded-lg border border-[#10231c]/15 dark:border-white/15 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                        >
                          Refund
                        </button>
                      ) : t.st === 'Pending' ? (
                        <button
                          type="button"
                          onClick={() => onSettleTransaction(t.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#0b7a5a] text-white text-xs font-semibold"
                        >
                          Mark settled
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
