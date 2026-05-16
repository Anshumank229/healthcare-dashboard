import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

export default function Appointments() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    duration_minutes: 30,
    reason: '',
    notes: ''
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await api.get('/patients/');
      return response.data;
    }
  });

  const { data: appointments, isLoading } = useQuery({
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
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to book appointment');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(/appointments/, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment updated successfully');
      setShowModal(false);
      setEditingAppointment(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update appointment');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(/appointments/);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment cancelled');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel appointment');
    }
  });

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      duration_minutes: 30,
      reason: '',
      notes: ''
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

  const getStatusBadge = (status) => {
    const colors = {
      scheduled: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-gray-100 text-gray-700',
      no_show: 'bg-orange-100 text-orange-700'
    };
    return <span className={px-2 py-1 rounded-full text-xs font-medium }>{status}</span>;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <button
          onClick={() => {
            setEditingAppointment(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaPlus size={16} />
          Book Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Patient</th>
                <th className="px-4 py-3 text-left">Doctor</th>
                <th className="px-4 py-3 text-left">Date & Time</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.map((apt) => (
                <tr key={apt.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{apt.id}</td>
                  <td className="px-4 py-3">Patient #{apt.patient_id}</td>
                  <td className="px-4 py-3">Doctor #{apt.doctor_id}</td>
                  <td className="px-4 py-3">{new Date(apt.appointment_date).toLocaleString()}</td>
                  <td className="px-4 py-3">{getStatusBadge(apt.status)}</td>
                  <td className="px-4 py-3">{apt.reason || '-'}</td>
                  <td className="px-4 py-3">
                    {apt.status !== 'cancelled' && (
                      <>
                        <button onClick={() => cancelMutation.mutate(apt.id)} className="text-red-600 hover:text-red-800 mr-3">
                          <FaTimes size={16} />
                        </button>
                      </>
                    )}
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingAppointment ? 'Edit Appointment' : 'Book Appointment'}</h2>
              <button onClick={() => { setShowModal(false); setEditingAppointment(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select required className="w-full px-3 py-2 border rounded-lg" value={formData.patient_id} onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}>
                  <option value="">Select Patient</option>
                  {patients?.map((p) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
                <input type="number" required className="w-full px-3 py-2 border rounded-lg" value={formData.doctor_id} onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })} placeholder="Enter doctor ID (e.g., 1, 2, 3)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input type="datetime-local" required className="w-full px-3 py-2 border rounded-lg" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows="2" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowModal(false); setEditingAppointment(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
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
