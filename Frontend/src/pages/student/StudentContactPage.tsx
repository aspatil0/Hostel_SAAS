import { useEffect, useState } from 'react';
import {
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Utensils,
  ShieldAlert,
  UserCheck,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { studentPortalService } from '@/services/studentPortalService';
import type { StudentHostelInfo } from '@/types/student';

export function StudentContactPage() {
  const [contact, setContact] = useState<StudentHostelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadContact() {
      setIsLoading(true);
      try {
        const data = await studentPortalService.getHostelContact();
        if (isMounted) setContact(data);
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Could not load hostel contacts.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadContact();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-600 mb-2" />
        {error || 'Unable to retrieve hostel contact information.'}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Hostel Administration & Contacts
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Official contact helplines, warden desk numbers, emergency response, and mess dining timings.
        </p>
      </div>

      {/* 2. Emergency Response Banner */}
      {contact.emergencyPhone && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border-2 border-rose-500/40 bg-rose-50/70 p-6 shadow-md shadow-rose-500/5 dark:border-rose-900/50 dark:bg-rose-950/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                24/7 Campus Emergency Line
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Medical & Security SOS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available round the clock for urgent resident medical or security assistance.
              </p>
            </div>
          </div>

          <a
            href={`tel:${contact.emergencyPhone}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call SOS: {contact.emergencyPhone}</span>
          </a>
        </div>
      )}

      {/* 3. Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hostel Location & Property Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824] space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {contact.name}
              </h3>
              <p className="text-[11px] text-slate-400">{contact.tagline || 'Residential PG Accommodation'}</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span>
                {contact.address}, {contact.city}
                {contact.state && `, ${contact.state}`}
                {contact.pincode && ` - ${contact.pincode}`}
              </span>
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleCopy(`${contact.address}, ${contact.city}`, 'address')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                {copiedKey === 'address' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'address' ? 'Address Copied' : 'Copy Full Address'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Administration & Warden Helplines */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824] space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Warden & Office Desk
              </h3>
              <p className="text-[11px] text-slate-400">{contact.wardenName || 'Chief Resident Warden'}</p>
            </div>
          </div>

          <div className="text-xs space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-slate-400" /> Warden Direct:
              </span>
              <a
                href={`tel:${contact.wardenPhone || contact.contactPhone}`}
                className="font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                {contact.wardenPhone || contact.contactPhone}
              </a>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Office Email:
              </span>
              <a
                href={`mailto:${contact.contactEmail}`}
                className="font-semibold text-slate-700 hover:underline dark:text-slate-300 truncate max-w-[150px]"
              >
                {contact.contactEmail}
              </a>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Office Hours:
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {contact.officeHours || '09:00 AM – 08:00 PM'}
              </span>
            </div>
          </div>
        </div>

        {/* Timings: Curfew & Mess Schedule */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824] space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Curfew & Mess Dining
              </h3>
              <p className="text-[11px] text-slate-400">Standard resident timings</p>
            </div>
          </div>

          <div className="text-xs space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Main Gate Curfew:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {contact.curfewTime || '10:30 PM'}
              </span>
            </div>

            {contact.messTimings && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Breakfast:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {contact.messTimings.breakfast}
                  </span>
                </div>
                {contact.messTimings.lunch && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lunch:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {contact.messTimings.lunch}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Dinner:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {contact.messTimings.dinner}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default StudentContactPage;

