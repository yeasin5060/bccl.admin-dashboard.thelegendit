import React, { useMemo } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  ChefHat,
  Receipt,
  CreditCard,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  OUTLETS,
  MENU,
  MENU_ITEMS_MAP,
  formatMoney,
} from '../data/initialData';

export default function PosView({
  outlet,
  setOutlet,
  tables,
  selectedTableId,
  onSelectTable,
  members,
  onAddDish,
  onQuantityPlus,
  onQuantityMinus,
  onSendKitchen,
  onServeItem,
  onRequestBill,
  onOpenPaymentModal,
  onAssignMember,
  onTogglePermit,
}) {
  const currentOutletConfig = OUTLETS[outlet];
  const outletTables = tables[outlet] || [];
  const selectedTable =
    outletTables.find((t) => t.id === selectedTableId) || outletTables[0];

  // Bill calculations for selected table
  const lineTotal = useMemo(() => {
    if (!selectedTable?.lines) return 0;
    return selectedTable.lines.reduce((sum, l) => {
      const item = MENU_ITEMS_MAP[l.k];
      return sum + (item ? item.p * l.q : 0);
    }, 0);
  }, [selectedTable]);

  const serviceCharge = lineTotal * 0.1;
  const vat = (lineTotal + serviceCharge) * 0.15;
  const grandTotal = Math.round(lineTotal + serviceCharge + vat);

  // Categories in current outlet menu
  const currentMenu = MENU[outlet] || [];
  const categories = useMemo(() => {
    const list = [];
    currentMenu.forEach((item) => {
      if (!list.includes(item.c)) list.push(item.c);
    });
    return list;
  }, [currentMenu]);

  // Kitchen tickets across all tables in this outlet
  const kitchenTickets = useMemo(() => {
    const tickets = [];
    outletTables.forEach((table) => {
      table.lines.forEach((l) => {
        if (l.s === 'cook' || l.s === 'ready') {
          tickets.push({ tableId: table.id, line: l });
        }
      });
    });
    return tickets;
  }, [outletTables]);

  const hasNewItems = selectedTable?.lines.some((l) => l.s === 'new');

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Outlet Switcher Tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(OUTLETS).map((key) => {
          const cfg = OUTLETS[key];
          const isActive = outlet === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setOutlet(key);
                const firstTable = tables[key]?.[0]?.id;
                if (firstTable) onSelectTable(firstTable);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#10231c] text-white dark:bg-[#eaf0e8] dark:text-[#0a1713] shadow-xs'
                  : 'bg-white dark:bg-[#11241d] border border-[#10231c]/15 dark:border-white/15 text-[#4b6258] dark:text-[#98b0a5] hover:bg-[#e2eae4] dark:hover:bg-[#183029]'
              }`}
            >
              <span>{cfg.n}</span>
              <span className="font-serif opacity-80">{cfg.z}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Floor Tables Grid + KDS */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-serif font-bold text-lg mb-3">
              {outlet === 'bar' ? 'Bar stools and cocktail terrace' : 'Floor tables layout'}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {outletTables.map((t) => {
                const isSelected = t.id === selectedTable?.id;
                const tot = t.lines.reduce((sum, l) => {
                  const it = MENU_ITEMS_MAP[l.k];
                  return sum + (it ? it.p * l.q : 0);
                }, 0);

                let statusBadge = 'Free';
                let statusClasses = 'bg-white dark:bg-[#11241d] border-[#10231c]/15 dark:border-white/15';

                if (t.st === 'open') {
                  statusBadge = formatMoney(tot);
                  statusClasses = 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200';
                } else if (t.st === 'bill') {
                  statusBadge = 'Bill requested';
                  statusClasses = 'border-red-400 bg-red-50/80 dark:bg-red-950/30 text-red-900 dark:text-red-200 animate-pulse-border';
                }

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTable(t.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${statusClasses} ${
                      isSelected
                        ? 'ring-2 ring-[#10231c] dark:ring-white shadow-md'
                        : 'shadow-2xs hover:-translate-y-0.5'
                    }`}
                  >
                    <b className="font-serif text-xl block leading-tight text-[#10231c] dark:text-[#eaf0e8]">
                      {t.id}
                    </b>
                    <small className="block text-xs text-[#4b6258] dark:text-[#98b0a5] mt-0.5">
                      {t.seats} {t.seats > 1 ? 'seats' : 'seat'}
                    </small>
                    <small className="block text-[11px] font-semibold mt-1 font-mono truncate">
                      {statusBadge}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kitchen Display System (KDS) */}
          <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs">
            <h2 className="font-serif font-bold text-lg mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#c8321f]" />
                Kitchen Display System (KDS)
              </span>
              <span className="text-xs font-sans font-medium text-[#4b6258] dark:text-[#98b0a5]">
                {kitchenTickets.length} active tickets
              </span>
            </h2>

            {kitchenTickets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {kitchenTickets.map((item, idx) => {
                  const dish = MENU_ITEMS_MAP[item.line.k];
                  const isReady = item.line.s === 'ready';

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isReady
                          ? 'border-[#0b7a5a] bg-emerald-50/70 dark:bg-emerald-950/20'
                          : 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <b className="font-serif text-sm font-bold">Table {item.tableId}</b>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isReady
                              ? 'bg-[#0b7a5a] text-white'
                              : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                          }`}
                        >
                          {isReady ? 'Ready' : 'Cooking'}
                        </span>
                      </div>
                      <p className="font-medium text-[#10231c] dark:text-[#eaf0e8]">
                        {item.line.q}× {dish?.n}
                      </p>
                      {isReady && (
                        <button
                          type="button"
                          onClick={() => onServeItem(item.tableId, item.line.k)}
                          className="w-full mt-2 py-1 px-2 rounded-lg bg-[#0b7a5a] text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark served
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#4b6258] dark:text-[#98b0a5]">
                No active tickets in the kitchen. Add dishes to a table and send to order queue.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Active Table Order Panel */}
        <div className="bg-white dark:bg-[#11241d] p-5 rounded-2xl border border-[#10231c]/10 dark:border-white/10 shadow-xs sticky top-24">
          {selectedTable ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#10231c]/10 dark:border-white/10 pb-3">
                <h3 className="font-serif font-bold text-2xl">Table {selectedTable.id}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedTable.st === 'free'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : selectedTable.st === 'open'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                  }`}
                >
                  {selectedTable.st === 'free'
                    ? 'Free'
                    : selectedTable.st === 'open'
                    ? 'Order in service'
                    : 'Bill requested'}
                </span>
              </div>

              {/* Member select */}
              <div>
                <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                  Member on table (optional)
                </label>
                <select
                  value={selectedTable.member || ''}
                  onChange={(e) => onAssignMember(selectedTable.id, e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                >
                  <option value="">Walk-in guest</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bar license check */}
              {outlet === 'bar' && (
                <label className="flex items-center gap-2 text-xs text-[#4b6258] dark:text-[#98b0a5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedTable.permit}
                    onChange={(e) => onTogglePermit(selectedTable.id, e.target.checked)}
                    className="rounded border-[#10231c]/20 text-[#c8321f]"
                  />
                  <span>Govt. excise beverage permit verified</span>
                </label>
              )}

              {/* Menu Categories & Item Buttons */}
              <div className="space-y-3 pt-1">
                {categories.map((cat) => (
                  <div key={cat}>
                    <span className="text-[11px] font-bold text-[#4b6258] dark:text-[#98b0a5] uppercase tracking-wider block mb-1">
                      {cat}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {currentMenu
                        .filter((i) => i.c === cat)
                        .map((item) => (
                          <button
                            key={item.k}
                            type="button"
                            onClick={() => onAddDish(selectedTable.id, item.k)}
                            className="p-2 rounded-xl border border-[#10231c]/10 dark:border-white/10 text-left hover:border-[#0b7a5a] transition-all bg-black/2 dark:bg-white/2 cursor-pointer"
                          >
                            <span className="font-semibold text-xs text-[#10231c] dark:text-[#eaf0e8] block truncate">
                              {item.n}
                            </span>
                            {item.z && (
                              <span className="font-serif text-[10px] text-[#4b6258] dark:text-[#98b0a5] block truncate">
                                {item.z}
                              </span>
                            )}
                            <span className="font-mono text-xs font-bold text-[#0b7a5a] dark:text-[#37c597] block mt-1">
                              {formatMoney(item.p)}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ordered Lines List */}
              <div className="border-t border-[#10231c]/10 dark:border-white/10 pt-3">
                <span className="text-xs font-semibold text-[#4b6258] dark:text-[#98b0a5] uppercase tracking-wider block mb-2">
                  Order Items ({selectedTable.lines.length})
                </span>

                {selectedTable.lines.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedTable.lines.map((line) => {
                      const item = MENU_ITEMS_MAP[line.k];
                      return (
                        <div
                          key={line.k}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-[#10231c]/5 dark:border-white/5"
                        >
                          <div className="flex-1 truncate mr-2">
                            <span className="font-medium text-[#10231c] dark:text-[#eaf0e8] block truncate">
                              {item?.n}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full inline-block font-semibold ${
                                line.s === 'new'
                                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                  : line.s === 'cook'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : line.s === 'ready'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {line.s === 'new'
                                ? 'Not sent'
                                : line.s === 'cook'
                                ? 'Cooking'
                                : line.s === 'ready'
                                ? 'Ready'
                                : 'Served'}
                            </span>
                          </div>

                          {line.s === 'new' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onQuantityMinus(selectedTable.id, line.k)}
                                className="w-5 h-5 rounded-full border border-[#10231c]/20 dark:border-white/20 flex items-center justify-center font-bold"
                              >
                                −
                              </button>
                              <span className="font-bold w-4 text-center">{line.q}</span>
                              <button
                                type="button"
                                onClick={() => onQuantityPlus(selectedTable.id, line.k)}
                                className="w-5 h-5 rounded-full border border-[#10231c]/20 dark:border-white/20 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="font-bold font-mono px-2">{line.q}×</span>
                          )}

                          <span className="font-mono font-medium w-16 text-right">
                            {formatMoney((item?.p || 0) * line.q)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] italic">
                    Tap any item above to initiate table order.
                  </p>
                )}
              </div>

              {/* Bill Totals */}
              <div className="border-t border-[#10231c]/10 dark:border-white/10 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#4b6258] dark:text-[#98b0a5]">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatMoney(lineTotal)}</span>
                </div>
                <div className="flex justify-between text-[#4b6258] dark:text-[#98b0a5]">
                  <span>Service charge (10%)</span>
                  <span className="font-mono">{formatMoney(serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-[#4b6258] dark:text-[#98b0a5]">
                  <span>VAT (15%)</span>
                  <span className="font-mono">{formatMoney(vat)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#10231c]/10 dark:border-white/10 font-serif text-base font-bold">
                  <span>Grand Total</span>
                  <span className="text-[#c8321f] dark:text-[#ef5a45] font-mono">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!hasNewItems}
                    onClick={() => onSendKitchen(selectedTable.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-xs font-semibold hover:bg-[#e2eae4] dark:hover:bg-[#183029] disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send kitchen</span>
                  </button>
                  <button
                    type="button"
                    disabled={!selectedTable.lines.length || selectedTable.st === 'bill'}
                    onClick={() => onRequestBill(selectedTable.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-xs font-semibold hover:bg-[#e2eae4] dark:hover:bg-[#183029] disabled:opacity-40"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Request bill</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!selectedTable.lines.length}
                  onClick={() => onOpenPaymentModal(selectedTable, grandTotal)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#c8321f] hover:bg-[#a62716] disabled:opacity-40 text-white font-semibold text-xs shadow-md active:scale-[0.98] transition-transform"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Settle & take payment</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] text-center py-12">
              Select a table on the floor layout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
