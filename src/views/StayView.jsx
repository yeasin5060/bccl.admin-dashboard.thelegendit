import React, { useState } from 'react';
import { BedDouble, CheckCircle, AlertTriangle, Sparkles, Wrench, UserCheck } from 'lucide-react';
import { formatMoney } from '../data/initialData';

export default function StayView({
  rooms,
  selectedRoomNo,
  onSelectRoom,
  onCheckIn,
  onArriveToday,
  onOpenFolioModal,
  onMarkClean,
  onBlockMaintenance,
}) {
  const [guestNameInput, setGuestNameInput] = useState('');
  const [nightsInput, setNightsInput] = useState(2);

  const selectedRoom = rooms.find((r) => r.no === selectedRoomNo);
  const arrivalsToday = rooms.filter((r) => r.st === 'res');

  const statusCounts = rooms.reduce((acc, r) => {
    acc[r.st] = (acc[r.st] || 0) + 1;
    return acc;
  }, {});

  const STATUS_CFG = {
    occ: { label: 'Occupied', color: 'border-l-[#c8321f] text-red-700 dark:text-red-400', badge: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300' },
    vac: { label: 'Vacant', color: 'border-l-[#0b7a5a] text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' },
    res: { label: 'Reserved', color: 'border-l-[#2f6aa3] text-blue-700 dark:text-blue-400', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' },
    cln: { label: 'Cleaning', color: 'border-l-[#9a6b0c] text-amber-700 dark:text-amber-400', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' },
    mnt: { label: 'Maintenance', color: 'border-l-[#4b6258] text-gray-700 dark:text-gray-400', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Status Summary Chips */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(STATUS_CFG).map((key) => {
          const cfg = STATUS_CFG[key];
          return (
            <span
              key={key}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}
            >
              {statusCounts[key] || 0} {cfg.label.toLowerCase()}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Floor Rooms Grid + Arrivals */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-serif font-bold text-lg mb-3">Club guest house rooms</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {rooms.map((r) => {
                const cfg = STATUS_CFG[r.st] || STATUS_CFG.vac;
                const isSelected = r.no === selectedRoomNo;
                return (
                  <button
                    key={r.no}
                    type="button"
                    onClick={() => onSelectRoom(r.no)}
                    className={`text-left p-3.5 rounded-xl border-t border-r border-b border-[#10231c]/15 dark:border-white/15 border-l-4 ${
                      cfg.color
                    } bg-white dark:bg-[#11241d] shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#10231c] dark:ring-white shadow-md'
                        : ''
                    }`}
                  >
                    <b className="font-serif text-xl block leading-tight text-[#10231c] dark:text-[#eaf0e8]">
                      {r.no}
                    </b>
                    <small className="block text-xs text-[#4b6258] dark:text-[#98b0a5] mt-0.5 font-medium">
                      {r.type}
                    </small>
                    <small className="block text-[11px] text-[#72857a] truncate mt-1">
                      {cfg.label}
                      {r.guest ? ` · ${r.guest.split(',')[0]}` : ''}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrivals Today */}
          <div>
            <h2 className="font-serif font-bold text-lg mb-3 flex items-center justify-between">
              <span>Expected arrivals today</span>
              <span className="text-xs font-sans font-semibold text-[#2f6aa3]">
                {arrivalsToday.length} reservations
              </span>
            </h2>

            {arrivalsToday.length > 0 ? (
              <div className="bg-white dark:bg-[#11241d] rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs overflow-hidden">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                    {arrivalsToday.map((r) => (
                      <tr key={r.no} className="hover:bg-black/2 dark:hover:bg-white/2">
                        <td className="py-3 px-4 font-semibold text-[#10231c] dark:text-[#eaf0e8]">
                          {r.guest.replace(' (arrives today)', '')}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#4b6258] dark:text-[#98b0a5]">
                          Room {r.no} · {r.type}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#4b6258] dark:text-[#98b0a5]">
                          {r.nights} nights
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onArriveToday(r.no)}
                            className="px-3 py-1 rounded-lg bg-[#0b7a5a] hover:bg-[#085942] text-white text-xs font-semibold shadow-2xs"
                          >
                            Check in
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[#4b6258] dark:text-[#98b0a5]">
                No pending arrivals awaiting check-in for today.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Inspection & Action Side-Panel */}
        <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs sticky top-24">
          {selectedRoom ? (
            <div className="space-y-4">
              <div className="border-b border-[#10231c]/10 dark:border-white/10 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-2xl">Room {selectedRoom.no}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      STATUS_CFG[selectedRoom.st]?.badge
                    }`}
                  >
                    {STATUS_CFG[selectedRoom.st]?.label}
                  </span>
                </div>
                <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mt-1 font-medium">
                  {selectedRoom.type} · {formatMoney(selectedRoom.rate)} per night
                </p>
              </div>

              {/* Vacant state */}
              {selectedRoom.st === 'vac' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                      Guest name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ms. Rahman or Amb. Delegation"
                      value={guestNameInput}
                      onChange={(e) => setGuestNameInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                      Nights
                    </label>
                    <select
                      value={nightsInput}
                      onChange={(e) => setNightsInput(parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                    >
                      {[1, 2, 3, 4, 5, 7, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} {n > 1 ? 'nights' : 'night'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onCheckIn(selectedRoom.no, guestNameInput || 'Walk-in guest', nightsInput);
                        setGuestNameInput('');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0b7a5a] hover:bg-[#085942] text-white text-xs font-semibold shadow-xs"
                    >
                      Check in
                    </button>
                    <button
                      type="button"
                      onClick={() => onBlockMaintenance(selectedRoom.no)}
                      className="py-2 px-3 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-xs font-medium hover:bg-[#e2eae4] dark:hover:bg-[#183029]"
                    >
                      Block
                    </button>
                  </div>
                </div>
              )}

              {/* Occupied state */}
              {selectedRoom.st === 'occ' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#e2eae4]/50 dark:bg-[#183029]/50 rounded-xl text-xs">
                    <b className="text-[#10231c] dark:text-[#eaf0e8] text-sm block">{selectedRoom.guest}</b>
                    <span className="text-[#4b6258] dark:text-[#98b0a5] block mt-1">
                      {selectedRoom.nights} {selectedRoom.nights > 1 ? 'nights' : 'night'} booked
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenFolioModal(selectedRoom)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white text-xs font-semibold shadow-xs"
                  >
                    Check out & generate folio
                  </button>
                </div>
              )}

              {/* Reserved state */}
              {selectedRoom.st === 'res' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                    <b>Reserved arrival:</b> {selectedRoom.guest}
                  </div>
                  <button
                    type="button"
                    onClick={() => onArriveToday(selectedRoom.no)}
                    className="w-full py-2 px-4 rounded-xl bg-[#0b7a5a] hover:bg-[#085942] text-white text-xs font-semibold shadow-xs"
                  >
                    Check in guest
                  </button>
                </div>
              )}

              {/* Cleaning state */}
              {selectedRoom.st === 'cln' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#4b6258] dark:text-[#98b0a5]">
                    Housekeeping service in progress. Inspect and release room for check-in.
                  </p>
                  <button
                    type="button"
                    onClick={() => onMarkClean(selectedRoom.no)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-[#0b7a5a] hover:bg-[#085942] text-white text-xs font-semibold shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Mark room clean & ready</span>
                  </button>
                </div>
              )}

              {/* Maintenance state */}
              {selectedRoom.st === 'mnt' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#4b6258] dark:text-[#98b0a5]">
                    Room is blocked for maintenance or inspection.
                  </p>
                  <button
                    type="button"
                    onClick={() => onMarkClean(selectedRoom.no)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-[#0b7a5a] hover:bg-[#085942] text-white text-xs font-semibold shadow-xs"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Return to guest inventory</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#4b6258] dark:text-[#98b0a5]">
              <BedDouble className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select any room on the floor plan to manage check-in, checkout billing, or housekeeping status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
