import { useState, useEffect } from 'react';
import {
  BedDouble,
  Users,
  Receipt,
  AlertCircle,
  ArrowUpRight,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Phone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { initialStudents, initialRentRecords } from '@/data/mockData';
import { propertyPortalService, type DashboardData } from '@/services/propertyPortalService';
import type { Student } from '@/types/property';

export function PropertyDashboardPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [rentRecords, setRentRecords] = useState(initialRentRecords);
  const [metrics, setMetrics] = useState({
    totalBeds: 120,
    occupiedBeds: 2,
    vacantBeds: 118,
    occupancyPercentage: 2,
    totalMonthlyBilled: 26500,
    collectedRent: 12500,
    pendingRent: 14000,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        const data = await propertyPortalService.getDashboard();
        if (isMounted && data) {
          if (data.recentStudents && data.recentStudents.length > 0) {
            setStudents(data.recentStudents);
          }
          if (data.recentRentRecords && data.recentRentRecords.length > 0) {
            setRentRecords(data.recentRentRecords as any);
          }
          if (data.occupancy && data.financials) {
            setMetrics({
              totalBeds: data.occupancy.totalBeds,
              occupiedBeds: data.occupancy.occupiedBeds,
              vacantBeds: data.occupancy.vacantBeds,
              occupancyPercentage: data.occupancy.occupancyPercentage,
              totalMonthlyBilled: data.financials.totalMonthlyBilled,
              collectedRent: data.financials.collectedRent,
              pendingRent: data.financials.pendingRent,
            });
          }
        }
      } catch (err) {
        console.warn('Dashboard live load error:', err);
      }
    }
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  // Operational metrics
  const { totalBeds, occupiedBeds, vacantBeds, occupancyPercentage, totalMonthlyBilled, collectedRent, pendingRent } = metrics;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B45] dark:text-white">
            Daily Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time occupancy status, monthly rent billing ledger, and resident check-in tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/property-admin/students"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Resident
          </Link>
          <Link
            to="/property-admin/rent"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Receipt className="h-4 w-4 text-emerald-600" />
            Record Payment
          </Link>
        </div>
      </div>

      {/* 2. Top Operational KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bed Occupancy Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bed Occupancy
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BedDouble className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#172B45] dark:text-white">
              {occupancyPercentage}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {occupiedBeds}/{totalBeds} Beds Taken
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{vacantBeds} Vacant beds ready</span>
            <Link to="/property-admin/occupancy" className="text-emerald-600 hover:underline">
              View Matrix &rarr;
            </Link>
          </div>
        </div>

        {/* Active Residents */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Residents
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#172B45] dark:text-white">
              {occupiedBeds}
            </span>
            <span className="text-xs text-blue-600 font-medium">
              Verified Residents
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Across 45 furnished double & triple sharing rooms.
          </p>
          <div className="mt-2 text-right">
            <Link to="/property-admin/students" className="text-[11px] text-blue-600 hover:underline">
              Resident Directory &rarr;
            </Link>
          </div>
        </div>

        {/* Month Rent Collected */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rent Collected (Oct)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#172B45] dark:text-white">
              ₹{(collectedRent / 100000).toFixed(2)}L
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> 92%
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Target: ₹{(totalMonthlyBilled / 100000).toFixed(2)} Lakhs
          </p>
          <div className="mt-2 text-right">
            <Link to="/property-admin/rent" className="text-[11px] text-indigo-600 hover:underline">
              Collection Ledger &rarr;
            </Link>
          </div>
        </div>

        {/* Dues & Pending Payments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending / Overdue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              ₹{(pendingRent / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-amber-600 font-medium">
              3 Invoices Unsettled
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Auto WhatsApp reminders queued for overdue residents.
          </p>
          <div className="mt-2 text-right">
            <Link to="/property-admin/rent" className="text-[11px] text-amber-600 hover:underline">
              Send Reminders &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Room Matrix Snapshot & Recent Check-ins */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Occupancy Grid Snapshot */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172B45] dark:text-white">
                Live Wing & Floor Occupancy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual preview of Room 101 to 106 (Floor 1 East Wing)
              </p>
            </div>
            <Link
              to="/property-admin/occupancy"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
            >
              Full Floor Matrix <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { room: '101', type: 'Double AC', bedA: 'Aarav Mehta', bedB: 'Rohan Deshmukh', full: true },
              { room: '102', type: 'Double Non-AC', bedA: 'Vikram Singhania', bedB: 'Vacant', full: false },
              { room: '103', type: 'Double AC', bedA: 'Siddharth Rao', bedB: 'Aditya Kale', full: true },
              { room: '104', type: 'Triple AC', bedA: 'Tanmay Jain', bedB: 'Vacant', full: false },
              { room: '105', type: 'Double AC', bedA: 'Kunal Joshi', bedB: 'Nikhil Patil', full: true },
              { room: '106', type: 'Double Non-AC', bedA: 'Vacant', bedB: 'Vacant', full: false },
            ].map((r) => (
              <div
                key={r.room}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs transition hover:border-emerald-500 dark:border-slate-700/60 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/60">
                  <span className="font-bold text-[#172B45] dark:text-white">Room {r.room}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    r.full
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {r.full ? 'Full' : '1 Vacancy'}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bed A:</span>
                    <span className={`font-medium ${r.bedA === 'Vacant' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      {r.bedA}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bed B:</span>
                    <span className={`font-medium ${r.bedB === 'Vacant' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      {r.bedB}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations Guide & Info */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#172B45] dark:text-white">
                Hostel Administration Notice
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Biometric check-in synchronizer is active. All new student admission forms automatically record security deposit and room key assignments.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/50">
                <Clock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Hostel Gate Curfew: 10:30 PM
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Automatic SMS alerts sent to guardians for late entry.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/50">
                <Phone className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Warden Emergency Line
                  </p>
                  <p className="text-[11px] text-slate-500">
                    +91 98201 12345 (Rahul Sharma - Manager)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/property-admin/profile"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-100 dark:bg-slate-800 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Configure Hostel Rules & Profile
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Resident Roster */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#172B45] dark:text-white">
              Recently Enrolled Residents
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active hostel residents and verified student allocations
            </p>
          </div>
          <Link
            to="/property-admin/students"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
          >
            Manage All Students <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">College / Company</th>
                <th className="py-2.5 px-3">Room / Bed</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Monthly Rent</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {students.slice(0, 5).map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-[#172B45] dark:text-white">
                    {student.name}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    {student.collegeOrCompany}
                  </td>
                  <td className="py-3 px-3 font-medium">
                    Room {student.roomNumber} ({student.bedNumber})
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {student.phone}
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{student.monthlyRent.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Active Resident
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to="/property-admin/students"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      View <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
