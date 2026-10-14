import React, { useState, useMemo } from 'react';
import { Search, Users, CheckCircle, Clock, Calendar, DollarSign, Play } from 'lucide-react';
import {
  DEPARTMENTS,
  formatMoney,
} from '../data/initialData';

export default function StaffView({
  staff,
  shifts,
  payrollDone,
  onCycleAttendance,
  onCycleShift,
  onRunPayroll,
}) {
  const [activeTab, setActiveTab] = useState('dir'); // 'dir' | 'att' | 'shift' | 'pay'
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showPayrollConfirm, setShowPayrollConfirm] = useState(false);

  // Filtered staff for directory
  const filteredStaff = useMemo(() => {
    const q = search.toLowerCase().trim();
    return staff.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      const matchDept = !deptFilter || s.dept === deptFilter;
      return matchQ && matchDept;
    });
  }, [staff, search, deptFilter]);

  // Attendance metrics
  const attendanceCounts = useMemo(() => {
    const counts = { in: 0, late: 0, out: 0, leave: 0 };
    staff.forEach((s) => {
      counts[s.att] = (counts[s.att] || 0) + 1;
    });
    return counts;
  }, [staff]);

  // Payroll calculation rows
  const payrollRows = useMemo(() => {
    return staff.map((s) => {
      const allowance = s.basic * 0.3;
      const overtime = Math.round((s.basic / 208) * 1.5 * s.ot);
      const providentFund = s.basic * 0.05;
      const gross = s.basic + allowance + overtime;
      const net = gross - providentFund - s.adv;
      return {
        staff: s,
        allowance,
        overtime,
        providentFund,
        gross,
        net,
      };
    });
  }, [staff]);

  const totalGrossPayroll = useMemo(
    () => payrollRows.reduce((sum, r) => sum + r.gross, 0),
    [payrollRows]
  );
  const totalNetPayroll = useMemo(
    () => payrollRows.reduce((sum, r) => sum + r.net, 0),
    [payrollRows]
  );

  const SHIFT_NAMES = {
    M: 'Morning 07–15',
    E: 'Evening 15–23',
    N: 'Night 23–07',
  };

  const ATT_CONFIG = {
    in: { label: 'Present', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' },
    late: { label: 'Late', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' },
    out: { label: 'Not in', color: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300' },
    leave: { label: 'On leave', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' },
  };

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Subtabs Bar */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'dir', label: 'Directory' },
          { id: 'att', label: 'Attendance today' },
          { id: 'shift', label: 'Shift planner' },
          { id: 'pay', label: 'Payroll' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#10231c] text-white dark:bg-[#eaf0e8] dark:text-[#0a1713] shadow-xs'
                : 'bg-white dark:bg-[#11241d] border border-[#10231c]/15 dark:border-white/15 text-[#4b6258] dark:text-[#98b0a5] hover:bg-[#e2eae4] dark:hover:bg-[#183029]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Directory Tab */}
      {activeTab === 'dir' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#4b6258] dark:text-[#98b0a5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search employee name, role or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d] focus:outline-none focus:ring-2 focus:ring-[#e8b04a]"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#11241d]"
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#eef2ed]/60 dark:bg-[#07140f]/60 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Regular Shift</th>
                    <th className="py-3 px-4 text-right">Basic Monthly Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-black/2 dark:hover:bg-white/2">
                      <td className="py-3 px-4 font-mono text-xs text-[#4b6258] dark:text-[#98b0a5]">
                        {s.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#10231c] dark:text-[#eaf0e8]">
                        {s.name}
                      </td>
                      <td className="py-3 px-4 text-[#4b6258] dark:text-[#98b0a5]">{s.dept}</td>
                      <td className="py-3 px-4 text-[#10231c] dark:text-[#eaf0e8]">{s.role}</td>
                      <td className="py-3 px-4 text-xs text-[#4b6258] dark:text-[#98b0a5]">
                        {SHIFT_NAMES[s.shift] || s.shift}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#10231c] dark:text-[#eaf0e8]">
                        {formatMoney(s.basic)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Today Tab */}
      {activeTab === 'att' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
              <span className="text-xs text-[#4b6258] dark:text-[#98b0a5]">Present</span>
              <div className="font-serif text-3xl font-bold text-[#0b7a5a] dark:text-[#37c597] my-1">
                {attendanceCounts.in}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
              <span className="text-xs text-[#4b6258] dark:text-[#98b0a5]">Late</span>
              <div className="font-serif text-3xl font-bold text-amber-600 dark:text-amber-400 my-1">
                {attendanceCounts.late}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
              <span className="text-xs text-[#4b6258] dark:text-[#98b0a5]">Not in yet</span>
              <div className="font-serif text-3xl font-bold text-red-600 dark:text-red-400 my-1">
                {attendanceCounts.out}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
              <span className="text-xs text-[#4b6258] dark:text-[#98b0a5]">On leave</span>
              <div className="font-serif text-3xl font-bold text-blue-600 dark:text-blue-400 my-1">
                {attendanceCounts.leave}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#4b6258] dark:text-[#98b0a5]">
            Click any status pill to cycle between Present, Late, Not in, and On leave. Integrated with biometric time clocks.
          </p>

          <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                  {staff.map((s) => {
                    const cfg = ATT_CONFIG[s.att] || ATT_CONFIG.in;
                    return (
                      <tr key={s.id} className="hover:bg-black/2 dark:hover:bg-white/2">
                        <td className="py-3 px-4">
                          <b className="text-[#10231c] dark:text-[#eaf0e8]">{s.name}</b>
                          <div className="text-xs text-[#4b6258] dark:text-[#98b0a5]">
                            {s.dept} · {s.role}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onCycleAttendance(s.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition-transform ${cfg.color}`}
                          >
                            {cfg.label}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Shift Planner Tab */}
      {activeTab === 'shift' && (
        <div className="space-y-4">
          <p className="text-xs text-[#4b6258] dark:text-[#98b0a5]">
            Click any schedule cell to cycle between Morning (M), Evening (E), Night (N) or day off.
          </p>

          <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#eef2ed]/60 dark:bg-[#07140f]/60 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">Department</th>
                    {DAYS.map((d) => (
                      <th key={d} className="py-3 px-4 text-center">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                  {DEPARTMENTS.map((dept) => (
                    <tr key={dept} className="hover:bg-black/2 dark:hover:bg-white/2">
                      <td className="py-3 px-4 font-semibold text-[#10231c] dark:text-[#eaf0e8]">
                        {dept}
                      </td>
                      {shifts[dept]?.map((val, idx) => (
                        <td key={idx} className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => onCycleShift(dept, idx)}
                            className={`w-11 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              val === 'off'
                                ? 'opacity-40 border-[#10231c]/10 dark:border-white/10'
                                : 'border-[#10231c]/20 dark:border-white/20 bg-[#e2eae4]/60 dark:bg-[#183029]/60 text-[#10231c] dark:text-[#eaf0e8]'
                            }`}
                          >
                            {val}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === 'pay' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <b className="font-serif text-lg font-bold">October payroll register</b>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  payrollDone
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                }`}
              >
                {payrollDone ? 'Processed' : 'Draft'}
              </span>
            </div>

            <button
              type="button"
              disabled={payrollDone}
              onClick={() => setShowPayrollConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8321f] hover:bg-[#a62716] disabled:opacity-40 text-white font-semibold text-xs shadow-xs active:scale-[0.98] transition-transform"
            >
              <DollarSign className="w-4 h-4" />
              <span>{payrollDone ? 'Payroll closed' : 'Run payroll'}</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#eef2ed]/60 dark:bg-[#07140f]/60 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4 text-right">Basic</th>
                    <th className="py-3 px-4 text-right">Allowance 30%</th>
                    <th className="py-3 px-4 text-right">Overtime</th>
                    <th className="py-3 px-4 text-right">PF 5%</th>
                    <th className="py-3 px-4 text-right">Advance</th>
                    <th className="py-3 px-4 text-right">Net pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                  {payrollRows.map((r) => (
                    <tr key={r.staff.id} className="hover:bg-black/2 dark:hover:bg-white/2">
                      <td className="py-3 px-4 font-semibold text-[#10231c] dark:text-[#eaf0e8]">
                        {r.staff.name}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{formatMoney(r.staff.basic)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatMoney(r.allowance)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatMoney(r.overtime)}</td>
                      <td className="py-3 px-4 text-right font-mono text-red-600 dark:text-red-400">
                        −{formatMoney(r.providentFund)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                        {r.staff.adv ? `−${formatMoney(r.staff.adv)}` : '–'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0b7a5a] dark:text-[#37c597]">
                        {formatMoney(r.net)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#eef2ed]/80 dark:bg-[#07140f]/80 font-bold border-t-2 border-[#10231c]/20 dark:border-white/20">
                    <td className="py-3 px-4">Total</td>
                    <td colSpan={4} />
                    <td className="py-3 px-4 text-right font-mono text-xs text-[#4b6258] dark:text-[#98b0a5]">
                      Gross {formatMoney(totalGrossPayroll)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-base text-[#0b7a5a] dark:text-[#37c597]">
                      {formatMoney(totalNetPayroll)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-[#4b6258] dark:text-[#98b0a5]">
            Deductions and benefits: 30% executive allowance, 5% staff provident fund, 1.5× hourly overtime rate.
          </p>
        </div>
      )}

      {/* Run Payroll Confirm Modal */}
      {showPayrollConfirm && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#11241d] text-[#10231c] dark:text-[#eaf0e8] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 animate-slide-in">
            <h3 className="font-serif font-bold text-xl mb-2">Process October payroll?</h3>
            <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mb-5 leading-relaxed">
              Disbursing net salary of <b className="text-[#10231c] dark:text-[#eaf0e8]">{formatMoney(totalNetPayroll)}</b> across {staff.length} staff members. Direct bank electronic advice and digital payslips will be transmitted.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPayrollConfirm(false);
                  onRunPayroll();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0b7a5a] text-white font-semibold text-xs shadow-xs"
              >
                Execute payroll
              </button>
              <button
                type="button"
                onClick={() => setShowPayrollConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-xs font-semibold hover:bg-[#e2eae4] dark:hover:bg-[#183029]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
