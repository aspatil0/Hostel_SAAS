import { useState, useEffect, type FormEvent } from 'react';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Shield,
  Wifi,
  Coffee,
  Sparkles,
  Lock,
  Clock,
  Save,
  BellRing,
} from 'lucide-react';
import { propertyPortalService } from '@/services/propertyPortalService';

export function ProfilePage() {
  const [isSaved, setIsSaved] = useState(false);

  const [hostelData, setHostelData] = useState({
    name: 'Grand Skyline Premier Hostel',
    tagline: 'Premium Student & Executive PG Accommodation',
    address: 'Opp. University North Gate, Powai Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400076',
    contactPhone: '+91 98201 12345',
    contactEmail: 'contact@grandskyline.com',
    totalRooms: 45,
    totalBeds: 120,
    curfewTime: '10:30 PM',
    messBreakfast: '07:30 AM - 09:30 AM',
    messDinner: '08:00 PM - 10:00 PM',
  });

  const [managerData, setManagerData] = useState({
    name: 'Rahul Sharma',
    role: 'Authorized Property Manager',
    phone: '+91 98201 12345',
    email: 'rahul.sharma@skylinehostels.com',
    emergencyPhone: '+91 98201 00999',
  });

  const [amenities, setAmenities] = useState({
    wifi: true,
    meals: true,
    roWater: true,
    biometric: true,
    ac: true,
    powerBackup: true,
    housekeeping: true,
    cctv: true,
    laundry: true,
    studyRoom: true,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const profile = await propertyPortalService.getProfile();
        if (isMounted && profile) {
          if (profile.hostelData) setHostelData(profile.hostelData as any);
          if (profile.managerData) setManagerData(profile.managerData as any);
          if (profile.amenities) setAmenities(profile.amenities as any);
        }
      } catch (err) {
        console.warn('Profile API offline:', err);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await propertyPortalService.updateProfile({
        hostelData,
        managerData,
        amenities,
      });
    } catch {
      // offline fallback
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const toggleAmenity = (key: keyof typeof amenities) => {
    setAmenities({ ...amenities, [key]: !amenities[key] });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B45] dark:text-white">
            Hostel & Manager Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure hostel contact details, manager credentials, facility amenities, and hostel house rules.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {isSaved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Hostel parameters and manager profile updated successfully!</span>
        </div>
      )}

      {/* 2. Main Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col (2 spans): Hostel & Manager Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hostel Details Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#172B45] dark:text-white">
                  Hostel Property Information
                </h2>
                <p className="text-xs text-slate-400">
                  Primary hostel details shown on receipts, student agreements, and marketing posts.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Hostel Official Name
                  </label>
                  <input
                    type="text"
                    value={hostelData.name}
                    onChange={(e) => setHostelData({ ...hostelData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Hostel Headline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={hostelData.tagline}
                    onChange={(e) => setHostelData({ ...hostelData, tagline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Street Address
                </label>
                <input
                  type="text"
                  value={hostelData.address}
                  onChange={(e) => setHostelData({ ...hostelData, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={hostelData.city}
                    onChange={(e) => setHostelData({ ...hostelData, city: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    State
                  </label>
                  <input
                    type="text"
                    value={hostelData.state}
                    onChange={(e) => setHostelData({ ...hostelData, state: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={hostelData.pincode}
                    onChange={(e) => setHostelData({ ...hostelData, pincode: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Hostel Office Phone
                  </label>
                  <input
                    type="tel"
                    value={hostelData.contactPhone}
                    onChange={(e) => setHostelData({ ...hostelData, contactPhone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Support / Inquiries Email
                  </label>
                  <input
                    type="email"
                    value={hostelData.contactEmail}
                    onChange={(e) => setHostelData({ ...hostelData, contactEmail: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Manager & Warden Profile Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#172B45] dark:text-white">
                  Property Manager & Warden Contact
                </h2>
                <p className="text-xs text-slate-400">
                  Manager profile displayed to residents and guardians for 24/7 support.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Manager Full Name
                </label>
                <input
                  type="text"
                  value={managerData.name}
                  onChange={(e) => setManagerData({ ...managerData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Manager Designation
                </label>
                <input
                  type="text"
                  value={managerData.role}
                  onChange={(e) => setManagerData({ ...managerData, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Manager Mobile
                </label>
                <input
                  type="tel"
                  value={managerData.phone}
                  onChange={(e) => setManagerData({ ...managerData, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Emergency Line (24x7)
                </label>
                <input
                  type="tel"
                  value={managerData.emergencyPhone}
                  onChange={(e) => setManagerData({ ...managerData, emergencyPhone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Amenities & Hostel Rules */}
        <div className="space-y-6">
          {/* Active Amenities Checklist */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
            <h3 className="text-sm font-bold text-[#172B45] dark:text-white mb-1">
              Hostel Amenities & Facilities
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Toggle amenities offered to current students & PG guests.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { key: 'wifi', label: 'Fiber High-Speed WiFi', icon: Wifi },
                { key: 'meals', label: '4 Hygienic Meals Daily', icon: Coffee },
                { key: 'biometric', label: 'Biometric Access Control', icon: Lock },
                { key: 'powerBackup', label: '100% DG Power Backup', icon: Sparkles },
                { key: 'cctv', label: '24/7 CCTV Surveillance', icon: Shield },
                { key: 'studyRoom', label: 'Quiet Study & Library Area', icon: Building2 },
              ].map((item) => {
                const Icon = item.icon;
                const active = amenities[item.key as keyof typeof amenities];

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleAmenity(item.key as any)}
                    className={`flex items-center justify-between w-full p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      active
                        ? 'border-emerald-500/40 bg-emerald-50/40 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300'
                        : 'border-slate-200 bg-slate-50/50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      active ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {active ? 'ACTIVE' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hostel Rules Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#172B45] dark:text-white">
                Hostel Schedule & House Rules
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  Main Gate Curfew Time
                </label>
                <input
                  type="text"
                  value={hostelData.curfewTime}
                  onChange={(e) => setHostelData({ ...hostelData, curfewTime: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  Mess Breakfast Hours
                </label>
                <input
                  type="text"
                  value={hostelData.messBreakfast}
                  onChange={(e) => setHostelData({ ...hostelData, messBreakfast: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  Mess Dinner Hours
                </label>
                <input
                  type="text"
                  value={hostelData.messDinner}
                  onChange={(e) => setHostelData({ ...hostelData, messDinner: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-3 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
