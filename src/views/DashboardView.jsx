import React, { useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import {
  formatMoney,
  formatTimeHHMM,
  ROLE_NAMES,
  SEVEN_DAY_TREND,
  getMemberDue,
  getMemberStatus,
} from '../data/initialData';

export default function DashboardView({
  role,
  members,
  rooms,
  tables,
  transactions,
  feed,
  events,
  applications,
  setView,
}) {
  // Successful transactions today
  const todaySuccessTxns = useMemo(
    () => transactions.filter((t) => t.st === 'Success'),
    [transactions]
  );

  const totalRevenueToday = useMemo(
    () => todaySuccessTxns.reduce((sum, t) => sum + t.amount, 0),
    [todaySuccessTxns]
  );

  const occupiedRooms = useMemo(
    () => rooms.filter((r) => r.st === 'occ').length,
    [rooms]
  );

  const activeMembersCount = useMemo(
    () => members.filter((m) => getMemberStatus(m) === 'Active').length,
    [members]
  );

  const openTablesCount = useMemo(() => {
    let count = 0;
    Object.keys(tables).forEach((outlet) => {
      count += tables[outlet].filter((t) => t.st !== 'free').length;
    });
    return count;
  }, [tables]);

  const overdueMembers = useMemo(
    () => members.filter((m) => m.over > 0),
    [members]
  );

  const totalOverdueDues = useMemo(
    () => overdueMembers.reduce((sum, m) => sum + getMemberDue(m), 0),
    [overdueMembers]
  );

  // Revenue by outlet
  const OUTLETS_LIST = [
    'Silk Route',
    'Lantern Bar',
    'Tea Garden',
    'Guest house',
    'Membership dues',
    'Fitness',
    'Events',
  ];

  const outletRevenues = useMemo(() => {
    return OUTLETS_LIST.map((name) => {
      const v = todaySuccessTxns
        .filter((t) => t.outlet === name)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name, value: v };
    });
  }, [todaySuccessTxns]);

  const maxOutletRevenue = useMemo(() => {
    const max = Math.max(...outletRevenues.map((o) => o.value));
    return max > 0 ? max : 1;
  }, [outletRevenues]);

  // 7-day trend SVG calculations
  const trendPoints = useMemo(() => {
    const data = [...SEVEN_DAY_TREND, totalRevenueToday];
    const max = Math.max(...data) * 1.15;
    const w = 520;
    const h = 150;
    const labels = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Today'];

    const coords = data.map((val, i) => [
      32 + (i * (w - 64)) / 6,
      h - 26 - (val / max) * (h - 44),
    ]);

    return { coords, labels, max, w, h, data };
  }, [totalRevenueToday]);

  // Attention items
  const cleaningRoomsCount = rooms.filter((r) => r.st === 'cln').length;
  let readyDishesCount = 0;
  Object.keys(tables).forEach((o) => {
    tables[o].forEach((t) => {
      t.lines.forEach((l) => {
        if (l.s === 'ready') readyDishesCount++;
      });
    });
  });

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Cultural Scenic Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#07110e] text-[#f1f3ec] min-h-[140px] shadow-lg border border-white/10">
        <svg
          viewBox="0 0 800 130"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full opacity-90 pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bgBanner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#07110e" />
              <stop offset="100%" stopColor="#3a2a22" />
            </linearGradient>
          </defs>
          <rect width="800" height="130" fill="url(#bgBanner)" />
          {/* Animated Rising Sun */}
          <g className="animate-rise">
            <circle cx="640" cy="104" r="56" fill="#d63a2f" />
          </g>
          {/* River Water Line */}
          <rect y="104" width="800" height="26" fill="#0c241d" />
          {/* Animated Sampan / Traditional Boats */}
          <g className="animate-m1">
            <path
              d="M-26 0C-20 8 20 8 26 0C30 -4 32 -8 34 -14C24 -6 -20 -6 -34 -16C-32 -8 -30 -4 -26 0Z"
              fill="#2c1a10"
            />
            <path d="M-14 -6L-14 -40C6 -30 10 -18 14 -8Z" fill="#f1e3c4" />
          </g>
          <g className="animate-m2">
            <path
              d="M-28 0L26 0C32 -4 34 -10 36 -16L-34 -14C-32 -8 -30 -4 -28 0Z"
              fill="#6e1b14"
            />
            <path d="M-8 -14V-54C6 -56 12 -52 14 -50V-14Z" fill="#a8261c" />
          </g>
        </svg>

        <div className="relative z-10 p-6 sm:p-8 max-w-xl">
          <div className="font-serif text-2xl sm:text-3xl text-[#e8b04a] flex items-center gap-4 font-bold drop-shadow-sm">
            <span lang="bn">স্বাগতম</span>
            <span lang="zh">欢迎</span>
            <span>Welcome</span>
          </div>
          <p className="mt-2 text-sm text-[#d4dfd7] leading-relaxed">
            <span className="font-semibold text-white">{ROLE_NAMES[role]}</span> control center.
            Manage memberships, dining outlets, guest accommodation, payroll, sports amenities, and diplomatic events in real-time.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Revenue today
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#0b7a5a] dark:text-[#37c597]">
            {formatMoney(totalRevenueToday)}
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block truncate">
            all outlets, settled
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Rooms occupied
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#10231c] dark:text-[#eaf0e8]">
            {occupiedRooms}{' '}
            <span className="text-sm font-sans font-normal text-[#4b6258] dark:text-[#98b0a5]">
              / 12
            </span>
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block">
            {Math.round((occupiedRooms / 12) * 100)}% occupancy
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Active members
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#10231c] dark:text-[#eaf0e8]">
            {activeMembersCount}
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block">
            of {members.length} registered
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Tables open
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#9a6b0c] dark:text-[#e8b04a]">
            {openTablesCount}
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block">
            across 3 club outlets
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs col-span-2 md:col-span-1">
          <span className="text-xs text-[#4b6258] dark:text-[#98b0a5] font-medium block">
            Dues overdue
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold my-1 text-[#c8321f] dark:text-[#ef5a45]">
            {formatMoney(totalOverdueDues)}
          </div>
          <span className="text-[11px] text-[#4b6258] dark:text-[#98b0a5] block">
            {overdueMembers.length} members pending
          </span>
        </div>
      </div>

      {/* Main Grid: Revenue Charts vs Live Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Outlets + 7 Days Trend */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
            <h2 className="font-serif font-bold text-lg mb-4 flex items-center justify-between">
              <span>Revenue today by outlet</span>
              <span className="text-xs font-sans font-normal text-[#0b7a5a] dark:text-[#37c597]">
                Live aggregation
              </span>
            </h2>
            <div className="space-y-3">
              {outletRevenues.map((item) => {
                const pct = Math.round((item.value / maxOutletRevenue) * 100);
                return (
                  <div key={item.name} className="flex items-center gap-3 text-xs">
                    <span className="w-28 text-[#4b6258] dark:text-[#98b0a5] truncate font-medium">
                      {item.name}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-[#e2eae4] dark:bg-[#183029] overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#0b7a5a] to-[#e8b04a] rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-mono font-medium text-[#10231c] dark:text-[#eaf0e8]">
                      {formatMoney(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7 Days Trend SVG */}
          <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif font-bold text-lg">7-day financial trajectory</h2>
              <span className="text-xs text-[#0b7a5a] dark:text-[#37c597] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% weekly
              </span>
            </div>

            <div className="w-full overflow-hidden">
              <svg viewBox={`0 0 ${trendPoints.w} ${trendPoints.h}`} className="w-full h-auto">
                {/* Horizontal reference grid lines */}
                <line
                  x1="20"
                  y1={trendPoints.h - 26}
                  x2={trendPoints.w - 20}
                  y2={trendPoints.h - 26}
                  stroke="currentColor"
                  className="text-black/10 dark:text-white/10"
                  strokeWidth="1"
                />
                {/* Trend polyline */}
                <polyline
                  fill="none"
                  stroke="#0b7a5a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={trendPoints.coords.map((p) => p.join(',')).join(' ')}
                />
                {/* Data points */}
                {trendPoints.coords.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p[0]}
                      cy={p[1]}
                      r={i === 6 ? 6 : 4}
                      fill={i === 6 ? '#c8321f' : '#0b7a5a'}
                      className={i === 6 ? 'animate-ping origin-center' : ''}
                    />
                    <circle
                      cx={p[0]}
                      cy={p[1]}
                      r={i === 6 ? 5 : 3.5}
                      fill={i === 6 ? '#c8321f' : '#0b7a5a'}
                    />
                    <text
                      x={p[0]}
                      y={trendPoints.h - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="currentColor"
                      className="text-[#4b6258] dark:text-[#98b0a5] font-medium"
                    >
                      {trendPoints.labels[i]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Live Feed & Attention */}
        <div className="space-y-6">
          {/* Needs Attention */}
          <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
            <h2 className="font-serif font-bold text-lg mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#c8321f]" />
              <span>Requires attention</span>
            </h2>

            <div className="divide-y divide-[#10231c]/10 dark:divide-white/10">
              {overdueMembers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setView('members')}
                  className="w-full py-2.5 flex items-center justify-between text-left text-xs hover:text-[#c8321f] transition-colors"
                >
                  <span className="font-medium text-[#10231c] dark:text-[#eaf0e8]">
                    {overdueMembers.length} members have overdue monthly subscription
                  </span>
                  <span className="font-bold font-mono text-[#c8321f] dark:text-[#ef5a45]">
                    {formatMoney(totalOverdueDues)}
                  </span>
                </button>
              )}

              {applications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setView('members')}
                  className="w-full py-2.5 flex items-center justify-between text-left text-xs hover:text-[#0b7a5a] transition-colors"
                >
                  <span className="font-medium text-[#10231c] dark:text-[#eaf0e8]">
                    {applications.length} applications await executive committee approval
                  </span>
                  <span className="font-semibold text-[#0b7a5a] dark:text-[#37c597]">Review</span>
                </button>
              )}

              {cleaningRoomsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setView('stay')}
                  className="w-full py-2.5 flex items-center justify-between text-left text-xs hover:text-amber-600 transition-colors"
                >
                  <span className="font-medium text-[#10231c] dark:text-[#eaf0e8]">
                    {cleaningRoomsCount} guest {cleaningRoomsCount > 1 ? 'rooms' : 'room'} awaiting housekeeping release
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Open rooms</span>
                </button>
              )}

              {readyDishesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setView('pos')}
                  className="w-full py-2.5 flex items-center justify-between text-left text-xs hover:text-[#0b7a5a] transition-colors"
                >
                  <span className="font-medium text-[#10231c] dark:text-[#eaf0e8]">
                    {readyDishesCount} kitchen ticket{readyDishesCount > 1 ? 's' : ''} ready to serve at outlets
                  </span>
                  <span className="font-semibold text-[#0b7a5a] dark:text-[#37c597]">Open POS</span>
                </button>
              )}

              <div className="py-2.5 flex items-center justify-between text-xs text-[#4b6258] dark:text-[#98b0a5]">
                <span>Low stock: Longjing tea (4 pots left), Peking duck (6)</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold cursor-pointer">
                  Auto-reorder
                </span>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif font-bold text-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0b7a5a] dark:text-[#37c597]" />
                <span>Live activity stream</span>
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#0b7a5a] dark:text-[#37c597] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live socket
              </span>
            </div>

            <ul className="divide-y divide-[#10231c]/10 dark:divide-white/10">
              {feed.slice(0, 6).map((item, index) => (
                <li
                  key={index}
                  className={`py-2.5 flex items-start gap-3 text-xs ${
                    index === 0 && item.fresh ? 'animate-slide-in font-medium' : ''
                  }`}
                >
                  <span className="font-mono text-[#4b6258] dark:text-[#98b0a5] shrink-0 pt-0.5">
                    {formatTimeHHMM(item.t)}
                  </span>
                  <span className="text-[#10231c] dark:text-[#eaf0e8] flex-1">{item.m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Upcoming Events Preview */}
      <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-lg">Next events on calendar</h2>
          <button
            type="button"
            onClick={() => setView('events')}
            className="flex items-center gap-1 text-xs font-semibold text-[#0b7a5a] dark:text-[#37c597] hover:underline"
          >
            <span>View all events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
              <tr>
                <th className="py-2.5 px-3">Event name</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Venue</th>
                <th className="py-2.5 px-3 text-right">Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
              {events.slice(0, 3).map((e) => (
                <tr key={e.id} className="hover:bg-black/2 dark:hover:bg-white/2">
                  <td className="py-3 px-3 font-semibold text-[#10231c] dark:text-[#eaf0e8]">
                    {e.n}
                  </td>
                  <td className="py-3 px-3 text-[#4b6258] dark:text-[#98b0a5]">
                    {e.d} · {e.t}
                  </td>
                  <td className="py-3 px-3 text-[#4b6258] dark:text-[#98b0a5]">{e.venue}</td>
                  <td className="py-3 px-3 text-right font-mono font-medium">
                    {e.reg} / {e.cap} seats
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
