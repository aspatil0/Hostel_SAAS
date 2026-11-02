import { useEffect, useState, type FormEvent } from 'react';
import {
  MessageSquareWarning,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Paperclip,
  Wrench,
  Wifi,
  Droplets,
  Zap,
  Sparkles,
  Utensils,
  Home,
  Tag,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormField, Input, Textarea, Select } from '@/components/ui/FormControls';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { studentPortalService } from '@/services/studentPortalService';
import type { Complaint, ComplaintCategory, ComplaintPriority, CreateComplaintDto } from '@/types/student';

const CATEGORIES: { label: string; value: ComplaintCategory; icon: any }[] = [
  { label: 'Room & Furniture', value: 'Room', icon: Home },
  { label: 'Plumbing & Water', value: 'Plumbing', icon: Droplets },
  { label: 'Electricity & Lighting', value: 'Electricity', icon: Zap },
  { label: 'Housekeeping & Cleaning', value: 'Cleaning', icon: Sparkles },
  { label: 'Mess & Food Quality', value: 'Mess', icon: Utensils },
  { label: 'Wi-Fi & Internet', value: 'Wi-Fi', icon: Wifi },
  { label: 'Maintenance & Repairs', value: 'Maintenance', icon: Wrench },
  { label: 'Other General Inquiry', value: 'Other', icon: Tag },
];

export function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Complaint Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState<CreateComplaintDto>({
    category: 'Room',
    title: '',
    description: '',
    priority: 'MEDIUM',
    attachmentUrl: '',
  });

  const loadComplaints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentPortalService.getComplaints();
      setComplaints(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load complaints list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      category: 'Room',
      title: '',
      description: '',
      priority: 'MEDIUM',
      attachmentUrl: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.title.trim()) {
      setFormError('Please enter a brief complaint title.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please provide detailed information describing the issue.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await studentPortalService.createComplaint(formData);
      setComplaints([created, ...complaints]);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: ComplaintCategory) => {
    const item = CATEGORIES.find((c) => c.value === category);
    const Icon = item ? item.icon : Wrench;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Complaints & Maintenance Tickets
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Submit service requests for room repairs, internet, plumbing, or mess facilities directly to hostel staff.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenModal} className="shadow-md shadow-blue-600/20">
          <Plus className="h-4 w-4 mr-1.5" />
          Lodge New Complaint
        </Button>
      </div>

      {/* 2. Notice Guidelines Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
        <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Maintenance SLA:</span> Urgent electrical and plumbing tickets are attended to within 4 hours. General maintenance requests are resolved within 24–48 hours by the dedicated property management team.
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* 3. Complaints Directory */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#121824]">
          <MessageSquareWarning className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            No complaints filed
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            You do not have any open or past service complaints on record.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((item) => {
            const isOpen = item.status === 'OPEN';
            const isInProgress = item.status === 'IN_PROGRESS';
            const isResolved = item.status === 'RESOLVED';

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-[#121824]"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {item.complaintReference}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {getCategoryIcon(item.category)}
                      <span>{item.category}</span>
                    </span>
                    <StatusBadge status={item.status.toLowerCase()} />
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      item.priority === 'URGENT' || item.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {item.priority} Priority
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Logged: {item.submissionDate}
                  </span>
                </div>

                {/* Body */}
                <div className="mt-3.5 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Assigned Staff & Resolution Notes */}
                {(item.assignedStaff || item.resolutionNotes) && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
                    {item.assignedStaff && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Assigned Technician / Warden:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.assignedStaff}
                        </span>
                      </div>
                    )}
                    {item.resolutionNotes && (
                      <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Resolution Update: </span>
                        <span className="text-slate-600 dark:text-slate-300">{item.resolutionNotes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Lodge Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lodge Maintenance or Service Ticket"
        description="Report issues regarding your room, mess food, plumbing, electricity, or amenities."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
              {formError}
            </div>
          )}

          {/* Category Picker */}
          <FormField label="Service Category" required>
            <Select
              options={CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label }))}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ComplaintCategory })}
              required
            />
          </FormField>

          {/* Title */}
          <FormField label="Short Complaint Summary" required>
            <Input
              type="text"
              placeholder="e.g. Geyser switch not heating water in attached bath"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </FormField>

          {/* Description */}
          <FormField label="Detailed Description" required>
            <Textarea
              rows={4}
              placeholder="Describe the issue, location in your room, and when the issue started happening…"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </FormField>

          {/* Priority */}
          <FormField label="Urgency / Priority Level">
            <Select
              options={[
                { value: 'LOW', label: 'Low (Minor cosmetic issue)' },
                { value: 'MEDIUM', label: 'Medium (Normal repair within 24 hours)' },
                { value: 'HIGH', label: 'High (Affects daily study or comfort)' },
                { value: 'URGENT', label: 'Urgent (Water leak, power cut, security hazard)' },
              ]}
              value={formData.priority || 'MEDIUM'}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as ComplaintPriority })}
            />
          </FormField>

          {/* Attachment url/note */}
          <FormField label="Photo / Document Attachment URL (Optional)">
            <Input
              type="url"
              placeholder="https://... (Optional link to photo of damaged item)"
              value={formData.attachmentUrl || ''}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
            />
          </FormField>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Logging Ticket…
                </>
              ) : (
                'Submit Service Ticket'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default StudentComplaintsPage;
