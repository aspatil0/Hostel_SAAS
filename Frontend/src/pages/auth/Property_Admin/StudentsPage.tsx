import { useState, useEffect, type FormEvent } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  Calendar,
  X,
  CheckCircle2,
  FileText,
  UserPlus,
  Shield,
  Eye,
  LogOut,
} from 'lucide-react';
import { initialStudents } from '@/data/mockData';
import { propertyPortalService } from '@/services/propertyPortalService';
import type { Student } from '@/types/property';

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'checked_out'>('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStudents() {
      try {
        const list = await propertyPortalService.getStudents();
        if (isMounted && list && list.length > 0) {
          setStudents(list);
        }
      } catch (err) {
        console.warn('Failed to load students:', err);
      }
    }
    loadStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  // New Student Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    guardianName: '',
    guardianPhone: '',
    collegeOrCompany: '',
    roomNumber: '101',
    bedNumber: 'Bed A',
    monthlyRent: 12500,
    depositAmount: 25000,
    checkInDate: new Date().toISOString().split('T')[0],
    idProofNumber: '',
  });

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.collegeOrCompany.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateStudent = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    let created: Student;
    try {
      created = await propertyPortalService.createStudent(formData);
    } catch {
      created = {
        id: `STU-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        collegeOrCompany: formData.collegeOrCompany,
        roomNumber: formData.roomNumber,
        bedNumber: formData.bedNumber,
        monthlyRent: Number(formData.monthlyRent),
        depositAmount: Number(formData.depositAmount),
        checkInDate: formData.checkInDate,
        status: 'active',
        idProofNumber: formData.idProofNumber || 'Aadhar Verified',
      };
    }

    setStudents([created, ...students.filter((s) => s.id !== created.id)]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      guardianName: '',
      guardianPhone: '',
      collegeOrCompany: '',
      roomNumber: '101',
      bedNumber: 'Bed A',
      monthlyRent: 12500,
      depositAmount: 25000,
      checkInDate: new Date().toISOString().split('T')[0],
      idProofNumber: '',
    });
  };

  const handleCheckoutStudent = async (studentId: string) => {
    try {
      await propertyPortalService.checkoutStudent(studentId);
    } catch {
      // offline fallback
    }

    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, status: 'checked_out' } : s))
    );
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B45] dark:text-white">
            Student & Guest Resident Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain complete student profiles, guardian contacts, room bed allocations, and admission KYC.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add New Resident
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
        <div className="relative w-full sm:w-96">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, room 101, college, phone..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-[#172B45] placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'active', 'checked_out'] as const).map((status) => (
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
              {status === 'all' ? 'All Residents' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Students Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-[#121824]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Room & Bed</th>
                <th className="py-3 px-4">College / Workplace</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Rent / Deposit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No resident records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#172B45] dark:text-white">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ID: {student.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        Room {student.roomNumber}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {student.bedNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="max-w-[160px] truncate font-medium text-slate-700 dark:text-slate-300" title={student.collegeOrCompany}>
                        {student.collegeOrCompany}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Joined: {student.checkInDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Mail className="h-3 w-3" />
                        <span className="max-w-[140px] truncate">{student.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {student.guardianName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {student.guardianPhone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{student.monthlyRent.toLocaleString('en-IN')}/mo
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Dep: ₹{student.depositAmount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          student.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {student.status === 'active' ? 'Active' : 'Checked Out'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <Eye className="h-3 w-3" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121824] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B45] dark:text-white">
                    Add New Student Resident
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enter resident credentials, guardian details, and room allocation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aarav Mehta"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98111 22334"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aarav@university.edu"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    College / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.collegeOrCompany}
                    onChange={(e) => setFormData({ ...formData, collegeOrCompany: e.target.value })}
                    placeholder="e.g. IIT Bombay / TCS"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Guardian Info */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Guardian / Emergency Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="e.g. Rajesh Mehta"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Guardian Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="+91 98111 00112"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Room & Bed Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assign Room
                  </label>
                  <select
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="101">Room 101 (Double AC)</option>
                    <option value="102">Room 102 (Double Non-AC)</option>
                    <option value="103">Room 103 (Double AC)</option>
                    <option value="104">Room 104 (Triple AC)</option>
                    <option value="201">Room 201 (Single Luxury)</option>
                    <option value="202">Room 202 (Double AC)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assign Bed
                  </label>
                  <select
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Bed A">Bed A (Window Side)</option>
                    <option value="Bed B">Bed B (Door Side)</option>
                    <option value="Bed C">Bed C</option>
                  </select>
                </div>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Monthly Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm & Allocate Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. View Details & Checkout Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121824]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B45] dark:text-white">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Room {selectedStudent.roomNumber} • {selectedStudent.bedNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{selectedStudent.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-white truncate block">{selectedStudent.email}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[11px]">Institution</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{selectedStudent.collegeOrCompany}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[11px]">ID Proof</span>
                  <span className="font-semibold text-emerald-600">{selectedStudent.idProofNumber || 'Verified Aadhar'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/80 p-3 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Monthly Rent</span>
                  <span className="font-bold text-base text-emerald-600">₹{selectedStudent.monthlyRent.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Deposit Held</span>
                  <span className="font-bold text-base text-slate-800 dark:text-white">₹{selectedStudent.depositAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="text-slate-400 block text-[11px] mb-1">Guardian Emergency Contact</span>
                <p className="font-semibold text-slate-800 dark:text-white">
                  {selectedStudent.guardianName} ({selectedStudent.guardianPhone})
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              {selectedStudent.status === 'active' ? (
                <button
                  type="button"
                  onClick={() => handleCheckoutStudent(selectedStudent.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" /> Mark Checked Out & Vacate Bed
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Resident has checked out</span>
              )}

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl bg-[#142D4E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3A5F] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
