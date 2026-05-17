import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaUsers, FaUser, FaPhone, FaEnvelope, FaTint } from 'react-icons/fa';
import { ContentCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import SearchFilter from '../components/ui/SearchFilter';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/Skeleton';
import useDebounce from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 10;

export default function Patients() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', date_of_birth: '', phone: '',
    email: '', address: '', blood_group: '', allergies: '',
    medical_conditions: '', emergency_contact_name: '', emergency_contact_phone: ''
  });

  const { data: patients, isLoading, isError, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await api.get('/patients/');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/patients/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient created successfully');
      setShowModal(false);
      resetForm();
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Failed to create patient')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/patients/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient updated successfully');
      setShowModal(false);
      setEditingPatient(null);
      resetForm();
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Failed to update patient')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient deleted successfully');
      setShowDeleteModal(false);
      setDeletingId(null);
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Failed to delete patient')
  });

  const resetForm = () => {
    setFormData({
      first_name: '', last_name: '', date_of_birth: '', phone: '',
      email: '', address: '', blood_group: '', allergies: '',
      medical_conditions: '', emergency_contact_name: '', emergency_contact_phone: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      first_name: patient.first_name || '', last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth || '', phone: patient.phone || '',
      email: patient.email || '', address: patient.address || '',
      blood_group: patient.blood_group || '', allergies: patient.allergies || '',
      medical_conditions: patient.medical_conditions || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  // Filtered + paginated
  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    if (!debouncedSearch) return patients;
    const q = debouncedSearch.toLowerCase();
    return patients.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      (p.phone || '').includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  }, [patients, debouncedSearch]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page on search
  useMemo(() => setCurrentPage(1), [debouncedSearch]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Patients</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
            Manage your patient records • {patients?.length || 0} total
          </p>
        </div>
        <Button icon={FaPlus} onClick={() => { setEditingPatient(null); resetForm(); setShowModal(true); }}>
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <SearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by name, phone, or email..."
      />

      {/* Table */}
      <ContentCard noPadding>
        {isLoading ? (
          <div className="p-4"><SkeletonTable rows={6} cols={5} /></div>
        ) : isError ? (
          <EmptyState title="Failed to load patients" description="Please try again" action={refetch} actionLabel="Retry" />
        ) : paginatedPatients.length === 0 ? (
          <EmptyState
            icon={FaUsers}
            title={debouncedSearch ? 'No patients found' : 'No patients yet'}
            description={debouncedSearch ? 'Try a different search term' : 'Add your first patient to get started'}
            action={debouncedSearch ? undefined : () => { resetForm(); setShowModal(true); }}
            actionLabel="Add Patient"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-700">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Phone</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden lg:table-cell">Blood Group</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-surface-50 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 dark:text-primary-400 text-sm font-semibold">
                              {(patient.first_name || '?')[0]}{(patient.last_name || '?')[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-surface-800 dark:text-surface-200">{patient.first_name} {patient.last_name}</p>
                            {patient.date_of_birth && (
                              <p className="text-xs text-surface-400">DOB: {patient.date_of_birth}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-surface-600 dark:text-surface-400">{patient.phone || '—'}</td>
                      <td className="px-5 py-3.5 text-surface-600 dark:text-surface-400 hidden md:table-cell">{patient.email || '—'}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {patient.blood_group ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            <FaTint size={10} /> {patient.blood_group}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(patient)} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors">
                            <FaEdit size={14} />
                          </button>
                          <button onClick={() => handleDeleteClick(patient.id)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                            <FaTrash size={14} />
                          </button>
                        </div>
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
                totalItems={filteredPatients.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </ContentCard>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingPatient(null); }}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingPatient(null); }}>Cancel</Button>
            <Button
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit}
            >
              {editingPatient ? 'Update Patient' : 'Create Patient'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} id="patient-form" className="space-y-5">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2">
              <FaUser size={12} className="text-primary-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} placeholder="John" />
              <Input label="Last Name" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} placeholder="Doe" />
              <Input label="Date of Birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
              <Input label="Blood Group" value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })} placeholder="O+, A-, B+..." />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2">
              <FaPhone size={12} className="text-primary-500" /> Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 9876543210" />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="patient@email.com" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Address</label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-800 placeholder:text-surface-400
                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200
                  dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100 dark:placeholder:text-surface-500"
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
          </div>

          {/* Medical Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2">
              <FaTint size={12} className="text-primary-500" /> Medical Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Allergies" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="e.g., Penicillin" />
              <Input label="Medical Conditions" value={formData.medical_conditions} onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })} placeholder="e.g., Diabetes" />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2">
              <FaPhone size={12} className="text-red-500" /> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Emergency Contact Name" value={formData.emergency_contact_name} onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })} placeholder="Jane Doe" />
              <Input label="Emergency Contact Phone" type="tel" value={formData.emergency_contact_phone} onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })} placeholder="+91 9876543210" />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingId(null); }}
        title="Delete Patient"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}>Cancel</Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deletingId)}>
              Delete Patient
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 mx-auto mb-3 flex items-center justify-center">
            <FaTrash className="text-red-500" size={20} />
          </div>
          <p className="text-surface-700 dark:text-surface-300">Are you sure you want to delete this patient?</p>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
}
