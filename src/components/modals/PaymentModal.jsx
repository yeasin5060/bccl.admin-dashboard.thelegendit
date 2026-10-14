import React, { useState } from 'react';
import { X, CheckCircle2, AlertOctagon, RotateCw, QrCode, ShieldCheck } from 'lucide-react';
import {
  PAYMENT_METHODS,
  formatMoney,
  createPRNG,
  getMemberStatus,
} from '../../data/initialData';

// Generates authentic-looking QR code matrix SVG
function renderQRSVG(seed = 7, size = 160) {
  const prng = createPRNG(seed);
  const gridSize = 21;
  const elements = [];

  const finder = (x, y, key) => (
    <g key={key}>
      <rect x={x} y={y} width="7" height="7" fill="#111" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#f4f1e6" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#111" />
    </g>
  );

  elements.push(finder(0, 0, 'f1'));
  elements.push(finder(14, 0, 'f2'));
  elements.push(finder(0, 14, 'f3'));

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
      if (prng() > 0.5) {
        elements.push(
          <rect key={`c-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111" />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className="rounded-lg shadow-sm"
    >
      <rect width={gridSize} height={gridSize} fill="#f4f1e6" />
      {elements}
    </svg>
  );
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  title,
  outlet,
  initialMem = '',
  members = [],
  onPaymentSuccess,
  addTransaction,
}) {
  const [method, setMethod] = useState('bKash');
  const [selectedMem, setSelectedMem] = useState(initialMem);
  const [simulateFail, setSimulateFail] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'proc' | 'ok' | 'fail'
  const [failMsg, setFailMsg] = useState('');
  const [successRef, setSuccessRef] = useState('');
  const [successNote, setSuccessNote] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    setStep('proc');

    setTimeout(() => {
      let failure = '';

      if (simulateFail) {
        failure =
          method === 'Card'
            ? 'The card issuer declined the payment (code 05).'
            : 'The digital wallet did not authorise this payment.';
      }

      if (!failure && method === 'Member account') {
        const memObj = members.find((m) => m.id === selectedMem);
        if (!memObj || getMemberStatus(memObj) !== 'Active') {
          failure = 'This member has overdue dues. Collect dues first, then charge again.';
        }
      }

      if (failure) {
        setStep('fail');
        setFailMsg(failure);
        addTransaction({
          outlet,
          method,
          amount,
          st: 'Failed',
        });
        return;
      }

      // Success transaction
      const newTxn = addTransaction({
        outlet,
        method,
        amount,
        st: 'Success',
      });

      setSuccessRef(newTxn.id);

      if (method === 'Member account') {
        const memObj = members.find((m) => m.id === selectedMem);
        if (memObj) {
          memObj.spend += amount;
          setSuccessNote(`Posted to ${memObj.name}’s account`);
        }
      } else {
        setSuccessNote('');
      }

      setStep('ok');
      if (onPaymentSuccess) {
        onPaymentSuccess(newTxn);
      }
    }, 1100);
  };

  const handleRetry = () => {
    setStep('form');
    setSimulateFail(false);
    setFailMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#11241d] text-[#10231c] dark:text-[#eaf0e8] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 relative animate-slide-in max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#e2eae4] dark:bg-[#183029] flex items-center justify-center text-[#4b6258] dark:text-[#98b0a5] hover:text-[#10231c] dark:hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'form' && (
          <div>
            <h3 className="font-serif font-bold text-xl">{title}</h3>
            <div className="font-serif text-3xl font-extrabold text-[#0b7a5a] dark:text-[#37c597] my-2">
              {formatMoney(amount)}
            </div>

            {/* Methods chips */}
            <div className="flex flex-wrap gap-1.5 my-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    method === m
                      ? 'bg-[#10231c] text-white dark:bg-[#eaf0e8] dark:text-[#0a1713] border-[#10231c]'
                      : 'border-[#10231c]/15 dark:border-white/15 text-[#4b6258] dark:text-[#98b0a5] hover:bg-[#e2eae4] dark:hover:bg-[#183029]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Method Details */}
            <div className="space-y-3 mt-4">
              {(method === 'bKash' || method === 'Nagad') && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                      {method} wallet number
                    </label>
                    <input
                      defaultValue="01711 000 000"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                      One-time code (demo OTP)
                    </label>
                    <input
                      defaultValue="482 913"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                    />
                  </div>
                </>
              )}

              {(method === 'Alipay' || method === 'WeChat Pay') && (
                <div className="flex flex-col items-center justify-center p-3">
                  <div className="relative p-3 bg-[#f4f1e6] rounded-2xl shadow-inner overflow-hidden border border-[#e8b04a]/30">
                    <div className="absolute inset-x-0 h-0.5 bg-[#e0412f] shadow-[0_0_10px_#e0412f] animate-scan" />
                    {renderQRSVG(method === 'Alipay' ? 7 : 11, 160)}
                  </div>
                  <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] text-center mt-3">
                    Customer scans with {method}. Press Confirm to simulate instantaneous checkout.
                  </p>
                </div>
              )}

              {method === 'Card' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                      Card number
                    </label>
                    <input
                      defaultValue="4242 4242 4242 4242"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                        Expiry
                      </label>
                      <input
                        defaultValue="08/29"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                        Network
                      </label>
                      <select className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]">
                        <option>Visa</option>
                        <option>Mastercard</option>
                        <option>UnionPay</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {method === 'Member account' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                      Charge to member register
                    </label>
                    <select
                      value={selectedMem}
                      onChange={(e) => setSelectedMem(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                    >
                      {members.map((x) => {
                        const st = getMemberStatus(x);
                        return (
                          <option key={x.id} value={x.id}>
                            {x.name} ({x.id}) {st !== 'Active' ? `· ${st}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Note: Members with overdue monthly dues cannot charge to their club account.
                  </p>
                </>
              )}

              {method === 'Cash' && (
                <div>
                  <label className="block text-xs font-medium text-[#4b6258] dark:text-[#98b0a5] mb-1">
                    Cash received
                  </label>
                  <input
                    defaultValue={Math.ceil(amount / 500) * 500}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#10231c]/15 dark:border-white/15 bg-white dark:bg-[#183029]"
                  />
                </div>
              )}

              {/* Declined payment simulation option */}
              <label className="flex items-center gap-2.5 text-xs text-[#4b6258] dark:text-[#98b0a5] cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={simulateFail}
                  onChange={(e) => setSimulateFail(e.target.checked)}
                  className="rounded border-[#10231c]/20 text-[#c8321f] focus:ring-[#c8321f]"
                />
                <span>Simulate a declined payment response from gateway</span>
              </label>

              <button
                type="button"
                onClick={handleConfirm}
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-[#c8321f] hover:bg-[#a62716] text-white font-semibold shadow-md active:scale-[0.98] transition-transform text-sm"
              >
                Confirm payment
              </button>
            </div>
          </div>
        )}

        {step === 'proc' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#e2eae4] dark:border-[#183029] border-t-[#c8321f] animate-spin-fast mb-4" />
            <p className="text-sm font-medium text-[#4b6258] dark:text-[#98b0a5]">
              Contacting {method} merchant gateway…
            </p>
            <p className="text-xs text-[#72857a] mt-1">Verifying encrypted token</p>
          </div>
        )}

        {step === 'ok' && (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#0b7a5a] dark:text-[#37c597] mb-3">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>
            <h4 className="font-serif font-bold text-xl">Payment received</h4>
            <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mt-1">
              {method} · Reference <span className="font-mono font-bold">{successRef}</span>
              <br />
              Digital receipt sent via SMS and WeChat (demo)
              {successNote && (
                <>
                  <br />
                  <span className="text-[#0b7a5a] dark:text-[#37c597] font-medium">{successNote}</span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-6 py-2.5 px-4 rounded-xl bg-[#0b7a5a] dark:bg-[#37c597] text-white dark:text-[#06130e] font-semibold shadow-md active:scale-[0.98] transition-transform text-sm"
            >
              Done
            </button>
          </div>
        )}

        {step === 'fail' && (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#c8321f] dark:text-[#ef5a45] mb-3">
              <AlertOctagon className="w-10 h-10 stroke-[2.2]" />
            </div>
            <h4 className="font-serif font-bold text-xl text-[#c8321f] dark:text-[#ef5a45]">
              Payment not completed
            </h4>
            <p className="text-xs text-[#4b6258] dark:text-[#98b0a5] mt-2 max-w-xs">{failMsg}</p>
            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#c8321f] text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-transform"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#10231c]/15 dark:border-white/15 text-[#10231c] dark:text-[#eaf0e8] hover:bg-[#e2eae4] dark:hover:bg-[#183029] font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
