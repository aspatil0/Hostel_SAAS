import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CheckCircle2,
  ShieldAlert,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  StatCard,
  DataTable,
  StatusBadge,
  Button,
  type Column,
} from '@/components/ui';

interface PropertyItem {
  id: string;
  name: string;
  city: string;
  rooms: number;
  beds: number;
  admin: string;
  status: 'active' | 'inactive';
}

interface AdminItem {
  id: string;
  name: string;
  email: string;
  property: string;
  status: 'active' | 'inactive';
  joined: string;
}

const mockProperties: PropertyItem[] = [
  {
    id: 'PROP-01',
    name: 'Grand Skyline Hostel',
    city: 'Mumbai',
    rooms: 45,
    beds: 120,
    admin: 'Rahul Sharma',
    status: 'active',
  },
  {
    id: 'PROP-02',
    name: 'Greenwood Heights PG',
    city: 'Pune',
    rooms: 30,
    beds: 80,
    admin: 'Sneha Patil',
    status: 'active',
  },
  {
    id: 'PROP-03',
    name: 'Heritage Residency',
    city: 'Bangalore',
    rooms: 20,
    beds: 50,
    admin: 'Amit Verma',
    status: 'inactive',
  },
  {
    id: 'PROP-04',
    name: 'Elite Scholars Hostel',
    city: 'Delhi',
    rooms: 55,
    beds: 150,
    admin: 'Unassigned',
    status: 'active',
  },
];

const mockAdmins: AdminItem[] = [
  {
    id: 'ADM-01',
    name: 'Rahul Sharma',
    email: 'rahul@skyline.com',
    property: 'Grand Skyline Hostel',
    status: 'active',
    joined: '12 Oct 2026',
  },
  {
    id: 'ADM-02',
    name: 'Sneha Patil',
    email: 'sneha@greenwood.com',
    property: 'Greenwood Heights PG',
    status: 'active',
    joined: '10 Oct 2026',
  },
  {
    id: 'ADM-03',
    name: 'Amit Verma',
    email: 'amit@heritage.com',
    property: 'Heritage Residency',
    status: 'inactive',
    joined: '05 Oct 2026',
  },
  {
    id: 'ADM-04',
    name: 'Priya Kulkarni',
    email: 'priya@scholars.com',
    property: 'Unassigned',
    status: 'active',
    joined: '01 Oct 2026',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();

  const activePropertiesCount = mockProperties.filter(
    (p) => p.status === 'active'
  ).length;
  const activeAdminsCount = mockAdmins.filter(
    (a) => a.status === 'active'
  ).length;

  const propertyColumns: Column<PropertyItem>[] = [
    {
      id: 'name',
      header: 'Property Name',
      accessor: (p) => (
        <span className="font-semibold text-[#172B45] dark:text-white">{p.name}</span>
      ),
    },
    {
      id: 'city',
      header: 'City',
      accessor: (p) => <span className="text-[#64748B] dark:text-slate-400">{p.city}</span>,
    },
    {
      id: 'capacity',
      header: 'Rooms / Beds',
      accessor: (p) => (
        <span className="text-xs text-[#64748B] dark:text-slate-400 font-mono">
          {p.rooms} Rms / {p.beds} Beds
        </span>
      ),
    },
    {
      id: 'admin',
      header: 'Manager',
      accessor: (p) => (
        <span className="text-xs font-medium text-[#172B45] dark:text-slate-200">{p.admin}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (p) => <StatusBadge status={p.status} />,
    },
  ];

  const adminColumns: Column<AdminItem>[] = [
    {
      id: 'name',
      header: 'Admin Name',
      accessor: (a) => (
        <div>
          <p className="font-semibold text-[#172B45] dark:text-white">{a.name}</p>
          <p className="text-xs text-[#64748B] dark:text-slate-400">{a.email}</p>
        </div>
      ),
    },
    {
      id: 'property',
      header: 'Assigned Property',
      accessor: (a) => (
        <span className="text-xs text-[#172B45] dark:text-slate-200 font-medium">
          {a.property}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (a) => <StatusBadge status={a.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172B45] dark:text-white">
            Platform Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Real-time metric summary across all registered properties and
            administrator accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/admins')}
          >
            Manage Admins
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/admin/properties')}
          >
            Add Property
          </Button>
        </div>
      </div>

      {/* 2. 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={mockProperties.length}
          subtext={`${activePropertiesCount} active, ${
            mockProperties.length - activePropertiesCount
          } inactive`}
          icon={Building2}
          trend={{ value: '+12%', isPositive: true }}
        />
        <StatCard
          title="Active Properties"
          value={`${Math.round(
            (activePropertiesCount / mockProperties.length) * 100
          )}%`}
          subtext={`${activePropertiesCount} of ${mockProperties.length} operational`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Admins"
          value={mockAdmins.length}
          subtext={`${activeAdminsCount} active accounts`}
          icon={Users}
          trend={{ value: '+2 this month', isPositive: true }}
        />
        <StatCard
          title="Account Health"
          value={`${activeAdminsCount} Active`}
          subtext={`${
            mockAdmins.length - activeAdminsCount
          } inactive / suspended`}
          icon={ShieldAlert}
        />
      </div>

      {/* 3. Dual Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Properties Card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs flex flex-col justify-between dark:border-[#1F2E45] dark:bg-[#121824]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#172B45] dark:text-white">
                  Recent Properties
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Latest hostels onboarded to HostelOS
                </p>
              </div>
              <Link
                to="/admin/properties"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 dark:text-indigo-400"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <DataTable columns={propertyColumns} data={mockProperties} />
          </div>
        </div>

        {/* Right: Recent Property Administrators */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs flex flex-col justify-between dark:border-[#1F2E45] dark:bg-[#121824]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#172B45] dark:text-white">
                  Property Administrators
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Manager accounts and assigned locations
                </p>
              </div>
              <Link
                to="/admin/admins"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 dark:text-indigo-400"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <DataTable columns={adminColumns} data={mockAdmins} />
          </div>
        </div>
      </div>
    </div>
  );
}
