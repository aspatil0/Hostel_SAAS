import { useState } from 'react';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Receipt,
  User,
  Phone,
  Mail,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { StudentFeeInvoice, StudentProfile, DemoPaymentResponse } from '@/types/student';
import { studentPortalService } from '@/services/studentPortalService';

interface DemoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: StudentFeeInvoice | null;
  profile: StudentProfile | null;
  onPaymentSuccess: (response: DemoPaymentResponse) => void;
}

export function DemoPaymentModal({
  isOpen,
  onClose,
  invoice,
  profile,
  onPaymentSuccess,
}: DemoPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<DemoPaymentResponse | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!invoice || !profile) return null;

  const payableAmount = customAmount !== null ? customAmount : invoice.remainingBalance;

  const handlePay = async () => {
    if (isSubmitting) return; // Prevent duplicate payment submissions
    if (payableAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (payableAmount > invoice.remainingBalance) {
      setError(`Payment cannot exceed the outstanding balance of ₹${invoice.remainingBalance}.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await studentPortalService.processDemoPayment({
        invoiceId: invoice.id,
        invoiceReference: invoice.invoiceReference,
        amount: payableAmount,
        paymentMethod,
        notes: `Demo online fee payment via Student Portal (${paymentMethod})`,
      });

      setSuccessResult(response);
      onPaymentSuccess(response);
    } catch (err: any) {
      setError(err?.message || 'Payment simulation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSuccessResult(null);
    setError(null);
    setCustomAmount(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successResult ? 'Payment Confirmation Receipt' : 'Complete Online Demo Payment'}
      description={
        successResult
          ? 'Transaction recorded & invoice balance updated successfully.'
          : 'Simulated sandbox fee checkout for student resident accommodation.'
      }
      size="lg"
    >
      {successResult ? (
        /* Success Screen */
        <div className="space-y-5 text-center py-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              ₹{successResult.amount.toLocaleString('en-IN')} Paid Successfully!
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {successResult.message}
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left dark:border-slate-800 dark:bg-slate-800/40 text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400">Payment Reference:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                <span>{successResult.paymentReference}</span>
                <button
                  type="button"
                  onClick={() => handleCopyRef(successResult.paymentReference)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Transaction ID:</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {successResult.transactionRef}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Invoice Reference:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {successResult.invoice.invoiceReference}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Updated Invoice Status:</span>
              <span className={`font-bold ${
                successResult.invoice.status === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {successResult.invoice.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400">Remaining Balance:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                ₹{successResult.invoice.remainingBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleClose}>
              Done & Return to Fees
            </Button>
          </div>
        </div>
      ) : (
        /* Payment Checkout Form */
        <div className="space-y-5">
          {/* ⚠️ DEMO TRANSACTION NOTICE BANNER */}
          <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold uppercase tracking-wider text-[11px] block">
                Sandbox Demo Transaction Mode
              </span>
              This portal operates in demo mode. No real bank accounts, debit/credit cards, or UPI IDs are charged. No sensitive payment data is collected.
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Student & Invoice Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Student Identification */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                Payer Resident Details
              </span>
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" /> {profile.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-mono">ID: {profile.studentCode}</span>
              </p>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> {profile.phone}
              </p>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> {profile.email}
              </p>
            </div>

            {/* Invoice Due Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30 space-y-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                Invoice Details
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {invoice.invoiceReference}
                </span>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {invoice.feeCategory}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Period: {invoice.billingPeriod}
              </p>
              <div className="pt-1 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>Total Due:</span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  ₹{invoice.remainingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Demo Payment Rail
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['UPI', 'Card', 'NetBanking'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Demo {method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Confirmation / Partial Payment input */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Amount to Pay (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min={1}
                max={invoice.remainingBalance}
                value={payableAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-8 pr-4 text-xs font-bold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Full outstanding amount: ₹{invoice.remainingBalance.toLocaleString('en-IN')}. You may also make a partial payment.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePay}
              disabled={isSubmitting || payableAmount <= 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Processing Demo Payment…
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Authorize Demo Pay ₹{payableAmount.toLocaleString('en-IN')}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
