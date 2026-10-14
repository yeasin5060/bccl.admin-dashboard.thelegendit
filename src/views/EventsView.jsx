import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Palette,
  Copy,
  PlusCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  EVENT_TEMPLATES,
  formatMoney,
  EVENT_PREPARATION_FLOW,
} from '../data/initialData';

// Dynamic text fitting algorithm for trilingual SVG poster typography
function calculateFittingFontSize(str = '', maxW = 470, baseSize = 40, minSize = 14) {
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i);
    // CJK characters take more width
    if (/[\u4e00-\u9fff]/.test(c)) w += 1;
    // Bengali characters
    else if (/[\u0980-\u09FF]/.test(c)) w += 0.72;
    else if (/\s/.test(c)) w += 0.3;
    else w += 0.58;
  }
  return Math.max(minSize, Math.min(baseSize, maxW / (w || 1)));
}

export default function EventsView({
  events,
  onOpenEventDetail,
  onOpenUseTemplate,
  onCreateEventFromInvitation,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'tpl' | 'inv'
  const [templateCategory, setTemplateCategory] = useState('');

  // Invitation Studio state
  const [invitation, setInvitation] = useState({
    theme: 'lantern', // 'lantern' | 'bridge' | 'tea'
    en: 'Friendship Tea Evening',
    zh: '友谊茶会',
    bn: 'বন্ধুত্বের চা-সন্ধ্যা',
    date: '31 October 2026',
    time: '17:00',
    venue: 'Tea Garden Café, Gulshan',
    rsvp: 'RSVP: events@bccl.example',
  });

  const handleCopyInvitationText = () => {
    const text = [
      invitation.zh,
      invitation.bn,
      invitation.en,
      '',
      `Date: ${invitation.date}, ${invitation.time}`,
      `Venue: ${invitation.venue}`,
      invitation.rsvp,
      '',
      'Bangladesh China Club Ltd · বাংলাদেশ–চীন মৈত্রী · 孟中友好',
    ].join('\n');

    navigator.clipboard.writeText(text).then(
      () => showToast('Invitation text copied for WeChat/WhatsApp'),
      () => showToast('Failed to copy invitation text')
    );
  };

  const CATEGORY_COLORS = {
    Cultural: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300',
    Dining: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
    Sports: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300',
    Diplomatic: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
  };

  // Render SVG poster artwork
  const renderThemeArtwork = () => {
    if (invitation.theme === 'lantern') {
      const lanterns = [
        [110, 1],
        [205, 1.15],
        [300, 1.3],
        [395, 1.15],
        [490, 1],
      ];
      return (
        <g>
          <path d="M80 80H520" stroke="#e8b04a" strokeWidth="2" />
          {lanterns.map(([x, scale], j) => (
            <g key={j}>
              <path d={`M${x} 80V${100 + (j % 2) * 14}`} stroke="#e8b04a" />
              <g
                transform={`translate(${x} ${130 + (j % 2) * 14 + (scale - 1) * 40}) scale(${scale})`}
              >
                <path
                  d="M-14 -18C-22 -6 -22 10 -13 20L13 20C22 10 22 -6 14 -18Z"
                  fill="#d8362a"
                />
                <path
                  d="M0 -18V20M-8 -17C-12 -4 -11 10 -7 20M8 -17C12 -4 11 10 7 20"
                  stroke="rgba(255,205,130,0.4)"
                  fill="none"
                />
                <rect x="-10" y="-23" width="20" height="5" fill="#e8b04a" />
                <rect x="-10" y="20" width="20" height="4" fill="#e8b04a" />
                <path d="M0 24V46" stroke="#e8b04a" strokeWidth="2" />
              </g>
            </g>
          ))}
        </g>
      );
    }

    if (invitation.theme === 'bridge') {
      const piers = [];
      for (let i = 1; i < 8; i++) {
        const t = i / 8;
        const y = (1 - t) * (1 - t) * 268 + 2 * (1 - t) * t * 118 + t * t * 268;
        piers.push(
          <path
            key={i}
            d={`M${90 + t * 420} ${y}V268`}
            stroke="#e8b04a"
            strokeWidth="2"
          />
        );
      }
      return (
        <g>
          <circle cx="300" cy="212" r="64" fill="#e0412f" />
          <rect x="60" y="268" width="480" height="70" fill="#08241c" />
          <path
            d="M90 268Q300 118 510 268"
            fill="none"
            stroke="#e8b04a"
            strokeWidth="7"
          />
          <path d="M70 268H530" stroke="#e8b04a" strokeWidth="6" />
          {piers}
          {[284, 298, 312].map((y, j) => (
            <path
              key={j}
              d={`M80 ${y} q20 -7 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`}
              fill="none"
              stroke="#37c597"
              strokeOpacity={0.55 - j * 0.12}
              strokeWidth="2"
            />
          ))}
        </g>
      );
    }

    if (invitation.theme === 'tea') {
      const dots = [];
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * 6.283;
        dots.push(
          <circle
            key={i}
            cx={(300 + Math.cos(a) * 118).toFixed(1)}
            cy={(228 + Math.sin(a) * 118).toFixed(1)}
            r={i % 2 ? 3 : 4.5}
            fill="#e8b04a"
            opacity="0.7"
          />
        );
      }
      return (
        <g>
          {dots}
          <path
            d="M232 206h136c0 50-26 80-68 80s-68-30-68-80z"
            fill="#f4efe2"
          />
          <path
            d="M370 220c34 0 34 42 0 42"
            fill="none"
            stroke="#f4efe2"
            strokeWidth="8"
          />
          <path d="M236 226h128" stroke="#e0412f" strokeWidth="6" />
          <ellipse cx="300" cy="292" rx="92" ry="9" fill="#e8b04a" />
          <path
            d="M270 190c-10-14 10-22 0-38M300 190c-10-14 10-22 0-38M330 190c-10-14 10-22 0-38"
            fill="none"
            stroke="#e8b04a"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      );
    }

    return null;
  };

  const zhFontSize = calculateFittingFontSize(invitation.zh, 470, 54, 22);
  const bnFontSize = calculateFittingFontSize(invitation.bn, 470, 40, 18);
  const enFontSize = calculateFittingFontSize(invitation.en, 470, 30, 14);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Subtabs Bar */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'list', label: 'Events register' },
          { id: 'tpl', label: 'Activity templates' },
          { id: 'inv', label: 'Friendship invitation studio' },
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

      {/* Events Register Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="font-serif font-bold text-xl">Scheduled Club Events</h2>
            <button
              type="button"
              onClick={() => setActiveTab('tpl')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule from template</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#eef2ed]/60 dark:bg-[#07140f]/60 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase border-b border-[#10231c]/10 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">RSVP / Cap</th>
                    <th className="py-3 px-4 text-right">Ticket revenue</th>
                    <th className="py-3 px-4">Logistics readiness</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                  {events.map((e) => {
                    const totalChk = e.chk?.length || 1;
                    const doneChk = e.chk?.filter((c) => c.d)?.length || 0;
                    const prepPct = Math.round((doneChk / totalChk) * 100);
                    const fillPct = Math.round((e.reg / e.cap) * 100);

                    return (
                      <tr key={e.id} className="hover:bg-black/2 dark:hover:bg-white/2">
                        <td className="py-3 px-4 text-xs">
                          <b className="text-[#10231c] dark:text-[#eaf0e8]">{e.d}</b>
                          <span className="text-[#4b6258] dark:text-[#98b0a5] block">{e.t}</span>
                        </td>
                        <td className="py-3 px-4">
                          <b className="text-[#10231c] dark:text-[#eaf0e8]">{e.n}</b>
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                                CATEGORY_COLORS[e.cat] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {e.cat}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#4b6258] dark:text-[#98b0a5]">
                          {e.venue}
                        </td>
                        <td className="py-3 px-4 min-w-[130px]">
                          <span className="text-xs font-mono font-medium">
                            {e.reg} / {e.cap}
                          </span>
                          <div className="h-1.5 w-full rounded-full bg-[#e2eae4] dark:bg-[#183029] overflow-hidden mt-1">
                            <div
                              className="h-full bg-[#0b7a5a] dark:bg-[#37c597] rounded-full transition-all"
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-[#10231c] dark:text-[#eaf0e8]">
                          {formatMoney(e.reg * e.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono font-semibold text-[#0b7a5a] dark:text-[#37c597]">
                            {prepPct}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenEventDetail(e)}
                            className="px-3 py-1 rounded-lg border border-[#10231c]/15 dark:border-white/15 text-xs font-medium hover:bg-[#e2eae4] dark:hover:bg-[#183029]"
                          >
                            Open checklist
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

      {/* Activity Templates Tab */}
      {activeTab === 'tpl' && (
        <div className="space-y-6">
          <div>
            <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] max-w-2xl">
              Turnkey event blueprints curated for Bangladesh–China cultural galas, diplomatic luncheons, culinary workshops, and athletic matches. Preloaded with logistics checklists, budgets, and attendee capacities.
            </p>

            <div className="flex gap-2 flex-wrap my-4">
              {['', 'Cultural', 'Dining', 'Sports', 'Diplomatic'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    templateCategory === cat
                      ? 'bg-[#10231c] text-white dark:bg-[#eaf0e8] dark:text-[#0a1713] border-[#10231c]'
                      : 'border-[#10231c]/15 dark:border-white/15 text-[#4b6258] dark:text-[#98b0a5] hover:bg-[#e2eae4] dark:hover:bg-[#183029]'
                  }`}
                >
                  {cat || 'All Categories'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EVENT_TEMPLATES.filter(
              (t) => !templateCategory || t.cat === templateCategory
            ).map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#11241d] border border-[#10231c]/10 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <span className="text-3xl block mb-2">{t.ic}</span>
                  <h4 className="font-serif font-bold text-lg leading-tight">{t.n}</h4>
                  <p className="font-serif text-xs text-[#c8321f] dark:text-[#ef5a45] mt-1">
                    <span lang="zh">{t.z}</span> · <span lang="bn">{t.b}</span>
                  </p>
                  <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mt-2">
                    {t.venue}. Up to {t.cap} guests. Estimated budget {formatMoney(t.budget)}.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#10231c]/10 dark:border-white/10">
                  <span className="text-xs font-semibold font-mono text-[#0b7a5a] dark:text-[#37c597]">
                    {t.price > 0 ? `${formatMoney(t.price)} a ticket` : 'By invitation'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenUseTemplate(t)}
                    className="px-3 py-1.5 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white text-xs font-semibold shadow-2xs active:scale-95 transition-transform"
                  >
                    Use template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friendship Invitation Studio Tab */}
      {activeTab === 'inv' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Controls */}
          <div className="bg-white dark:bg-[#11241d] p-6 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif font-bold text-xl">Multilingual Invitation Studio</h3>
              <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mt-1">
                Compose custom trilingual formal cards. Live vector poster updates instantly with traditional cultural ornamentation.
              </p>
            </div>

            {/* Theme selector */}
            <div>
              <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                Visual Art Motif
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'lantern', label: 'Imperial Lanterns' },
                  { id: 'bridge', label: 'Padma Bridge' },
                  { id: 'tea', label: 'Tea & Alpona' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setInvitation({ ...invitation, theme: th.id })}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      invitation.theme === th.id
                        ? 'bg-[#10231c] text-white dark:bg-[#eaf0e8] dark:text-[#0a1713] border-[#10231c]'
                        : 'border-[#10231c]/15 dark:border-white/15 text-[#4b6258] dark:text-[#98b0a5]'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Titles */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                  Title in English
                </label>
                <input
                  type="text"
                  value={invitation.en}
                  onChange={(e) => setInvitation({ ...invitation, en: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                  Title in Chinese (中文)
                </label>
                <input
                  type="text"
                  value={invitation.zh}
                  onChange={(e) => setInvitation({ ...invitation, zh: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                  Title in Bengali (বাংলা)
                </label>
                <input
                  type="text"
                  value={invitation.bn}
                  onChange={(e) => setInvitation({ ...invitation, bn: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={invitation.date}
                  onChange={(e) => setInvitation({ ...invitation, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={invitation.time}
                  onChange={(e) => setInvitation({ ...invitation, time: e.target.value })}
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
                value={invitation.venue}
                onChange={(e) => setInvitation({ ...invitation, venue: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] mb-1">
                RSVP Line
              </label>
              <input
                type="text"
                value={invitation.rsvp}
                onChange={(e) => setInvitation({ ...invitation, rsvp: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={handleCopyInvitationText}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white text-xs font-semibold shadow-xs"
              >
                <Copy className="w-4 h-4" />
                <span>Copy text for WeChat / WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => onCreateEventFromInvitation(invitation)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-xs font-semibold hover:bg-[#e2eae4] dark:hover:bg-[#183029]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create event</span>
              </button>
            </div>
          </div>

          {/* SVG Live Poster Render */}
          <div className="bg-[#08241c] rounded-2xl p-4 shadow-xl border border-[#e8b04a]/30">
            <svg
              viewBox="0 0 600 820"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto rounded-xl shadow-lg"
              role="img"
              aria-label="Invitation preview poster"
            >
              <defs>
                <linearGradient id="posterBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#08241c" />
                  <stop offset="100%" stopColor="#0d3a2d" />
                </linearGradient>
                <pattern
                  id="posterLattice"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M2 2h16v16H2zM6 6h8v8H6z"
                    fill="none"
                    stroke="#e8b04a"
                    strokeOpacity="0.5"
                  />
                </pattern>
              </defs>

              <rect width="600" height="820" fill="url(#posterBg)" />
              <rect x="20" y="20" width="560" height="780" fill="url(#posterLattice)" />
              <rect
                x="46"
                y="46"
                width="508"
                height="728"
                fill="url(#posterBg)"
                stroke="#e8b04a"
                strokeWidth="1.5"
              />

              {/* Theme Artwork */}
              {renderThemeArtwork()}

              {/* Multilingual Text in Poster */}
              <text
                x="300"
                y="420"
                textAnchor="middle"
                fontFamily="'Noto Serif SC', serif"
                fontWeight="700"
                fontSize={zhFontSize}
                fill="#f1f3ec"
              >
                {invitation.zh}
              </text>
              <text
                x="300"
                y="486"
                textAnchor="middle"
                fontFamily="'Noto Serif Bengali', serif"
                fontWeight="700"
                fontSize={bnFontSize}
                fill="#e8b04a"
              >
                {invitation.bn}
              </text>
              <text
                x="300"
                y="540"
                textAnchor="middle"
                fontFamily="'Noto Serif Display', Georgia, serif"
                fontSize={enFontSize}
                fill="#d4dfd7"
              >
                {invitation.en}
              </text>

              {/* Decorative divider */}
              <path d="M200 574H400" stroke="#e0412f" strokeWidth="2" />
              <circle cx="300" cy="574" r="5" fill="#e0412f" />

              <text
                x="300"
                y="620"
                textAnchor="middle"
                fontFamily="'Noto Serif Display', serif"
                fontSize="22"
                fill="#f1f3ec"
              >
                {invitation.date} · {invitation.time}
              </text>
              <text
                x="300"
                y="660"
                textAnchor="middle"
                fontFamily="'Noto Serif Display', serif"
                fontSize="18"
                fill="#d4dfd7"
              >
                {invitation.venue}
              </text>
              <text
                x="300"
                y="700"
                textAnchor="middle"
                fontFamily="sans-serif"
                fontSize="14"
                fill="#98b0a5"
              >
                {invitation.rsvp}
              </text>
              <text
                x="300"
                y="750"
                textAnchor="middle"
                fontFamily="'Noto Serif Bengali', 'Noto Serif SC', serif"
                fontSize="18"
                fill="#e8b04a"
              >
                বাংলাদেশ–চীন মৈত্রী · 孟中友好
              </text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
