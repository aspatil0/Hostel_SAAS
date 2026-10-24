import { useState, useEffect, type FormEvent } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  BedDouble,
  UserCheck,
  Phone,
  Mail,
  Edit2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  Eye,
  Sparkles,
  Loader2,
  Upload,
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
import { initialProperties } from '@/data/mockData';
import { propertyService } from '@/services/propertyService';
import type { Property } from '@/types/property';

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<Property | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Mumbai',
    image:
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    totalRooms: 30,
    totalBeds: 80,
    status: 'active' as 'active' | 'inactive',
  });

  // Load properties from backend with fallback
  useEffect(() => {
    let isMounted = true;
    async function loadProperties() {
      setIsLoading(true);
      try {
        const data = await propertyService.getProperties(searchQuery, statusFilter);
        if (isMounted) setProperties(data);
      } catch (err) {
        console.warn('Could not fetch properties from backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProperties();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, statusFilter]);

  // Filtered Properties for local instant filtering
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : prop.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleOpenAddModal = () => {
    setEditingProperty(null);
    setFormData({
      name: '',
      address: '',
      city: 'Mumbai',
      image:
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      totalRooms: 30,
      totalBeds: 80,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setFormData({
      name: prop.name,
      address: prop.address,
      city: prop.city,
      image: prop.image,
      ownerName: prop.ownerName,
      ownerPhone: prop.ownerPhone,
      ownerEmail: prop.ownerEmail,
      totalRooms: prop.totalRooms,
      totalBeds: prop.totalBeds,
      status: prop.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    const target = properties.find((p) => p.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';

    try {
      await propertyService.updatePropertyStatus(id, nextStatus);
    } catch {
      // offline fallback
    }

    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProperty) {
      try {
        await propertyService.updateProperty(editingProperty.id, formData);
      } catch {
        // offline fallback
      }

      setProperties((prev) =>
        prev.map((p) =>
          p.id === editingProperty.id
            ? {
              ...p,
              ...formData,
              totalRooms: Number(formData.totalRooms),
              totalBeds: Number(formData.totalBeds),
            }
            : p
        )
      );
    } else {
      let newProperty: Property;
      try {
        newProperty = await propertyService.createProperty(formData);
      } catch {
        newProperty = {
          id: `PROP-${String(properties.length + 1).padStart(2, '0')}`,
          ...formData,
          totalRooms: Number(formData.totalRooms),
          totalBeds: Number(formData.totalBeds),
          occupiedBeds: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
      }
      setProperties([newProperty, ...properties]);
    }

    setIsModalOpen(false);
  };

  // Preset sample hostel images for easy quick selection
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
      label: 'Student Loft',
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const file=e.target.files?.[0];
    if(!file)return;


    if(!file.type.startsWith("image/")){
      alert("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload=()=>{
      if(typeof reader.result === 'string')
      {
        setFormData(prev =>({...prev , image :reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    
  }

  // Table Columns Definition
  const tableColumns: Column<Property>[] = [
    {
      id: 'property',
      header: 'Property',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.image}
            alt={p.name}
            className="h-12 w-14 rounded-lg object-cover border border-[#E2E8F0] dark:border-[#1F2E45]"
          />
          <div>
            <p className="font-bold text-xs text-[#172B45] dark:text-white">{p.name}</p>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
              {p.address}, {p.city}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'admin',
      header: 'Property Admin (Downside)',
      accessor: (p) => (
        <div>
          <p className="font-semibold text-xs text-[#172B45] dark:text-white flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold">
              {p.ownerName.charAt(0)}
            </span>
            {p.ownerName}
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <Phone className="h-3 w-3" /> {p.ownerPhone}
          </p>
        </div>
      ),
    },
    {
      id: 'capacity',
      header: 'Capacity & Occupancy',
      accessor: (p) => {
        const rate = Math.round((p.occupiedBeds / p.totalBeds) * 100);
        return (
          <div className="w-36">
            <div className="flex items-center justify-between text-xs text-[#172B45] dark:text-slate-200">
              <span className="font-semibold">{p.totalRooms} Rms</span>
              <span className="font-mono text-[#64748B] dark:text-slate-400">
                {p.occupiedBeds}/{p.totalBeds} Beds ({rate}%)
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${rate > 90
                    ? 'bg-rose-500'
                    : rate > 70
                      ? 'bg-indigo-600'
                      : 'bg-emerald-500'
                  }`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (p) => <StatusBadge status={p.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPropertyDetails(p)}
            title="View Details"
          >
            <Eye className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEditModal(p)}
            title="Edit Property"
          >
            <Edit2 className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(p.id)}
            className="text-xs"
          >
            {p.status === 'active' ? 'Deactivate' : 'Activate'}
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
              Hostel Properties
            </h1>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Manage student accommodations, monitor capacity limits, and assign
            property administrators.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleOpenAddModal}
        >
          Add Property
        </Button>
      </div>

      {/* 2. Controls & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by property, city, or manager..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50/60 py-2 pl-10 pr-4 text-xs text-[#172B45] placeholder:text-slate-400 focus:border-[#142D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142D4E]/15 dark:border-[#1F2E45] dark:bg-[#0F172A] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
          />
        </div>

        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2.5">
          {/* Status Filter Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-[#0D1522] border border-transparent dark:border-[#1F2E45]">
            {(['all', 'active', 'inactive'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${statusFilter === tab
                    ? 'bg-white text-[#172B45] shadow-xs dark:bg-[#1A2536] dark:text-white'
                    : 'text-[#64748B] hover:text-[#172B45] dark:text-slate-400 dark:hover:text-white'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center rounded-xl border border-[#E2E8F0] bg-white p-1 dark:border-[#1F2E45] dark:bg-[#121824]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${viewMode === 'grid'
                  ? 'bg-[#142D4E] text-white shadow-xs dark:bg-indigo-600'
                  : 'text-slate-400 hover:text-[#172B45] dark:hover:text-white'
                }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${viewMode === 'table'
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

      {/* 3. Main Display: Card Grid View */}
      {viewMode === 'grid' ? (
        filteredProperties.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center dark:border-[#1F2E45] dark:bg-[#121824]">
            <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-base font-semibold text-[#172B45] dark:text-white">
              No properties found
            </h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
              Try adjusting your search criteria or add a new hostel property.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => {
              const occupancyRate = Math.round(
                (prop.occupiedBeds / prop.totalBeds) * 100
              );

              return (
                <div
                  key={prop.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs transition-all hover:shadow-md dark:border-[#1F2E45] dark:bg-[#121824]"
                >
                  <div>
                    {/* Property Image Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={prop.image}
                        alt={prop.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute left-3 top-3">
                        <StatusBadge status={prop.status} />
                      </div>
                      <div className="absolute right-3 top-3">
                        <span className="rounded-lg bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                          {prop.city}
                        </span>
                      </div>

                      {/* Title over image base */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="text-base font-bold leading-tight drop-shadow-sm">
                          {prop.name}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-200 drop-shadow-sm">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                          <span className="truncate">{prop.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Middle Section: Property Capacity */}
                    <div className="p-5 pb-4">
                      <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-semibold text-[#172B45] dark:text-white">
                          <BedDouble className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          Capacity
                        </span>
                        <span>
                          <strong className="text-[#172B45] dark:text-white">
                            {prop.totalRooms}
                          </strong>{' '}
                          Rooms •{' '}
                          <strong className="text-[#172B45] dark:text-white">
                            {prop.totalBeds}
                          </strong>{' '}
                          Beds
                        </span>
                      </div>

                      {/* Occupancy Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#64748B] dark:text-slate-400">Occupancy</span>
                          <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                            {prop.occupiedBeds} / {prop.totalBeds} ({occupancyRate}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${occupancyRate > 90
                                ? 'bg-rose-500'
                                : occupancyRate > 70
                                  ? 'bg-indigo-600 dark:bg-indigo-500'
                                  : 'bg-emerald-500'
                              }`}
                            style={{ width: `${occupancyRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Downside Section: Property Admin & Actions */}
                  <div className="border-t border-[#E2E8F0] bg-slate-50/70 p-4 dark:border-[#1F2E45] dark:bg-[#0E1522]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/20">
                          {prop.ownerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B] dark:text-slate-400">
                            Managed by
                          </p>
                          <p className="text-xs font-bold text-[#172B45] dark:text-white">
                            {prop.ownerName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prop)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-[#172B45] transition-colors dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                          title="Edit Property"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(prop.id)}
                          className={`rounded-lg p-1.5 transition-colors cursor-pointer ${prop.status === 'active'
                              ? 'text-rose-500 hover:bg-rose-100/80 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/40'
                            }`}
                          title={
                            prop.status === 'active'
                              ? 'Deactivate Property'
                              : 'Activate Property'
                          }
                        >
                          {prop.status === 'active' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {prop.ownerPhone}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPropertyDetails(prop)}
                        className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                      >
                        View Full Details →
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
        <DataTable columns={tableColumns} data={filteredProperties} />
      )}

      {/* 4. Add / Edit Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProperty ? 'Edit Property' : 'Add New Property'}
        description="Configure campus hostel details, upload display image, and assign property administration."
        size="xl"
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
              {editingProperty ? 'Save Changes' : 'Create Property'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Property Name" required>
              <Input
                placeholder="e.g. Grand Skyline Premier Hostel"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </FormField>

            <FormField label="City / Region" required>
              <Input 
              placeholder='e.g. Pune , Maharashtra'
              value={formData.city}
              onChange={(e)=> setFormData({...formData,city:e.target.value})}/>
            </FormField>
          </div>

          <FormField label="Full Property Address" required>
            <Input
              placeholder="e.g. Opp. University North Gate, Powai Road"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </FormField>

          {/* Property Image Selection & Preview */}
          <div>
            <FormField
              label="Property Display Image (Shown to students & residents)"
              hint="Paste an image URL or pick one of the hostel presets below"
              required
            >
             <div className="flex items-center gap-3">
              {/* Direct URL input */}
              <div className="flex-1">
                <Input
                  placeholder="Paste image URL or upload from device →"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  required
                />
              </div>
              {/* Device Upload Trigger */}
              <label
                htmlFor="property-image-file"
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-[#E2E8F0] bg-white text-[#172B45] hover:bg-slate-50 cursor-pointer transition-colors dark:border-[#1F2E45] dark:bg-[#121824] dark:text-white"
              >
                <Upload className="h-4 w-4 text-indigo-600" />
                <span>Upload File</span>
                <input
                  id="property-image-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileUpload}
                />
              </label>
            </div>
            </FormField>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" /> Presets:
              </span>
              {imagePresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, image: preset.url })
                  }
                  className={`rounded-lg px-2.5 py-1 text-xs border transition-all cursor-pointer ${formData.image === preset.url
                      ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50 dark:border-[#1F2E45] dark:bg-[#121824] dark:text-slate-300 dark:hover:bg-[#1A2536]'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Live Image Preview */}
            {formData.image && (
              <div className="mt-3 overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#1F2E45] h-36 bg-slate-100 dark:bg-slate-800">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Total Rooms" required>
              <Input
                type="number"
                min="1"
                placeholder="45"
                value={formData.totalRooms}
                onChange={(e) =>
                  setFormData({ ...formData, totalRooms: Number(e.target.value) })
                }
                required
              />
            </FormField>
            <FormField label="Total Beds (Capacity)" required>
              <Input
                type="number"
                min="1"
                placeholder="120"
                value={formData.totalBeds}
                onChange={(e) =>
                  setFormData({ ...formData, totalBeds: Number(e.target.value) })
                }
                required
              />
            </FormField>
          </div>

          {/* Property Admin Downside Fields */}
          <div className="rounded-xl border border-[#E2E8F0] bg-slate-50/70 p-4 space-y-3 dark:border-[#1F2E45] dark:bg-[#0E1522]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#172B45] dark:text-white flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Property Admin / Manager Assignment
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Owner / Admin Name" required>
                <Input
                  placeholder="Rahul Sharma"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  required
                />
              </FormField>

              <FormField label="Mobile Number" required>
                <Input
                  placeholder="+91 98201 12345"
                  value={formData.ownerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerPhone: e.target.value })
                  }
                  required
                />
              </FormField>

              <FormField label="Email Address" required>
                <Input
                  type="email"
                  placeholder="admin@skyline.com"
                  value={formData.ownerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerEmail: e.target.value })
                  }
                  required
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. View Property Details Modal */}
      {selectedPropertyDetails && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPropertyDetails(null)}
          title={selectedPropertyDetails.name}
          description={`ID: ${selectedPropertyDetails.id} • Registered on ${selectedPropertyDetails.createdAt}`}
          size="md"
          footer={
            <Button
              variant="outline"
              onClick={() => setSelectedPropertyDetails(null)}
            >
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="h-44 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedPropertyDetails.image}
                alt={selectedPropertyDetails.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-[#E2E8F0] p-3 dark:border-[#1F2E45] dark:bg-[#162030]">
                <span className="text-[#64748B] dark:text-slate-400 block text-[11px]">Location</span>
                <span className="font-bold text-[#172B45] dark:text-white">
                  {selectedPropertyDetails.address}, {selectedPropertyDetails.city}
                </span>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] p-3 dark:border-[#1F2E45] dark:bg-[#162030]">
                <span className="text-[#64748B] dark:text-slate-400 block text-[11px]">Status</span>
                <span className="mt-1 inline-block">
                  <StatusBadge status={selectedPropertyDetails.status} />
                </span>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] p-3 dark:border-[#1F2E45] dark:bg-[#162030]">
                <span className="text-[#64748B] dark:text-slate-400 block text-[11px]">Total Capacity</span>
                <span className="font-bold text-[#172B45] dark:text-white">
                  {selectedPropertyDetails.totalRooms} Rooms ({selectedPropertyDetails.totalBeds} Beds)
                </span>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] p-3 dark:border-[#1F2E45] dark:bg-[#162030]">
                <span className="text-[#64748B] dark:text-slate-400 block text-[11px]">Current Occupancy</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedPropertyDetails.occupiedBeds} Beds Occupied (
                  {Math.round(
                    (selectedPropertyDetails.occupiedBeds /
                      selectedPropertyDetails.totalBeds) *
                    100
                  )}
                  %)
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/40">
              <p className="font-bold text-[#172B45] dark:text-white flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Assigned Administrator
              </p>
              <div className="mt-2 space-y-1 text-[#64748B] dark:text-slate-300">
                <p>
                  <strong>Name:</strong> {selectedPropertyDetails.ownerName}
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {selectedPropertyDetails.ownerPhone}
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {selectedPropertyDetails.ownerEmail}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
