import React, { useState } from 'react';
import { Dumbbell, Scan, CheckCircle, ShieldAlert, Users, Calendar } from 'lucide-react';
import {
  SLOT_TIMES,
  SLOT_FACILITIES,
  getMemberStatus,
} from '../data/initialData';

export default function FitnessView({
  facilities,
  classes,
  slots,
  members,
  onBookClass,
  onToggleSlot,
  onGateScan,
}) {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanClick = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const randomMember = members[Math.floor(Math.random() * members.length)];
      const randomFacIndex = Math.floor(Math.random() * 3);
      const status = getMemberStatus(randomMember);

      let res = {};
      if (status === 'Suspended') {
        res = {
          success: false,
          member: randomMember,
          msg: `${randomMember.name}: Account suspended. Please refer member to front desk.`,
        };
      } else {
        onGateScan(randomFacIndex);
        res = {
          success: true,
          member: randomMember,
          facilityName: facilities[randomFacIndex][0],
          isOverdue: status === 'Overdue',
          msg: `${randomMember.name} (${randomMember.id}) checked in to ${facilities[randomFacIndex][0]}.`,
        };
      }
      setScanResult(res);
    }, 700);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Col: Real-time Facility Occupancy + Daily Classes */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
            <h2 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#0b7a5a] dark:text-[#37c597]" />
              <span>Real-time sports club occupancy</span>
            </h2>

            <div className="space-y-3.5">
              {facilities.map((f, i) => {
                const [name, zhName, cap, current] = f;
                const ratio = current / cap;
                const pct = Math.min(100, Math.round(ratio * 100));
                const isCrowded = ratio > 0.8;

                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="w-36 font-medium text-[#10231c] dark:text-[#eaf0e8]">
                      <span>{name}</span>{' '}
                      <span className="font-serif text-[#4b6258] dark:text-[#98b0a5] text-[11px]">
                        {zhName}
                      </span>
                    </div>

                    <div className="flex-1 h-3 rounded-full bg-[#e2eae4] dark:bg-[#183029] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCrowded
                            ? 'bg-[#c8321f]'
                            : 'bg-linear-to-r from-[#0b7a5a] to-[#e8b04a]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-16 text-right font-mono font-medium text-[#4b6258] dark:text-[#98b0a5]">
                      {current} / {cap}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Classes Table */}
          <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
            <h2 className="font-serif font-bold text-lg mb-3">Today’s coaching classes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-[#10231c]/5 dark:divide-white/5">
                  {classes.map((c, i) => {
                    const [time, name, zhName, cap, reg] = c;
                    const isFull = reg >= cap;
                    return (
                      <tr key={i} className="hover:bg-black/2 dark:hover:bg-white/2">
                        <td className="py-2.5 px-2 font-mono text-[#4b6258] dark:text-[#98b0a5]">
                          {time}
                        </td>
                        <td className="py-2.5 px-2 font-semibold text-[#10231c] dark:text-[#eaf0e8]">
                          {name}{' '}
                          {zhName && (
                            <span className="font-serif text-[#0b7a5a] dark:text-[#37c597] font-normal">
                              {zhName}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-[#4b6258] dark:text-[#98b0a5] font-mono">
                          {reg} / {cap}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            disabled={isFull}
                            onClick={() => onBookClass(i)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isFull
                                ? 'border border-[#10231c]/15 text-[#4b6258] opacity-50 cursor-not-allowed'
                                : 'bg-[#0b7a5a] hover:bg-[#085942] text-white shadow-2xs'
                            }`}
                          >
                            {isFull ? 'Full' : 'Add member'}
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

        {/* Right Col: Gate Scanner Animation */}
        <div className="bg-white dark:bg-[#11241d] p-6 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-lg flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#c8321f]" />
            <span>Digital Gate Entry Scanner</span>
          </h2>
          <p className="text-xs text-[#4b6258] dark:text-[#98b0a5]">
            Members tap NFC biometric credentials or dynamic WeChat/Alipay QR at club gates. Test random verification with live ledger checks below.
          </p>

          <div
            className={`relative p-8 rounded-2xl border-2 border-dashed border-[#10231c]/20 dark:border-white/20 bg-[#e2eae4]/30 dark:bg-[#183029]/30 flex flex-col items-center justify-center text-center overflow-hidden min-h-[140px] ${
              isScanning ? 'border-[#c8321f]' : ''
            }`}
          >
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-[#c8321f] shadow-[0_0_12px_#c8321f] animate-scan" />
            )}

            <button
              type="button"
              disabled={isScanning}
              onClick={handleScanClick}
              className="py-2.5 px-6 rounded-xl bg-[#c8321f] hover:bg-[#a62716] disabled:opacity-50 text-white font-semibold text-xs shadow-md active:scale-95 transition-transform"
            >
              {isScanning ? 'Verifying member credentials…' : 'Simulate card tap'}
            </button>
          </div>

          {scanResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs animate-slide-in ${
                scanResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-[#0b7a5a] text-emerald-950 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-400 text-red-950 dark:text-red-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {scanResult.success ? (
                  <CheckCircle className="w-4 h-4 text-[#0b7a5a] dark:text-[#37c597]" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-[#c8321f]" />
                )}
                <span>{scanResult.success ? 'Access granted' : 'Access denied'}</span>
              </div>
              <p className="font-medium">{scanResult.msg}</p>
              {scanResult.isOverdue && (
                <p className="text-amber-700 dark:text-amber-400 font-semibold mt-1">
                  ⚠️ Note: Member has overdue monthly subscription dues. Staff notified at reception.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Court and Table Tennis Bookings Matrix */}
      <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
        <h2 className="font-serif font-bold text-lg mb-4">
          Court and table tennis reservation grid today
        </h2>

        <div className="overflow-x-auto">
          <div className="min-w-[550px] space-y-2">
            {/* Header row with time slots */}
            <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] pb-1 border-b border-[#10231c]/10 dark:border-white/10 text-center">
              <span className="text-left font-bold">Court / Table</span>
              {SLOT_TIMES.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>

            {/* Matrix rows */}
            {SLOT_FACILITIES.map((facility) => (
              <div key={facility} className="grid grid-cols-7 gap-2 items-center text-xs">
                <span className="font-medium text-[#10231c] dark:text-[#eaf0e8] truncate">
                  {facility}
                </span>
                {SLOT_TIMES.map((time) => {
                  const key = facility + time;
                  const isBooked = !!slots[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onToggleSlot(key)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isBooked
                          ? 'bg-[#0b7a5a] text-white border-[#0b7a5a] shadow-xs'
                          : 'bg-white dark:bg-[#183029] border-[#10231c]/15 dark:border-white/15 text-[#4b6258] dark:text-[#98b0a5] hover:bg-[#e2eae4] dark:hover:bg-[#11241d]'
                      }`}
                    >
                      {isBooked ? 'Booked' : 'Free'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
