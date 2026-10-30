import { useState, useEffect, type FormEvent } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  BedDouble,
  Edit2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Loader2,
  Upload,
  KeyRound,
  Copy,
  Trash2,
} from 'lucide-react';
import {
  Button,
  StatusBadge,
  Modal,
  FormField,
  Input,
  Select,
  DataTable,
  type Column,
} from '@/components/ui';
import { initialPropertyAdmins, initialProperties } from '@/data/mockData';
import { adminService } from '@/services/adminService';
import { propertyService } from '@/services/propertyService';
import type { Property, PropertyAdmin } from '@/types/property';

export function PropertyAdminsPage() {
  const [admins, setAdmins] = useState<PropertyAdmin[]>(initialPropertyAdmins);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<PropertyAdmin | null>(null);
  const [viewingAdmin, setViewingAdmin] = useState<PropertyAdmin | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    propertyName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    image:
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    totalRooms: 35,
    totalBeds: 90,
    occupiedBeds: 75,
    portalPassword: 'Hostel@2026',
    status: 'active' as 'active' | 'inactive',
  });

  // Load admins and properties from backend with fallback  
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [adminsData, propsData] = await Promise.all([
          adminService.getAdmins(searchQuery, statusFilter),
          propertyService.getProperties(),
        ]);
        if (isMounted) {
          setAdmins(adminsData);
          setProperties(propsData);
        }
      } catch (err) {
        console.warn('Could not fetch data from backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, statusFilter]);

  // Sample student-facing image presets for instant preview
  const imagePresets = [
    {
      label: 'Campus Dorm',
      url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Modern Co-living',
      url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Heritage Residency',
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Executive Suite',
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Filtering
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : admin.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Device file upload handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Generate strong random password
  const handleGeneratePassword = () => {
    const specials = ['@', '#', '$', '!'];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPass = `Hostel${randomSpecial}${randomNum}`;
    setFormData((prev) => ({ ...prev, portalPassword: newPass }));
  };

  // Copy portal credentials to clipboard
  const handleCopyCredentials = (adminEmail: string, pass: string, propName: string) => {
    const text = `HostelOS Property Administrator Portal Access:\nPortal URL: ${window.location.origin}/login\nUsername / Email: ${adminEmail}\nPassword: ${pass}\nAssigned Property: ${propName}\nRole: Property Administrator`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  // Handlers
  const handleOpenAddModal = () => {
    setEditingAdmin(null);
    setShowPassword(false);
    const initialPass = `Hostel@${Math.floor(1000 + Math.random() * 9000)}`;
    const firstProp = properties[0];
    setFormData({
      propertyName: firstProp?.name || '',
      ownerName: '',
      phone: '',
      email: '',
      address: firstProp?.address || '',
      city: firstProp?.city || 'Mumbai',
      image: firstProp?.image || imagePresets[0].url,
      totalRooms: firstProp?.totalRooms || 30,
      totalBeds: firstProp?.totalBeds || 80,
      occupiedBeds: firstProp?.occupiedBeds ?? 0,
      portalPassword: initialPass,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin: PropertyAdmin) => {
    setEditingAdmin(admin);
    setShowPassword(false);
    setFormData({
      propertyName: admin.propertyName,
      ownerName: admin.ownerName,
      phone: admin.phone,
      email: admin.email,
      address: admin.address,
      city: admin.city,
      image: admin.image,
      totalRooms: admin.totalRooms || 30,
      totalBeds: admin.totalBeds || 80,
      occupiedBeds: admin.occupiedBeds ?? Math.round((admin.totalBeds || 80) * 0.85),
      portalPassword: admin.portalPassword || 'Hostel@2026',
      status: admin.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    const target = admins.find((a) => a.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';

    try {
      await adminService.updateAdminStatus(id, nextStatus);
    } catch {
      // offline fallback
    }

    setAdmins((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: nextStatus } : a
      )
    );
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property administrator?')) return;
    try {
      await adminService.deleteAdmin(id);
    } catch {
      // offline fallback
    }
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName.trim() || !formData.propertyName.trim()) return;

    if (editingAdmin) {
      try {
        await adminService.updateAdmin(editingAdmin.id, formData);
      } catch {
        // offline fallback
      }

      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editingAdmin.id
            ? {
                ...a,
                ...formData,
                totalRooms: Number(formData.totalRooms),
                totalBeds: Number(formData.totalBeds),
                occupiedBeds: Number(formData.occupiedBeds ?? a.occupiedBeds ?? Math.round(Number(formData.totalBeds) * 0.85)),
                portalPassword: formData.portalPassword || a.portalPassword || 'Hostel@2026',
              }
            : a
        )
      );
    } else {
      let newAdmin: PropertyAdmin;
      try {
        newAdmin = await adminService.createAdmin(formData);
      } catch {
        newAdmin = {
          id: `ADM-${String(admins.length + 1).padStart(2, '0')}`,
          ...formData,
          totalRooms: Number(formData.totalRooms),
          totalBeds: Number(formData.totalBeds),
          occupiedBeds: Number(formData.occupiedBeds || Math.round(Number(formData.totalBeds) * 0.85)),
          portalPassword: formData.portalPassword || 'Hostel@2026',
          joinedDate: new Date().toISOString().split('T')[0],
        };
      }
      setAdmins([newAdmin, ...admins]);
    }

    // Synchronize the assigned property in propertyService so Properties Page immediately reflects this manager
    const matchedProp = properties.find(
      (p) => p.name.toLowerCase().trim() === formData.propertyName.toLowerCase().trim()
    );
    if (matchedProp) {
      try {
        await propertyService.updateProperty(matchedProp.id, {
          ownerName: formData.ownerName,
          ownerPhone: formData.phone,
          ownerEmail: formData.email,
        });
      } catch {
        // handled
      }
      setProperties((prev) =>
        prev.map((p) =>
          p.id === matchedProp.id
            ? { ...p, ownerName: formData.ownerName, ownerPhone: formData.phone, ownerEmail: formData.email }
            : p
        )
      );
    }

    setIsModalOpen(false);
  };

  // Pre-fill property details if user chooses an existing property from dropdown
  const handleSelectExistingProperty = (propName: string) => {
    const existing = properties.find((p) => p.name === propName);
    if (existing) {
      setFormData((prev) => ({
        ...prev,
        propertyName: existing.name,
        address: existing.address,
        city: existing.city,
        image: existing.image,
        totalRooms: existing.totalRooms,
        totalBeds: existing.totalBeds,
        occupiedBeds: existing.occupiedBeds ?? 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        propertyName: propName,
      }));
    }
  };

  // Table Columns
  const tableColumns: Column<PropertyAdmin>[] = [
    {
      id: 'admin',
      header: 'Property Administrator',
      accessor: (a) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-xs">
            {a.ownerName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-xs text-[#172B45] dark:text-white">{a.ownerName}</p>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3" /> {a.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'property',
      header: 'Assigned Property',
      accessor: (a) => (
        <div className="flex items-center gap-3">
          <img
            src={a.image}
            alt={a.propertyName}
            className="h-10 w-12 rounded-lg object-cover border border-[#E2E8F0] dark:border-[#1F2E45] shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-xs text-[#172B45] dark:text-white truncate">
              {a.propertyName}
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
              {a.address}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'Mobile Number',
      accessor: (a) => (
        <span className="text-xs font-medium text-[#172B45] dark:text-slate-200 flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-slate-400" /> {a.phone}
        </span>
      ),
    },
    {
      id: 'capacity',
      header: 'Capacity',
      accessor: (a) => (
        <span className="text-xs text-[#172B45] dark:text-slate-200">
          <strong>{a.totalRooms}</strong> Rooms • <strong>{a.totalBeds}</strong> Beds
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (a) => <StatusBadge status={a.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingAdmin(a)}
            title="View Admin Details"
          >
            <Eye className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEditModal(a)}
            title="Edit Admin"
          >
            <Edit2 className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteAdmin(a.id)}
            title="Delete Admin"
            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(a.id)}
            className="text-xs"
          >
            {a.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172B45] dark:text-white">
              Property Administrators
            </h1>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Register hostel owners, manage contact profiles, and configure student-facing hostel listings.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleOpenAddModal}
        >
          Add Property Admin
        </Button>
      </div>

      {/* 2. Top Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
          <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Total Admins</p>
          <p className="text-2xl font-bold text-[#172B45] dark:text-white mt-1">{admins.length}</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active Accounts</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {admins.filter((a) => a.status === 'active').length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Inactive / Suspended</p>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
            {admins.filter((a) => a.status === 'inactive').length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Hostels Covered</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
            {new Set(admins.map((a) => a.propertyName)).size}
          </p>
        </div>
      </div>

      {/* 3. Search and View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by admin name, hostel, phone, email..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50/60 py-2 pl-10 pr-4 text-xs text-[#172B45] placeholder:text-slate-400 focus:border-[#142D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142D4E]/15 dark:border-[#1F2E45] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
          />
        </div>

        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-[#0D1522] border border-transparent dark:border-[#1F2E45]">
            {(['all', 'active', 'inactive'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white text-[#172B45] shadow-xs dark:bg-[#1A2536] dark:text-white'
                    : 'text-[#64748B] hover:text-[#172B45] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid vs Table View */}
          <div className="flex items-center rounded-xl border border-[#E2E8F0] bg-white p-1 dark:border-[#1F2E45] dark:bg-[#121824]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#142D4E] text-white shadow-xs dark:bg-indigo-600'
                  : 'text-slate-400 hover:text-[#172B45] dark:hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#142D4E] text-white shadow-xs dark:bg-indigo-600'
                  : 'text-slate-400 hover:text-[#172B45] dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Directory Display: Grid or Table */}
      {viewMode === 'grid' ? (
        filteredAdmins.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center dark:border-[#1F2E45] dark:bg-[#121824]">
            <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-base font-semibold text-[#172B45] dark:text-white">
              No property administrators found
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
              Try adjusting your search criteria or register a new property admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdmins.map((admin) => {
              const totalBeds = Number(admin.totalBeds) || 80;
              const occupiedBeds = Number(admin.occupiedBeds ?? Math.round(totalBeds * 0.85));
              const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
              const occupancyRate = Math.min(100, Math.round((occupiedBeds / totalBeds) * 100));
              const totalRooms = Number(admin.totalRooms) || 30;
              const occupiedRooms = Math.min(totalRooms, Math.ceil((occupiedBeds / totalBeds) * totalRooms));

              return (
                <div
                  key={admin.id}
                  onClick={() => setViewingAdmin(admin)}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs transition-all hover:shadow-md hover:border-indigo-300 dark:border-[#1F2E45] dark:bg-[#121824] dark:hover:border-indigo-600 cursor-pointer"
                >
                  <div>
                    {/* Top: Student-Facing Property Image Showcase */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={admin.image}
                        alt={admin.propertyName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      {/* Status badge top-left */}
                      <div className="absolute left-3 top-3">
                        <StatusBadge status={admin.status} />
                      </div>

                      {/* Student view indicator pill */}
                      <div className="absolute right-3 top-3">
                        <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm flex items-center gap-1">
                          <Eye className="h-3 w-3 text-emerald-400" /> Student View
                        </span>
                      </div>

                      {/* Property title over banner */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                          Assigned Property
                        </p>
                        <h3 className="text-base font-bold leading-tight drop-shadow-sm truncate">
                          {admin.propertyName}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-200 truncate">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                          {admin.address}
                        </p>
                      </div>
                    </div>

                    {/* Body: Live Student Bedroom & Bed Occupancy Insights */}
                    <div className="p-5 pb-4">
                      {/* Header with Admin Avatar & Property Status */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1F2E45]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#142D4E] dark:bg-indigo-600 text-white font-bold text-xs shadow-xs">
                            {admin.ownerName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B] dark:text-slate-400">
                              Property Admin
                            </p>
                            <h4 className="text-xs font-bold text-[#172B45] dark:text-white">
                              {admin.ownerName}
                            </h4>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {admin.id}
                        </span>
                      </div>

                      {/* Live Student Occupancy Metric Section */}
                      <div className="mt-3.5 space-y-3">
                        {/* Occupancy Rate Bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#172B45] dark:text-white flex items-center gap-1.5">
                              <BedDouble className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              Student Live Occupancy
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                occupancyRate >= 90
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : occupancyRate >= 70
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {occupancyRate}% Full
                            </span>
                          </div>

                          <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                occupancyRate >= 90
                                  ? 'bg-rose-500'
                                  : occupancyRate >= 70
                                  ? 'bg-indigo-600 dark:bg-indigo-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Live Count Grid: Purchased/Taken vs Vacant */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                            <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-slate-400 block">
                              Taken by Students/PG
                            </span>
                            <p className="mt-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                              {occupiedBeds} <span className="font-normal text-[11px] text-slate-600 dark:text-slate-400">/ {totalBeds} Beds</span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              ({occupiedRooms} of {totalRooms} rooms active)
                            </p>
                          </div>

                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                            <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-slate-400 block">
                              Available Vacancy
                            </span>
                            <p className="mt-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              {vacantBeds} <span className="font-normal text-[11px] text-slate-600 dark:text-slate-400">Beds Open</span>
                            </p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                              Ready for admission
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Downside: Actions Footer */}
                  <div
                    className="border-t border-[#E2E8F0] bg-slate-50/70 p-3.5 flex items-center justify-between dark:border-[#1F2E45] dark:bg-[#0E1522]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setViewingAdmin(admin)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                    >
                      View Live Details →
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(admin)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-[#172B45] transition-colors dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                        title="Edit Admin & Property"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer"
                        title="Delete Admin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(admin.id)}
                        className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                          admin.status === 'active'
                            ? 'text-rose-500 hover:bg-rose-100/80 dark:hover:bg-rose-950/40'
                            : 'text-emerald-600 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/40'
                        }`}
                        title={
                          admin.status === 'active'
                            ? 'Deactivate Account'
                            : 'Activate Account'
                        }
                      >
                        {admin.status === 'active' ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Table View */
        <DataTable columns={tableColumns} data={filteredAdmins} />
      )}

      {/* 5. Registration / Edit Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingAdmin
            ? 'Edit Property Administrator'
            : 'Assign Property Administrator'
        }
        description="Select an assigned hostel property and configure manager profile & portal credentials."
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={handleSubmitForm}>
              {editingAdmin ? 'Save Changes' : 'Create & Assign Administrator'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {/* Section 1: Assigned Property Selection */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Assigned Hostel / Property <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                Created in Properties Page
              </span>
            </div>

            <select
              value={formData.propertyName}
              onChange={(e) => handleSelectExistingProperty(e.target.value)}
              className="w-full rounded-lg border border-indigo-200 bg-white py-2 px-3 text-xs text-[#172B45] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-800 dark:bg-[#0F172A] dark:text-white"
              required
            >
              <option value="">-- Choose Property to Assign --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>

            {/* Selected Property Preview Banner */}
            {formData.propertyName && (
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white p-3 dark:border-indigo-900/50 dark:bg-[#0F172A]">
                <img
                  src={formData.image}
                  alt={formData.propertyName}
                  className="h-12 w-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#172B45] dark:text-white truncate">
                    {formData.propertyName}
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" /> {formData.address || 'Address on file'}, {formData.city}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                    <BedDouble className="h-3 w-3" /> {formData.totalRooms} Rooms • {formData.totalBeds} Beds Capacity
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Administrator Personal & Contact Details */}
          <div className="border-b border-[#E2E8F0] pb-3 dark:border-[#1F2E45]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#142D4E] dark:text-indigo-400 flex items-center gap-1.5 mb-3">
              <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Administrator Details
            </h4>

            <FormField label="Administrator / Manager Full Name" required>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <FormField label="Mobile Number" required>
                <Input
                  type="tel"
                  placeholder="+91 98201 12345"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </FormField>

              <FormField label="Email Address (Login Username)" required>
                <Input
                  type="email"
                  placeholder="admin@skylinehostels.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </FormField>
            </div>
          </div>

          {/* Section 3: Portal Access & Credentials */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Portal Access & Login Credentials
              </span>
              <span className="text-[10px] font-semibold rounded bg-indigo-100 px-2 py-0.5 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                Role: Property Admin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                  Portal Login Username
                </label>
                <div className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-mono text-[#172B45] dark:border-[#1F2E45] dark:bg-[#0E1522] dark:text-white truncate">
                  {formData.email || 'Enter email above to generate username'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
                    Assigned Portal Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.portalPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, portalPassword: e.target.value })
                    }
                    placeholder="e.g. Skyline@2026"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-[#172B45] dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                Credentials allow the administrator to log into their dedicated Property Admin workspace.
              </p>
              {formData.email && (
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCredentials(
                      formData.email,
                      formData.portalPassword,
                      formData.propertyName || 'Hostel'
                    )
                  }
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 cursor-pointer"
                >
                  {copiedCredentials ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Login Credentials</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Section 4: Account Operational Status */}
          <FormField label="Account Status" required>
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive',
                })
              }
              options={[
                { value: 'active', label: 'Active (Operational)' },
                { value: 'inactive', label: 'Inactive (Suspended)' },
              ]}
            />
          </FormField>
        </form>
      </Modal>

      {/* 6. View Details Modal with Live Student Occupancy Dashboard */}
      {viewingAdmin && (() => {
        const totalBeds = Number(viewingAdmin.totalBeds) || 80;
        const occupiedBeds = Number(viewingAdmin.occupiedBeds ?? Math.round(totalBeds * 0.85));
        const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
        const occupancyRate = Math.min(100, Math.round((occupiedBeds / totalBeds) * 100));
        const totalRooms = Number(viewingAdmin.totalRooms) || 30;
        const occupiedRooms = Math.min(totalRooms, Math.ceil((occupiedBeds / totalBeds) * totalRooms));

        return (
          <Modal
            isOpen={!!viewingAdmin}
            onClose={() => setViewingAdmin(null)}
            title="Property & Live Student Occupancy Overview"
            size="lg"
            footer={
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    const target = viewingAdmin;
                    setViewingAdmin(null);
                    handleOpenEditModal(target);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1" />
                  Edit Property & Admin
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setViewingAdmin(null)}
                >
                  Close
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Property Showcase Banner */}
              <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#1F2E45]">
                <img
                  src={viewingAdmin.image}
                  alt={viewingAdmin.propertyName}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                    {viewingAdmin.city}
                  </span>
                  <h3 className="text-base font-bold mt-1">
                    {viewingAdmin.propertyName}
                  </h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    {viewingAdmin.address}
                  </p>
                </div>
              </div>

              {/* Live Student & PG Guest Bedroom/Bed Count Statistics */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 dark:border-[#1F2E45] dark:bg-[#121824] shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1F2E45]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#142D4E] dark:text-indigo-400 flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Live Student & PG Guest Occupancy
                  </h4>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      occupancyRate >= 90
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : occupancyRate >= 70
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {occupancyRate}% Occupied
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="rounded-xl bg-indigo-50/70 p-3 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                    <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-slate-400 block">
                      Purchased Beds
                    </span>
                    <p className="text-lg font-extrabold text-indigo-700 dark:text-indigo-300 mt-0.5">
                      {occupiedBeds}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Taken by Students
                    </span>
                  </div>

                  <div className="rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-slate-400 block">
                      Vacant Beds
                    </span>
                    <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {vacantBeds}
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Ready to Allocate
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-[#1F2E45]">
                    <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-slate-400 block">
                      Live Bedrooms
                    </span>
                    <p className="text-lg font-extrabold text-[#172B45] dark:text-white mt-0.5">
                      {occupiedRooms} / {totalRooms}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Active Rooms
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-[#1F2E45]">
                    <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-slate-400 block">
                      Total Capacity
                    </span>
                    <p className="text-lg font-extrabold text-[#172B45] dark:text-white mt-0.5">
                      {totalBeds}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Total Hostel Beds
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyRate >= 90
                          ? 'bg-rose-500'
                          : occupancyRate >= 70
                          ? 'bg-indigo-600'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Profile Info Card (Admin Contact Info) */}
              <div className="rounded-xl border border-[#E2E8F0] bg-slate-50 p-4 space-y-3 dark:border-[#1F2E45] dark:bg-[#0E1522]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#142D4E] dark:bg-indigo-600 text-white font-bold text-base">
                      {viewingAdmin.ownerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#172B45] dark:text-white">
                        {viewingAdmin.ownerName}
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        Property Owner & Designated Admin • {viewingAdmin.id}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={viewingAdmin.status} />
                </div>

                <div className="border-t border-[#E2E8F0] pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs dark:border-[#1F2E45]">
                  <div>
                    <span className="text-[#64748B] dark:text-slate-400 block text-[11px]">Mobile Number</span>
                    <span className="font-semibold text-[#172B45] dark:text-white flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      {viewingAdmin.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-semibold text-[#172B45] dark:text-white truncate block flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      {viewingAdmin.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-slate-400 block text-[11px]">Registered On</span>
                    <span className="font-semibold text-[#172B45] dark:text-white block mt-0.5">
                      {viewingAdmin.joinedDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Portal Access & Credentials Card */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                      Administrator Portal Credentials
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCredentials(
                        viewingAdmin.email,
                        viewingAdmin.portalPassword || 'Hostel@2026',
                        viewingAdmin.propertyName
                      )
                    }
                    className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-slate-50 transition-colors dark:bg-[#1A2536] dark:text-indigo-300 cursor-pointer"
                  >
                    {copiedCredentials ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="rounded-lg bg-white p-2.5 border border-[#E2E8F0] dark:bg-[#121824] dark:border-[#1F2E45]">
                    <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-slate-400 block">
                      Username / Email
                    </span>
                    <p className="font-mono font-bold text-[#172B45] dark:text-white mt-0.5 truncate">
                      {viewingAdmin.email}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-[#E2E8F0] dark:bg-[#121824] dark:border-[#1F2E45]">
                    <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-slate-400 block">
                      Assigned Password
                    </span>
                    <p className="font-mono font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                      {viewingAdmin.portalPassword || 'Hostel@2026'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex items-start gap-2.5 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  This administrator is authorized to oversee bed allocations, resident check-ins, and student fee collections for{' '}
                  <strong className="dark:text-white">{viewingAdmin.propertyName}</strong>.
                </span>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
