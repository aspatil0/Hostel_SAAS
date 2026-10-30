import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  BedDouble,
  CreditCard,
  CalendarClock,
  MessageSquareWarning,
  PhoneCall,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ShieldCheck,
  Loader2,
  Calendar,
  Wallet,
} from 'lucide-react';
import { studentPortalService } from '@/services/studentPortalService';
import type { StudentDashboardSummary } from '@/types/student';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      try {
        const summary = await studentPortalService.getDashboard();
        if (isMounted) setData(summary);
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Failed to load student dashboard');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading your resident dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-600 mb-2" />
        <h3 className="text-base font-bold">Unable to load dashboard</h3>
        <p className="mt-1 text-xs">{error || 'Something went wrong fetching resident details.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { student, accommodation, financialOverview, recentInvoices, recentPayments, activeLeaves, recentComplaints, hostelContact } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome & Resident Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 p-6 md:p-8 text-white shadow-xl shadow-blue-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Resident Allotment Active
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {student.name}!
            </h1>
            <p className="mt-1 text-xs md:text-sm text-blue-100 max-w-xl">
              Student ID: <span className="font-mono font-bold text-white">{student.studentCode}</span> • Enrolled at {accommodation.hostelName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/fees"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-md transition-all hover:bg-blue-50 active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              <span>View & Pay Fees</span>
            </Link>
            <Link
              to="/student/leaves"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
            >
              <CalendarClock className="h-4 w-4" />
              <span>Apply Leave</span>
            </Link>
          </div>
        </div>

        {/* Ambient background orbs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 right-48 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      {/* 2. Key Resident Snapshot Cards (Room Allotment + Financial Dues) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Room / Bed Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Allocated Room
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <BedDouble className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Room {accommodation.roomNumber}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {accommodation.bedNumber} • Floor {accommodation.floor} ({accommodation.building})
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Room Type</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{accommodation.roomType}</span>
          </div>
        </div>

        {/* Outstanding Dues Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Dues
            </span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              financialOverview.outstandingBalance > 0
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
            }`}>
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`text-2xl font-bold ${
              financialOverview.outstandingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              ₹{financialOverview.outstandingBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Next Due: {financialOverview.nextDueDate}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total Paid (Semester)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ₹{financialOverview.totalPaidThisSemester.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Active Leave Passes Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Leave Passes
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeLeaves.length} Active
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeLeaves[0] ? `Next: ${activeLeaves[0].startDate}` : 'No upcoming leaves applied'}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Curfew Time</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{accommodation.curfewTime}</span>
          </div>
        </div>

        {/* Complaints / Service Requests Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Service Requests
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <MessageSquareWarning className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {recentComplaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length} Open
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {recentComplaints[0] ? recentComplaints[0].title.slice(0, 28) + '…' : 'All maintenance issues cleared'}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Warden Helpdesk</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Available</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Invoices & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Invoices & Payment Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Invoices Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Fee Invoices & Billing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track your monthly accommodation & mess dues
                </p>
              </div>
              <Link
                to="/student/fees"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <span>View All Invoices</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentInvoices.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No invoices generated yet.</p>
              ) : (
                recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-800/30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {inv.invoiceReference}
                        </span>
                        <StatusBadge status={inv.status.toLowerCase()} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {inv.feeCategory} Fee • {inv.billingPeriod} • Due {inv.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total: ₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                        <p className={`text-sm font-bold ${
                          inv.remainingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {inv.remainingBalance > 0
                            ? `Due: ₹${inv.remainingBalance.toLocaleString('en-IN')}`
                            : 'Fully Paid'}
                        </p>
                      </div>

                      {inv.allowPayment && inv.remainingBalance > 0 ? (
                        <Link
                          to="/student/fees"
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                        >
                          Pay
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Settled
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Payments Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Payment Receipts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Confirmed transactions for this academic year
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {recentPayments.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">No payment receipts on file.</p>
              ) : (
                recentPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold">
                        ₹
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {p.paymentReference}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {p.paymentDate} • via {p.paymentMode} ({p.transactionRef})
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      +₹{p.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Active Leaves & Hostel Info Card */}
        <div className="space-y-6">
          {/* Active Leave Passes */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Leave Applications
              </h3>
              <Link
                to="/student/leaves"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Apply
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {activeLeaves.length === 0 ? (
                <div className="py-6 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-500">No active leave applications.</p>
                </div>
              ) : (
                activeLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {leave.numberOfDays} Days ({leave.startDate} to {leave.endDate})
                      </span>
                      <StatusBadge status={leave.status.toLowerCase()} />
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {leave.reason}
                    </p>
                    {leave.destination && (
                      <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" /> {leave.destination}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Hostel Helpline & Contact */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <PhoneCall className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hostel Administration
              </h3>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {hostelContact.name}
                </p>
                <p className="text-slate-400 mt-0.5">{hostelContact.address}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Chief Warden:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{hostelContact.wardenName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <a href={`tel:${hostelContact.emergencyPhone}`} className="font-bold text-rose-600 hover:underline">
                    {hostelContact.emergencyPhone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Office Desk:</span>
                  <a href={`tel:${hostelContact.contactPhone}`} className="font-semibold text-blue-600 hover:underline">
                    {hostelContact.contactPhone}
                  </a>
                </div>
              </div>

              <Link
                to="/student/contact"
                className="mt-2 block w-full rounded-xl bg-slate-100 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Full Contact & Mess Timings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default StudentDashboardPage;

