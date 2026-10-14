import React from 'react';
import { X, Receipt, CreditCard } from 'lucide-react';
import { formatMoney, createPRNG } from '../../data/initialData';

export default function RoomFolioModal({ isOpen, onClose, room, onTakePayment }) {
  if (!isOpen || !room) return null;

  const prng = createPRNG(room.no * 17);
  const roomTotal = room.rate * room.nights;
  const extraCharges = Math.round((800 + prng() * 3500) / 10) * 10;
  const subtotal = roomTotal + extraCharges;
  const vat = subtotal * 0.15;
  const grandTotal = Math.round(subtotal + vat);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#11241d] text-[#10231c] dark:text-[#eaf0e8] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 relative animate-slide-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#e2eae4] dark:bg-[#183029] flex items-center justify-center text-[#4b6258] dark:text-[#98b0a5] hover:text-[#10231c] dark:hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Receipt className="w-5 h-5 text-[#c8321f]" />
          <h3 className="font-serif font-bold text-xl">Guest House Folio</h3>
        </div>
        <p className="text-sm font-semibold text-[#10231c] dark:text-[#eaf0e8]">
          Room {room.no} · {room.type}
        </p>
        <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mb-4">{room.guest}</p>

        <div className="space-y-2.5 my-4 text-sm divide-y divide-[#10231c]/10 dark:divide-white/10">
          <div className="flex justify-between pt-1">
            <span className="text-[#4b6258] dark:text-[#98b0a5]">
              Room charge ({room.nights} {room.nights > 1 ? 'nights' : 'night'} @ {formatMoney(room.rate)})
            </span>
            <span className="font-mono font-medium">{formatMoney(roomTotal)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-[#4b6258] dark:text-[#98b0a5]">Restaurant, minibar & bar charges</span>
            <span className="font-mono font-medium">{formatMoney(extraCharges)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-[#4b6258] dark:text-[#98b0a5]">Subtotal</span>
            <span className="font-mono font-medium">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-[#4b6258] dark:text-[#98b0a5]">Government VAT (15%)</span>
            <span className="font-mono font-medium">{formatMoney(vat)}</span>
          </div>
          <div className="flex justify-between pt-3 font-serif text-lg font-bold">
            <span>Grand Total</span>
            <span className="text-[#c8321f] dark:text-[#ef5a45] font-mono">{formatMoney(grandTotal)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onTakePayment(room, grandTotal);
          }}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-transform"
        >
          <CreditCard className="w-4 h-4" />
          Take payment & checkout
        </button>
      </div>
    </div>
  );
}
