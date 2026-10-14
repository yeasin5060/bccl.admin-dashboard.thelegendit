import React, { useState } from 'react';
import { FileText, Copy, Printer, BarChart2, Loader2 } from 'lucide-react';
import {
  ROLE_NAMES,
  formatMoney,
  formatTimeHHMM,
  createPRNG,
  PAYMENT_METHODS,
  PAYMENT_FEES,
  MENU_ITEMS_MAP,
  OUTLETS,
  getMemberDue,
} from '../data/initialData';

const REPORT_TYPES = [
  ['revenue', 'Revenue by outlet'],
  ['payments', 'Payment reconciliation'],
  ['dues', 'Member dues ageing'],
  ['occupancy', 'Room occupancy'],
  ['fnb', 'Food and drink sales'],
  ['payroll', 'Payroll register'],
  ['events', 'Event registrations'],
];

const MULTIPLIERS = { today: 1, week: 6.6, month: 27.5 };

export default function ReportsView({
  role,
  transactions,
  members,
  staff,
  events,
  showToast,
}) {
  const [reportType, setReportType] = useState('revenue');
  const [reportRange, setReportRange] = useState('today');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const generateReport = () => {
    setIsGenerating(true);
    setReportData(null);

    setTimeout(() => {
      const mult = MULTIPLIERS[reportRange] || 1;
      const prng = createPRNG(reportType.length * 31 + mult * 7);
      const output = { cols: [], rows: [], bars: [], note: '' };

      const successTxns = transactions.filter((t) => t.st === 'Success');
      const outletNames = [
        'Silk Route',
        'Lantern Bar',
        'Tea Garden',
        'Guest house',
        'Membership dues',
        'Fitness',
        'Events',
      ];

      if (reportType === 'revenue') {
        const d = outletNames.map((o) => {
          const v = successTxns
            .filter((t) => t.outlet === o)
            .reduce((sum, t) => sum + t.amount, 0);
          return { o, v };
        });
        const total = d.reduce((sum, x) => sum + x.v * mult, 0) || 1;
        output.cols = ['Outlet', 'Transactions', 'Gross revenue', 'Share'];
        d.forEach((x) => {
          const n = Math.round(
            successTxns.filter((t) => t.outlet === x.o).length * mult
          );
          output.rows.push([
            x.o,
            n,
            formatMoney(x.v * mult),
            Math.round(((x.v * mult) / total) * 100) + '%',
          ]);
          output.bars.push([x.o, x.v * mult]);
        });
        output.rows.push(['Total', '', formatMoney(total), '100%']);
      } else if (reportType === 'payments') {
        output.cols = [
          'Method',
          'Transactions',
          'Gross',
          'Fee (illustrative)',
          'Net settlement',
        ];
        PAYMENT_METHODS.forEach((m) => {
          const txs = successTxns.filter((t) => t.method === m);
          const val = txs.reduce((sum, t) => sum + t.amount, 0) * mult;
          const feeRate = PAYMENT_FEES[m] || 0;
          output.rows.push([
            m,
            Math.round(txs.length * mult),
            formatMoney(val),
            formatMoney(val * feeRate),
            formatMoney(val * (1 - feeRate)),
          ]);
          output.bars.push([m, val]);
        });
      } else if (reportType === 'dues') {
        const buckets = [
          ['1–30 days', 0],
          ['31–60 days', 0],
          ['61+ days', 0],
        ];
        output.cols = ['Member', 'Tier', 'Months overdue', 'Amount', 'Ageing bucket'];
        members
          .filter((m) => m.over > 0)
          .forEach((m) => {
            const bucketIndex = m.over === 1 ? 0 : m.over === 2 ? 1 : 2;
            const due = getMemberDue(m);
            buckets[bucketIndex][1] += due;
            output.rows.push([
              m.name,
              m.tier,
              m.over,
              formatMoney(due),
              buckets[bucketIndex][0],
            ]);
          });
        output.bars = buckets;
        output.note = 'Dues ageing is always calculated as of current snapshot.';
      } else if (reportType === 'occupancy') {
        output.cols = [
          'Room type',
          'Inventory',
          'Nights sold',
          'Occupancy',
          'Average rate',
          'Revenue',
        ];
        [
          ['Deluxe', 6, 6500],
          ['Executive', 4, 8500],
          ['Jade suite', 2, 12000],
        ].forEach(([name, count, rate]) => {
          const days = { today: 1, week: 7, month: 30 }[reportRange] || 1;
          const sold = Math.round(count * days * (0.45 + prng() * 0.35));
          const occ = Math.round((sold / (count * days)) * 100);
          output.rows.push([
            name,
            count,
            sold,
            occ + '%',
            formatMoney(rate),
            formatMoney(sold * rate),
          ]);
          output.bars.push([name, sold * rate]);
        });
      } else if (reportType === 'fnb') {
        output.cols = ['Item', 'Outlet', 'Qty sold', 'Revenue'];
        const items = Object.values(MENU_ITEMS_MAP).map((it) => [
          it,
          Math.round(((4 + prng() * 38) * mult) / 3.2),
        ]);
        items.sort((a, b) => b[0].p * b[1] - a[0].p * a[1]);
        items.slice(0, 10).forEach(([item, qty]) => {
          output.rows.push([
            item.n,
            OUTLETS[item.o]?.n || item.o,
            qty,
            formatMoney(item.p * qty),
          ]);
          output.bars.push([item.n, item.p * qty]);
        });
      } else if (reportType === 'payroll') {
        output.cols = ['Employee', 'Department', 'Gross', 'Deductions', 'Net pay'];
        staff.forEach((s) => {
          const allowance = s.basic * 0.3;
          const overtime = Math.round((s.basic / 208) * 1.5 * s.ot);
          const pf = s.basic * 0.05;
          const gross = s.basic + allowance + overtime;
          const net = gross - pf - s.adv;
          output.rows.push([
            s.name,
            s.dept,
            formatMoney(gross),
            formatMoney(pf + s.adv),
            formatMoney(net),
          ]);
          output.bars.push([s.name, net]);
        });
        output.note = 'Standard monthly figures; date range does not apply.';
      } else if (reportType === 'events') {
        output.cols = ['Event', 'Date', 'Registered', 'Capacity', 'Fill', 'Ticket revenue'];
        events.forEach((e) => {
          const fill = Math.round((e.reg / e.cap) * 100);
          output.rows.push([
            e.n,
            e.d,
            e.reg,
            e.cap,
            fill + '%',
            formatMoney(e.reg * e.price),
          ]);
          output.bars.push([e.n, e.reg * e.price]);
        });
      }

      setReportData(output);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopyCSV = () => {
    if (!reportData) return;
    const csvRows = [reportData.cols, ...reportData.rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = csvRows.join('\n');
    navigator.clipboard.writeText(csvContent).then(
      () => showToast('Report CSV copied to clipboard'),
      () => showToast('Failed to copy to clipboard')
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const maxBarValue = reportData
    ? Math.max(...reportData.bars.map((b) => b[1])) || 1
    : 1;

  const currentReportTitle =
    REPORT_TYPES.find((t) => t[0] === reportType)?.[1] || 'Report';

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3 no-print">
        <select
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
            setReportData(null);
          }}
          className="px-3.5 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d]"
        >
          {REPORT_TYPES.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={reportRange}
          onChange={(e) => {
            setReportRange(e.target.value);
            setReportData(null);
          }}
          className="px-3.5 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d]"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 days</option>
          <option value="month">This month</option>
        </select>

        <button
          type="button"
          disabled={isGenerating}
          onClick={generateReport}
          className="flex items-center gap-2 py-2 px-5 rounded-xl bg-[#c8321f] hover:bg-[#a62716] disabled:opacity-50 text-white font-semibold text-sm shadow-xs active:scale-[0.98] transition-transform"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          <span>{isGenerating ? 'Compiling…' : 'Generate report'}</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="space-y-3 py-6">
          <div className="h-4 bg-[#e2eae4] dark:bg-[#183029] rounded-md w-3/5 animate-pulse" />
          <div className="h-4 bg-[#e2eae4] dark:bg-[#183029] rounded-md w-full animate-pulse" />
          <div className="h-4 bg-[#e2eae4] dark:bg-[#183029] rounded-md w-4/5 animate-pulse" />
          <div className="h-4 bg-[#e2eae4] dark:bg-[#183029] rounded-md w-1/2 animate-pulse" />
        </div>
      )}

      {/* Empty State Prompt */}
      {!isGenerating && !reportData && (
        <div className="p-8 text-center text-sm text-[#4b6258] dark:text-[#98b0a5] bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10">
          <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="max-w-md mx-auto">
            Select an analytical report and fiscal date range, then click Generate to reconcile club accounts, occupancy metrics, or outlet sales.
          </p>
        </div>
      )}

      {/* Report Result Document */}
      {!isGenerating && reportData && (
        <div className="bg-white dark:bg-[#11241d] p-6 sm:p-8 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-sm space-y-6">
          {/* Document Header */}
          <div className="flex flex-wrap justify-between items-baseline gap-4 pb-4 border-b-2 border-[#10231c] dark:border-white/40">
            <div>
              <h2 className="font-serif font-bold text-2xl tracking-tight">{currentReportTitle}</h2>
              <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mt-1">
                Bangladesh China Club Ltd ·{' '}
                {reportRange === 'today'
                  ? 'Today'
                  : reportRange === 'week'
                  ? 'Last 7 days'
                  : 'This month'}
              </p>
            </div>
            <div className="text-right text-xs text-[#4b6258] dark:text-[#98b0a5]">
              <p>Prepared {formatTimeHHMM(new Date())}</p>
              <p>by {ROLE_NAMES[role]}</p>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#eef2ed]/60 dark:bg-[#07140f]/60 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
                <tr>
                  {reportData.cols.map((col, idx) => (
                    <th
                      key={col}
                      className={`py-3 px-4 ${idx > 1 ? 'text-right' : ''}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                {reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-black/2 dark:hover:bg-white/2">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2.5 px-4 ${
                          cIdx > 1 ? 'text-right font-mono' : 'font-medium'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reportData.note && (
            <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] italic">
              {reportData.note}
            </p>
          )}

          {/* Comparative Horizontal Progress Bars */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-[#4b6258] dark:text-[#98b0a5] uppercase tracking-wider">
              Comparative Distribution
            </h3>
            <div className="space-y-2">
              {reportData.bars.map(([label, val], idx) => {
                const pct = Math.min(100, Math.round((val / maxBarValue) * 100));
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-40 text-[#10231c] dark:text-[#eaf0e8] font-medium truncate">
                      {label}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-[#e2eae4] dark:bg-[#183029] overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#0b7a5a] to-[#e8b04a] rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-mono font-medium text-[#10231c] dark:text-[#eaf0e8]">
                      {typeof val === 'number' ? formatMoney(val) : val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#10231c]/10 dark:border-white/10 no-print">
            <button
              type="button"
              onClick={handleCopyCSV}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[#10231c] dark:bg-[#eaf0e8] text-white dark:text-[#0a1713] text-xs font-semibold shadow-xs"
            >
              <Copy className="w-4 h-4" />
              <span>Copy as CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-4 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-xs font-semibold hover:bg-[#e2eae4] dark:hover:bg-[#183029]"
            >
              <Printer className="w-4 h-4" />
              <span>Print report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
