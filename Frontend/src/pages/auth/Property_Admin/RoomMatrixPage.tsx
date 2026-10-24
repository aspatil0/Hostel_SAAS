import { useState, useEffect } from 'react';
import {
  BedDouble,
  User,
  CheckCircle,
  Plus,
  AlertTriangle,
  Building,
  Users,
  Search,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { initialStudents } from '@/data/mockData';
import { propertyPortalService, type RoomNode, type BedSlot } from '@/services/propertyPortalService';
import type { Student } from '@/types/property';

const mockRoomsData: RoomNode[] = [
  {
    roomNumber: '101',
    floor: 1,
    wing: 'East',
    type: 'Double Sharing AC',
    price: 12500,
    beds: [
      {
        bedId: '101-A',
        bedName: 'Bed A',
        status: 'occupied',
        student: {
          name: 'Aarav Mehta',
          phone: '+91 98111 22334',
          college: 'IIT Bombay (CSE)',
          checkInDate: '2026-07-15',
          rent: 12500,
        },
      },
      {
        bedId: '101-B',
        bedName: 'Bed B',
        status: 'occupied',
        student: {
          name: 'Rohan Deshmukh',
          phone: '+91 98222 33445',
          college: 'SPIT Andheri (IT)',
          checkInDate: '2026-08-01',
          rent: 12500,
        },
      },
    ],
  },
  {
    roomNumber: '102',
    floor: 1,
    wing: 'East',
    type: 'Double Sharing Non-AC',
    price: 10500,
    beds: [
      {
        bedId: '102-A',
        bedName: 'Bed A',
        status: 'occupied',
        student: {
          name: 'Vikram Singhania',
          phone: '+91 98333 44556',
          college: 'TCS Powai',
          checkInDate: '2026-08-15',
          rent: 10500,
        },
      },
      {
        bedId: '102-B',
        bedName: 'Bed B',
        status: 'vacant',
      },
    ],
  },
];

export function RoomMatrixPage() {
  const [rooms, setRooms] = useState<RoomNode[]>(mockRoomsData);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedBedForAllocation, setSelectedBedForAllocation] = useState<{
    roomNumber: string;
    bed: BedSlot;
  } | null>(null);

  const [activeBedDetail, setActiveBedDetail] = useState<{
    roomNumber: string;
    bed: BedSlot;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadRooms() {
      try {
        const liveRooms = await propertyPortalService.getRooms();
        if (isMounted && liveRooms && liveRooms.length > 0) {
          setRooms(liveRooms);
        }
      } catch (err) {
        console.warn('Rooms API offline:', err);
      }
    }
    loadRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  // New allocation form inside spacious modal
  const [allocationForm, setAllocationForm] = useState({
    studentName: '',
    phone: '',
    college: '',
    guardianName: '',
    guardianPhone: '',
    rent: 12500,
  });

  // Calculate live count of bedrooms & beds taken by students / PG guests
  const allBeds = rooms.flatMap((r) => r.beds);
  const totalBedsCount = allBeds.length;
  const occupiedBedsCount = allBeds.filter((b) => b.status === 'occupied').length;
  const vacantBedsCount = allBeds.filter((b) => b.status === 'vacant').length;
  const maintenanceCount = allBeds.filter((b) => b.status === 'maintenance').length;
  
  // Total bedroom count & fully occupied rooms
  const totalRoomsCount = rooms.length;
  const fullyOccupiedRoomsCount = rooms.filter((r) =>
    r.beds.every((b) => b.status === 'occupied')
  ).length;

  const filteredRooms = rooms.filter(
    (r) => selectedFloor === 'all' || r.floor === selectedFloor
  );

  const handleConfirmAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedForAllocation || !allocationForm.studentName) return;

    try {
      await propertyPortalService.allocateRoom({
        roomNumber: selectedBedForAllocation.roomNumber,
        bedId: selectedBedForAllocation.bed.bedId,
        status: 'occupied',
        student: {
          name: allocationForm.studentName,
          phone: allocationForm.phone,
          college: allocationForm.college || 'Verified Resident',
          checkInDate: new Date().toISOString().split('T')[0],
          rent: Number(allocationForm.rent),
        },
      });
    } catch {
      // offline fallback
    }

    setRooms(
      rooms.map((room) => {
        if (room.roomNumber !== selectedBedForAllocation.roomNumber) return room;
        return {
          ...room,
          beds: room.beds.map((b) => {
            if (b.bedId !== selectedBedForAllocation.bed.bedId) return b;
            return {
              ...b,
              status: 'occupied',
              student: {
                name: allocationForm.studentName,
                phone: allocationForm.phone,
                college: allocationForm.college || 'Verified Resident',
                checkInDate: new Date().toISOString().split('T')[0],
                rent: Number(allocationForm.rent),
              },
            };
          }),
        };
      })
    );

    setSelectedBedForAllocation(null);
    setAllocationForm({
      studentName: '',
      phone: '',
      college: '',
      guardianName: '',
      guardianPhone: '',
      rent: 12500,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B45] dark:text-white">
            Live Room & Bed Allocation Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time visual map of bedrooms, individual bed occupancy by students & PG guests, and quick allocation.
          </p>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-800">
          {(['all', 1, 2, 3] as const).map((floor) => (
            <button
              key={floor}
              type="button"
              onClick={() => setSelectedFloor(floor)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                selectedFloor === floor
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {floor === 'all' ? 'All Floors' : `Floor ${floor}`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Live Count of Bedrooms & Beds Taken by Students / PG Guests */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Occupied Beds by Students / PG Guests */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Beds Taken / Occupied
            </span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
              {occupiedBedsCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              / {totalBedsCount} Total Beds
            </span>
          </div>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1">
            {Math.round((occupiedBedsCount / totalBedsCount) * 100)}% occupancy rate
          </p>
        </div>

        {/* Vacant Beds */}
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-xs dark:border-blue-950 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Vacant Available Beds
            </span>
            <BedDouble className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900 dark:text-blue-100">
              {vacantBedsCount}
            </span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Ready to allocate
            </span>
          </div>
          <p className="text-[11px] text-blue-700/80 dark:text-blue-400 mt-1">
            Available for immediate booking
          </p>
        </div>

        {/* Bedroom Units Count */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#121824]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Live Bedrooms
            </span>
            <Building className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172B45] dark:text-white">
              {totalRoomsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Rooms Configured
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {fullyOccupiedRoomsCount} rooms 100% full
          </p>
        </div>

        {/* Maintenance / Blocked */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-xs dark:border-amber-950 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Under Maintenance
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 dark:text-amber-100">
              {maintenanceCount}
            </span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Bed Blocked
            </span>
          </div>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-1">
            Room 301 paint maintenance
          </p>
        </div>
      </div>

      {/* 3. Visual Room & Bed Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const isFull = room.beds.every((b) => b.status === 'occupied');

          return (
            <div
              key={room.roomNumber}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-[#121824]"
            >
              {/* Room Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#172B45] dark:text-white">
                      Room {room.roomNumber}
                    </h3>
                    <span className="text-[10px] font-mono rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Floor {room.floor} • {room.wing} Wing
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {room.type} • ₹{room.price.toLocaleString('en-IN')}/mo
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isFull
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}
                >
                  {isFull ? '100% Full' : `${room.beds.filter((b) => b.status === 'vacant').length} Available`}
                </span>
              </div>

              {/* Beds Inside This Room */}
              <div className="mt-4 space-y-2.5">
                {room.beds.map((bed) => {
                  const isOccupied = bed.status === 'occupied';
                  const isVacant = bed.status === 'vacant';

                  return (
                    <div
                      key={bed.bedId}
                      className={`rounded-xl border p-3 transition flex items-center justify-between ${
                        isOccupied
                          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : isVacant
                          ? 'border-dashed border-slate-300 bg-slate-50/50 hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-slate-700 dark:bg-slate-800/30'
                          : 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                            isOccupied
                              ? 'bg-emerald-600 text-white'
                              : isVacant
                              ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          <BedDouble className="h-4 w-4" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#172B45] dark:text-white">
                              {bed.bedName}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                isOccupied
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : isVacant
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-amber-600'
                              }`}
                            >
                              {isOccupied ? 'Occupied' : isVacant ? 'Vacant Bed' : 'Maintenance'}
                            </span>
                          </div>

                          {isOccupied && bed.student ? (
                            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              {bed.student.name} ({bed.student.college})
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400">
                              {isVacant ? 'Ready for immediate student check-in' : 'Offline'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bed Action */}
                      {isOccupied ? (
                        <button
                          type="button"
                          onClick={() => setActiveBedDetail({ roomNumber: room.roomNumber, bed })}
                          className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          Info
                        </button>
                      ) : isVacant ? (
                        <button
                          type="button"
                          onClick={() => setSelectedBedForAllocation({ roomNumber: room.roomNumber, bed })}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Allocate
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Spacious Bed Allocation Form Modal (Wide Form Width as Requested) */}
      {selectedBedForAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-7 shadow-2xl dark:bg-[#121824] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#172B45] dark:text-white">
                    Allocate Room {selectedBedForAllocation.roomNumber} - {selectedBedForAllocation.bed.bedName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assign student or PG guest to this vacant bed and record admission parameters.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBedForAllocation(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAllocation} className="mt-5 space-y-4">
              <div className="rounded-xl bg-emerald-50/70 p-3.5 text-xs text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="font-bold">Allocating Room: </span>
                Room {selectedBedForAllocation.roomNumber} ({selectedBedForAllocation.bed.bedName})
                <span className="ml-3 font-semibold text-emerald-700">Instant bed lock will apply upon confirmation.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Resident Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={allocationForm.studentName}
                    onChange={(e) => setAllocationForm({ ...allocationForm, studentName: e.target.value })}
                    placeholder="e.g. Tanmay Sharma"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Resident Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={allocationForm.phone}
                    onChange={(e) => setAllocationForm({ ...allocationForm, phone: e.target.value })}
                    placeholder="+91 98111 22334"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    College / Corporate Office
                  </label>
                  <input
                    type="text"
                    value={allocationForm.college}
                    onChange={(e) => setAllocationForm({ ...allocationForm, college: e.target.value })}
                    placeholder="e.g. IIT Bombay / Google India"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Agreed Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={allocationForm.rent}
                    onChange={(e) => setAllocationForm({ ...allocationForm, rent: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Emergency Contact Person
                  </label>
                  <input
                    type="text"
                    value={allocationForm.guardianName}
                    onChange={(e) => setAllocationForm({ ...allocationForm, guardianName: e.target.value })}
                    placeholder="Parent / Guardian Name"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={allocationForm.guardianPhone}
                    onChange={(e) => setAllocationForm({ ...allocationForm, guardianPhone: e.target.value })}
                    placeholder="+91 98000 11223"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedBedForAllocation(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm Allocation & Assign Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Occupied Bed Info Modal */}
      {activeBedDetail && activeBedDetail.bed.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#121824]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-[#172B45] dark:text-white">
                  Room {activeBedDetail.roomNumber} - {activeBedDetail.bed.bedName}
                </h3>
                <span className="text-xs text-emerald-600 font-semibold">Active Bed Resident</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveBedDetail(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Resident Name:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{activeBedDetail.bed.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{activeBedDetail.bed.student.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">College / Workplace:</span>
                  <span className="font-medium">{activeBedDetail.bed.student.college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Check-In Date:</span>
                  <span>{activeBedDetail.bed.student.checkInDate}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Monthly Rent:</span>
                  <span className="font-bold text-emerald-600">₹{activeBedDetail.bed.student.rent.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveBedDetail(null)}
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
