import { useEffect, useState, type FormEvent } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  BedDouble,
  ShieldCheck,
  Calendar,
  Lock,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormControls';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { studentPortalService } from '@/services/studentPortalService';
import type { StudentProfile } from '@/types/student';

export function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State for allowed fields
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      setIsLoading(true);
      try {
        const data = await studentPortalService.getProfile();
        if (isMounted) {
          setProfile(data);
          setPhone(data.phone || '');
          setEmergencyContact(data.emergencyContact || '');
        }
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Could not load student profile.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setUpdateFeedback('Phone number cannot be empty.');
      return;
    }

    setIsSaving(true);
    setUpdateFeedback(null);

    try {
      const updated = await studentPortalService.updateProfile({
        phone: phone.trim(),
        emergencyContact: emergencyContact.trim(),
      });
      setProfile(updated);
      setIsEditing(false);
      setUpdateFeedback('Contact information successfully updated!');
      setTimeout(() => setUpdateFeedback(null), 3500);
    } catch (err: any) {
      setUpdateFeedback(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      // Simulate password update
      await new Promise((r) => setTimeout(r, 600));
      setPasswordSuccess('Password changed successfully! Please use it on your next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-600 mb-2" />
        {error || 'Unable to retrieve resident profile.'}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Resident Profile
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            View your admission records, room allotment details, and manage verified contact information.
          </p>
        </div>

        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Edit Allowed Fields
          </Button>
        )}
      </div>

      {updateFeedback && (
        <div className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
          updateFeedback.includes('success')
            ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
        }`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{updateFeedback}</span>
        </div>
      )}

      {/* 2. Main Identity Showcase Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-blue-500/25">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <StatusBadge status={profile.status} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Resident ID: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{profile.studentCode}</span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {profile.collegeOrCompany}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs dark:border-blue-900/40 dark:bg-blue-950/20 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
              Admission Check-in
            </span>
            <p className="font-bold text-slate-900 dark:text-white">{profile.checkInDate}</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">{profile.idProofNumber || 'ID Verified'}</p>
          </div>
        </div>

        {/* 3. Room Allotment Specification (Read-only as provisioned by Warden) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Allocated Room & Hostel Information (Read-Only)
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Managed by Property Admin
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="text-slate-400 text-[10px] block">Hostel Name</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                {profile.hostelInfo.name}
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="text-slate-400 text-[10px] block">Room & Bed</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                Room {profile.roomDetails.roomNumber} ({profile.roomDetails.bedNumber})
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="text-slate-400 text-[10px] block">Floor & Wing</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                Floor {profile.roomDetails.floor} ({profile.roomDetails.wing || 'Main'})
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="text-slate-400 text-[10px] block">Monthly Rent Rate</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                ₹{profile.roomDetails.monthlyRent.toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>
        </div>

        {/* 4. Guardian & Emergency Contact */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Guardian & Emergency Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="text-slate-400 text-[10px] block">Guardian Name</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                {profile.guardianName} ({profile.guardianRelation || 'Parent'})
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="text-slate-400 text-[10px] block">Guardian Phone</span>
              <a href={`tel:${profile.guardianPhone}`} className="font-bold text-blue-600 dark:text-blue-400 block mt-0.5 hover:underline">
                {profile.guardianPhone}
              </a>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
              <span className="text-slate-400 text-[10px] block">Emergency Helpline</span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                {profile.emergencyContact}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Contact Information & Edit Form */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Resident Contact & Communications
          </h3>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Resident Phone Number" required>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Alternative Emergency Phone">
                  <Input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                  Save Contact Updates
                </Button>
                <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="text-slate-400">Personal Email:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="text-slate-400">Mobile Phone:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.phone}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Security & Password Update Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Account Security & Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your student portal login password
              </p>
            </div>
          </div>

          {!isChangingPassword && (
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              Change Password
            </Button>
          )}
        </div>

        {passwordSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {isChangingPassword && (
          <form onSubmit={handleChangePassword} className="mt-5 space-y-4 max-w-md">
            {passwordError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
                {passwordError}
              </div>
            )}

            <FormField label="Current Password" required>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </FormField>

            <FormField label="New Password (min 8 characters)" required>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Confirm New Password" required>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Update Password
              </Button>
              <Button variant="ghost" type="button" onClick={() => setIsChangingPassword(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
export default StudentProfilePage;

