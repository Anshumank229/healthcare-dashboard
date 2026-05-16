import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';

export default function Patients() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    email: '',
    address: '',
    blood_group: '',
    allergies: '',
    medical_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  const { data: patients, isLoading } = useQuery({
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
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create patient');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(/patients/, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient updated successfully');
      setShowModal(false);
      setEditingPatient(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update patient');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(/patients/);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Patient deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete patient');
    }
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      phone: '',
      email: '',
      address: '',
      blood_group: '',
      allergies: '',
      medical_conditions: '',
      emergency_contact_name: '',
      emergency_contact_phone: ''
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
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      blood_group: patient.blood_group || '',
      allergies: patient.allergies || '',
      medical_conditions: patient.medical_conditions || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        <button
          onClick={() => {
            setEditingPatient(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaPlus size={16} />
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Blood Group</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients?.map((patient) => (
                <tr key={patient.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{patient.first_name} {patient.last_name}</td>
                  <td className="px-4 py-3">{patient.phone}</td>
                  <td className="px-4 py-3">{patient.email}</td>
                  <td className="px-4 py-3">{patient.blood_group || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(patient)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <FaEdit size={16} />
                    </button>
                    <button onClick={() => handleDelete(patient.id)} className="text-red-600 hover:text-red-800">
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingPatient ? 'Edit Patient' : 'Add Patient'}</h2>
              <button onClick={() => { setShowModal(false); setEditingPatient(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-lg" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" className="w-full px-3 py-2 border rounded-lg" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border rounded-lg" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="O+ / A- / B+" value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
