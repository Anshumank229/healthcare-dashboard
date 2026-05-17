import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FaPlus, FaCalendarAlt, FaTimes, FaClock, FaUser } from 'react-icons/fa';
import { ContentCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/Badge';
import SearchFilter from '../components/ui/SearchFilter';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/Skeleton';
import useDebounce from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 10;

export default function Appointments() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery);

  const [formData, setFormData] = useState({
    patient_id: '', doctor_id: '', appointment_date: '',
    duration_minutes: 30, reason: '', notes: ''
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await api.get('/patients/');
      return response.data;
    }
  });

  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments/');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/appointments/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment booked successfully');
      setShowModal(false);
      resetForm();
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Failed to book appointment')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/appointments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment updated successfully');
      setShowModal(false);
      setEditingAppointment(null);
      resetForm();
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Failed to update appointment')
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment cancelled');
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Failed to cancel appointment')
  });

  const resetForm = () => {
    setFormData({
      patient_id: '', doctor_id: '', appointment_date: '',
      duration_minutes: 30, reason: '', notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Get patient name helper
  const getPatientName = (patientId) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient #${patientId}`;
  };

  // Filter + paginate
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    let filtered = appointments;
    if (statusFilter) {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(a =>
        String(a.id).includes(q) ||
        (a.reason || '').toLowerCase().includes(q) ||
        getPatientName(a.patient_id).toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [appointments, statusFilter, debouncedSearch, patients]);

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useMemo(() => setCurrentPage(1), [debouncedSearch, statusFilter]);

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Appointments</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
            Schedule and manage appointments • {appointments?.length || 0} total
          </p>
        </div>
        <Button
          icon={FaPlus}
          onClick={() => { setEditingAppointment(null); resetForm(); setShowModal(true); }}
        >
          Book Appointment
        </Button>
      </div>

      {/* Search + Filter */}
      <SearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by ID, patient, or reason..."
        filters={[{
          key: 'status',
          value: statusFilter,
          onChange: setStatusFilter,
          placeholder: 'All Statuses',
          options: statusOptions,
        }]}
      />

      {/* Table */}
      <ContentCard noPadding>
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={6} cols={6} /></div>
        ) : isError ? (
          <EmptyState title="Failed to load appointments" description="Please try again" action={refetch} actionLabel="Retry" />
        ) : paginatedAppointments.length === 0 ? (
          <EmptyState
            icon={FaCalendarAlt}
            title={debouncedSearch || statusFilter ? 'No appointments found' : 'No appointments yet'}
            description={debouncedSearch || statusFilter ? 'Try different filters' : 'Book your first appointment'}
            action={!debouncedSearch && !statusFilter ? () => { resetForm(); setShowModal(true); } : undefined}
            actionLabel="Book Appointment"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-700">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Date & Time</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden lg:table-cell">Reason</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-surface-50 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 px-2 py-0.5 rounded">#{apt.id}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-healthcare-50 dark:bg-healthcare-900/30 flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-healthcare-600 dark:text-healthcare-400" size={12} />
                          </div>
                          <div>
                            <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">{getPatientName(apt.patient_id)}</p>
                            <p className="text-xs text-surface-400">Doctor #{apt.doctor_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div>
                          <p className="text-surface-800 dark:text-surface-200 text-sm">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                          <p className="text-xs text-surface-400 flex items-center gap-1">
                            <FaClock size={10} />
                            {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <p className="text-surface-600 dark:text-surface-400 truncate max-w-[200px]">{apt.reason || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={FaTimes}
                            onClick={() => cancelMutation.mutate(apt.id)}
                            loading={cancelMutation.isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-surface-100 dark:border-surface-700">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAppointments.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </ContentCard>

      {/* Book/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingAppointment(null); }}
        title={editingAppointment ? 'Edit Appointment' : 'Book Appointment'}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingAppointment(null); }}>Cancel</Button>
            <Button
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit}
            >
              {editingAppointment ? 'Update' : 'Book Appointment'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Patient</label>
            <select
              required
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-800
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200
                dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100"
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
            >
              <option value="">Select Patient</option>
              {patients?.map((p) => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Doctor ID"
            type="number"
            required
            value={formData.doctor_id}
            onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
            placeholder="Enter doctor ID (e.g., 1, 2, 3)"
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            required
            value={formData.appointment_date}
            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
          />
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Reason</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-800 placeholder:text-surface-400
                focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200
                dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100 dark:placeholder:text-surface-500"
              rows="2"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Reason for visit"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
