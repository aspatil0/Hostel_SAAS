import { useEffect, useState } from 'react';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Download,
  Calendar,
  Wallet,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Sparkles,
  Printer,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { studentPortalService } from '@/services/studentPortalService';
import type {
  StudentFeeInvoice,
  PaymentReceipt,
  StudentProfile,
  InvoiceStatus,
  DemoPaymentResponse,
} from '@/types/student';
import { DemoPaymentModal } from './components/DemoPaymentModal';
import { InvoiceModal } from './components/InvoiceModal';

type FilterType = 'ALL' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'UPCOMING';

export function StudentFeesPage() {
  const [invoices, setInvoices] = useState<StudentFeeInvoice[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts'>('invoices');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected invoice for Demo Payment
  const [selectedInvoice, setSelectedInvoice] = useState<StudentFeeInvoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Selected invoice for Download / Printable View
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<StudentFeeInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [invData, payData, profData] = await Promise.all([
        studentPortalService.getInvoices(),
        studentPortalService.getPaymentHistory(),
        studentPortalService.getProfile(),
      ]);
      setInvoices(invData);
      setPayments(payData);
      setProfile(profData);
    } catch (err: any) {
      setError(err?.message || 'Could not load fee records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UPCOMING') return (inv.status as string) === 'UPCOMING';
    return inv.status === activeFilter;
  });

  // Calculate totals
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPending = invoices.reduce((sum, i) => sum + i.remainingBalance, 0);

  const handleOpenPay = (invoice: StudentFeeInvoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleViewInvoice = (invoice: StudentFeeInvoice) => {
    setSelectedInvoiceForModal(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDownloadReceipt = (receipt: PaymentReceipt) => {
    // Find matching invoice or construct temporary view
    const matched = invoices.find((i) => i.id === receipt.invoiceId);
    if (matched) {
      setSelectedInvoiceForModal(matched);
      setIsInvoiceModalOpen(true);
    } else if (invoices[0]) {
      setSelectedInvoiceForModal({
        ...invoices[0],
        invoiceReference: receipt.invoiceReference,
        paidAmount: receipt.amount,
        remainingBalance: 0,
        status: 'PAID',
      });
      setIsInvoiceModalOpen(true);
    }
  };

  const handlePaymentSuccess = (response: DemoPaymentResponse) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === response.invoice.id ? response.invoice : inv))
    );
    setPayments((prev) => [response.receipt, ...prev]);
  };

  const filterTabs: { label: string; value: FilterType }[] = [
    { label: 'All Invoices', value: 'ALL' },
    { label: 'Unpaid Dues', value: 'UNPAID' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
    { label: 'Paid in Full', value: 'PAID' },
    { label: 'Overdue', value: 'OVERDUE' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fees & Billing Ledger
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            View room rent invoices, mess fees, security deposits, and authorized payment receipts.
          </p>
        </div>

        {/* Demo banner indicator */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Instant Demo Checkout & PDF Downloads</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Outstanding Dues */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Outstanding Dues
            </span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              totalPending > 0
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
            }`}>
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <h3 className={`mt-2 text-2xl font-bold ${
            totalPending > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            ₹{totalPending.toLocaleString('en-IN')}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {totalPending > 0 ? 'Clear dues before due date to avoid late fine.' : 'All pending invoices fully cleared!'}
          </p>
        </div>

        {/* Total Paid */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Paid to Date
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            ₹{totalPaid.toLocaleString('en-IN')}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Verified across {payments.length} successful transactions
          </p>
        </div>

        {/* Total Academic Invoices Billed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Billed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString('en-IN')}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across room rent, mess charges & deposits
          </p>
        </div>
      </div>

      {/* 2. Tabs: Invoices vs Payment Receipts */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'invoices'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Fee Invoices ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receipts')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'receipts'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Confirmed Receipts ({payments.length})
          </button>
        </div>
      </div>

      {/* 3. Invoices Tab Content */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === tab.value
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#121824]">
              <Receipt className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                No invoices found
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                No invoices match the selected status filter ({activeFilter}).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredInvoices.map((invoice) => {
                const canPay = invoice.allowPayment && invoice.remainingBalance > 0;
                return (
                  <div
                    key={invoice.id}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#121824]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {invoice.invoiceReference}
                        </span>
                        <StatusBadge status={invoice.status.toLowerCase()} />
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {invoice.feeCategory} Fee
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Billing Period: {invoice.billingPeriod}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" /> Due Date: {invoice.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Financial details & Actions */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left lg:text-right">
                        <p className="text-xs text-slate-400">
                          Total: ₹{invoice.totalAmount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          Paid: ₹{invoice.paidAmount.toLocaleString('en-IN')}
                        </p>
                        <p className={`text-base font-extrabold ${
                          invoice.remainingBalance > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {invoice.remainingBalance > 0
                            ? `Due: ₹${invoice.remainingBalance.toLocaleString('en-IN')}`
                            : 'Settled'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleViewInvoice(invoice)}
                          title="View and download invoice PDF"
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Invoice PDF
                        </Button>

                        {canPay ? (
                          <Button
                            variant="primary"
                            onClick={() => handleOpenPay(invoice)}
                            className="shadow-md shadow-blue-600/20"
                          >
                            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                            Pay Now
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" /> Fully Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Receipts Tab Content */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#121824]">
              <Receipt className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                No payment receipts yet
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Completed transactions will display here with printable receipt references.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#121824]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">
                      ₹
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {p.paymentReference}
                        </span>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {p.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Invoice: <span className="font-semibold">{p.invoiceReference}</span> • Paid on {p.paymentDate} via {p.paymentMode}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Transaction Ref: {p.transactionRef}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        Payment Verified
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleDownloadReceipt(p)}
                      title="View and download payment receipt PDF"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Receipt PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Demo Payment Modal Trigger */}
      <DemoPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={selectedInvoice}
        profile={profile}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 6. Invoice / Receipt View & Download Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoiceForModal}
        profile={profile}
      />
    </div>
  );
}
export default StudentFeesPage;
