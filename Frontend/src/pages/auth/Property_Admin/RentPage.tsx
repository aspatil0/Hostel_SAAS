import { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Send,
  Download,
  X,
  CreditCard,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { initialRentRecords, initialStudents } from '@/data/mockData';
import { propertyPortalService } from '@/services/propertyPortalService';
import type { RentRecord } from '@/types/property';

export function RentPage() {
  const [records, setRecords] = useState<RentRecord[]>(initialRentRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<RentRecord | null>(null);
  const [receiptSuccess, setReceiptSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadRent() {
      try {
        const list = await propertyPortalService.getRentRecords();
        if (isMounted && list && list.length > 0) {
          setRecords(list);
        }
      } catch (err) {
        console.warn('Failed to load rent records:', err);
      }
    }
    loadRent();
    return () => {
      isMounted = false;
    };
  }, []);

  // Form state
  const [paymentForm, setPaymentForm] = useState({
    studentId: initialStudents[0]?.id || '',
    amount: initialStudents[0]?.monthlyRent || 12500,
    paymentMode: 'UPI' as 'UPI' | 'Cash' | 'NetBanking',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  // KPI calculations
  const totalBilled = records.reduce((sum, r) => sum + r.amount, 0);
  const totalCollected = records.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalPending = totalBilled - totalCollected;
  const overdueCount = records.filter((r) => r.status === 'overdue').length;

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = initialStudents.find((s) => s.id === paymentForm.studentId);
    if (!student) return;

    try {
      await propertyPortalService.recordPayment({
        studentId: student.id,
        amount: Number(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        transactionRef: paymentForm.transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
        paymentDate: paymentForm.paymentDate,
        month: selectedMonth,
      });
    } catch {
      // offline fallback
    }

    // Check if record already exists for student
    const existingIndex = records.findIndex((r) => r.studentId === student.id);

    if (existingIndex >= 0) {
      const updated = [...records];
      updated[existingIndex] = {
        ...updated[existingIndex],
        paidAmount: updated[existingIndex].amount,
        status: 'paid',
        paymentMode: paymentForm.paymentMode,
        paidDate: paymentForm.paymentDate,
      };
      setRecords(updated);
    } else {
      const newRec: RentRecord = {
        id: `RNT-${Date.now().toString().slice(-4)}`,
        studentId: student.id,
        studentName: student.name,
        roomNumber: student.roomNumber,
        month: selectedMonth,
        amount: Number(paymentForm.amount),
        paidAmount: Number(paymentForm.amount),
        dueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-05`,
        paidDate: paymentForm.paymentDate,
        status: 'paid',
        paymentMode: paymentForm.paymentMode,
      };
      setRecords([newRec, ...records]);
    }

    setIsRecordModalOpen(false);
    setReceiptSuccess(`Payment of ₹${paymentForm.amount.toLocaleString('en-IN')} recorded successfully for ${student.name}.`);
    setTimeout(() => setReceiptSuccess(null), 4000);
  };

  const handleSendReminder = (studentName: string) => {
    alert(`WhatsApp & SMS payment reminder sent to ${studentName} and their guardian.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B45] dark:text-white">
            Rent Collection & Dues Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track monthly room rent invoices, collection status, overdue dues, and official receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option>October 2026</option>
            <option>September 2026</option>
            <option>August 2026</option>
          </select>

          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Success banner */}
      {receiptSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{receiptSuccess}</span>
        </div>
      )}

      {/* 2. Ledger KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Invoiced
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-[#172B45] dark:text-white">
              ₹{totalBilled.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">{records.length} Invoices</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
            Rent Collected
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-600">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-medium text-emerald-600">
              {Math.round((totalCollected / totalBilled) * 100 || 0)}%
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
            Pending Collection
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-600">
              ₹{totalPending.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-amber-600 font-medium">Unsettled</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
            Overdue Records
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-rose-600">
              {overdueCount} Residents
            </span>
            <span className="text-xs text-rose-600">Past Due Date</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or room..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-[#172B45] focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#142D4E] text-white dark:bg-emerald-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#121824]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="py-3 px-4">Invoice / Resident</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status & Mode</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No rent ledger records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/80 transition dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#172B45] dark:text-white">
                        {record.studentName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {record.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      Room {record.roomNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {record.month}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      ₹{record.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{record.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {record.dueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            record.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : record.status === 'overdue'
                              ? 'bg-rose-500/10 text-rose-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {record.status.toUpperCase()}
                        </span>
                        {record.paymentMode && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {record.paymentMode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {record.status !== 'paid' ? (
                        <button
                          type="button"
                          onClick={() => handleSendReminder(record.studentName)}
                          title="Send WhatsApp payment reminder"
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer"
                        >
                          <Send className="h-3 w-3" /> Remind
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(record)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <Receipt className="h-3 w-3 text-emerald-600" /> Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121824]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B45] dark:text-white">
                    Record Rent Payment
                  </h3>
                  <p className="text-xs text-slate-400">
                    Log resident rent receipt and update the ledger.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Resident Student *
                </label>
                <select
                  value={paymentForm.studentId}
                  onChange={(e) => {
                    const st = initialStudents.find((s) => s.id === e.target.value);
                    setPaymentForm({
                      ...paymentForm,
                      studentId: e.target.value,
                      amount: st?.monthlyRent || 12500,
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {initialStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - Room {s.roomNumber} (₹{s.monthlyRent})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Payment Mode
                  </label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash at Reception</option>
                    <option value="NetBanking">NetBanking / IMPS</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Date Paid
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Invoice / Receipt View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121824]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Official Rent Receipt
              </span>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 space-y-3 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Receipt No:</span>
                <span className="font-mono text-xs font-bold">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Resident:</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedInvoice.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Room:</span>
                <span>Room {selectedInvoice.roomNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Billing Period:</span>
                <span>{selectedInvoice.month}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Payment Mode:</span>
                <span className="font-semibold text-emerald-600">{selectedInvoice.paymentMode || 'UPI'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white">Amount Paid:</span>
                <span className="text-lg font-bold text-emerald-600">₹{selectedInvoice.paidAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  alert('Receipt PDF downloaded successfully.');
                  setSelectedInvoice(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
