import { useEffect, useState, type FormEvent } from 'react';
import {
  CalendarClock,
  Plus,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormField, Input, Textarea } from '@/components/ui/FormControls';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { studentPortalService } from '@/services/studentPortalService';
import type { LeaveApplication, ApplyLeaveDto } from '@/types/student';

export function StudentLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply Leave Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<ApplyLeaveDto>({
    startDate: '',
    endDate: '',
    reason: '',
    destination: '',
    contactDetails: '',
    emergencyContact: '',
  });

  // Calculated Days
  const [calculatedDays, setCalculatedDays] = useState<number>(0);

  // Load existing leaves
  const loadLeaves = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentPortalService.getLeaves();
      setLeaves(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load leave records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // Recalculate number of leave days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(days);
        setFormError(null);
      } else {
        setCalculatedDays(0);
        setFormError('End date cannot precede the start date.');
      }
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleOpenModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    setFormData({
      startDate: tomorrowStr,
      endDate: threeDaysStr,
      reason: '',
      destination: '',
      contactDetails: '',
      emergencyContact: '',
    });
    setFormError(null);
    setIsApplyModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.startDate || !formData.endDate) {
      setFormError('Please select both start and return dates.');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      setFormError('End date cannot precede start date.');
      return;
    }

    if (!formData.reason.trim()) {
      setFormError('Please specify the reason for your leave request.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const newLeave = await studentPortalService.applyLeave(formData);
      setLeaves([newLeave, ...leaves]);
      setIsApplyModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit leave application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelLeave = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave application?')) {
      return;
    }

    try {
      const updated = await studentPortalService.cancelLeave(id);
      setLeaves((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch (err: any) {
      alert(err?.message || 'Could not cancel leave application.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Leave & Out-Pass Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Apply for digital hostel leave passes, track warden approval status, and manage out-station history.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenModal} className="shadow-md shadow-blue-600/20">
          <Plus className="h-4 w-4 mr-1.5" />
          Apply for Leave
        </Button>
      </div>

      {/* 2. Notice Guidelines Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
        <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Hostel Resident Leave Guidelines:</span> Overnight and weekend leave requests must be submitted at least 24 hours in advance. Warden approval is communicated digitally and verified at the biometric turnstile gate.
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* 3. Leave Applications Directory */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : leaves.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#121824]">
          <CalendarClock className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            No leave applications recorded
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            You haven't submitted any leave requests yet. Click "Apply for Leave" above to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => {
            const isPending = leave.status === 'PENDING';
            const isApproved = leave.status === 'APPROVED';
            const isRejected = leave.status === 'REJECTED';
            const isCancelled = leave.status === 'CANCELLED';

            return (
              <div
                key={leave.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#121824]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {leave.leaveReference}
                    </span>
                    <StatusBadge status={leave.status.toLowerCase()} />
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {leave.numberOfDays} {leave.numberOfDays === 1 ? 'Day' : 'Days'} Duration
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Applied on: {leave.appliedDate}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Dates & Destination */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider block">
                      Departure & Return
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      {leave.startDate} → {leave.endDate}
                    </p>
                    {leave.destination && (
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {leave.destination}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="space-y-1.5 md:col-span-2">
                    <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider block">
                      Purpose of Leave
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {leave.reason}
                    </p>
                  </div>
                </div>

                {/* Rejection / Decision Banner */}
                {isRejected && leave.rejectionReason && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                    <XCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Rejection Note: </span>
                      {leave.rejectionReason}
                    </div>
                  </div>
                )}

                {isApproved && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approved by {leave.approvedBy || 'Hostel Warden'}. Out-pass valid at turnstile.</span>
                  </div>
                )}

                {/* Cancellation trigger for pending applications */}
                {isPending && leave.canCancel && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCancelLeave(leave.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Cancel Application
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Apply For Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Hostel Out-Pass / Leave"
        description="Submit dates and details for hostel administration & warden review."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
              {formError}
            </div>
          )}

          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Start Date (Departure)" required>
              <Input
                type="date"
                min={todayStr}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </FormField>

            <FormField label="End Date (Return)" required>
              <Input
                type="date"
                min={formData.startDate || todayStr}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </FormField>
          </div>

          {/* Calculated Duration Chip */}
          {calculatedDays > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <CalendarClock className="h-4 w-4" />
              <span>Calculated Total Duration: {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}</span>
            </div>
          )}

          {/* Destination */}
          <FormField label="Destination (City / Address)">
            <Input
              type="text"
              placeholder="e.g. Home, Pune / College Hackathon, Bangalore"
              value={formData.destination || ''}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </FormField>

          {/* Reason */}
          <FormField label="Reason for Leave" required>
            <Textarea
              rows={3}
              placeholder="Please provide the purpose or reason for requesting leave…"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </FormField>

          {/* Emergency / Contact Phone while on Leave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Your Contact Phone on Leave">
              <Input
                type="tel"
                placeholder="+91 98XXX XXXXX"
                value={formData.contactDetails || ''}
                onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
              />
            </FormField>

            <FormField label="Parent / Guardian Contact">
              <Input
                type="tel"
                placeholder="+91 98XXX XXXXX"
                value={formData.emergencyContact || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </FormField>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsApplyModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting || calculatedDays <= 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Submitting Application…
                </>
              ) : (
                'Submit Leave Request'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default StudentLeavesPage;
