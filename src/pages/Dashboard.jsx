import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FaUsers, FaCalendarCheck, FaExclamationTriangle, FaPhoneAlt, FaChartLine, FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import api from '../services/api';
import AppointmentCalendar from '../components/Calendar/AppointmentCalendar';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={"p-3 rounded-full " + color}>
        <Icon className="text-white" size={20} />
      </div>
    </div>
  </div>
);

const RiskBadge = ({ risk }) => {
  let colorClass = "bg-gray-100 text-gray-700";
  if (risk === "Low") colorClass = "bg-green-100 text-green-700";
  if (risk === "Medium") colorClass = "bg-yellow-100 text-yellow-700";
  if (risk === "High") colorClass = "bg-red-100 text-red-700";
  return <span className={"px-2 py-1 rounded-full text-xs font-medium " + colorClass}>{risk}</span>;
};

export default function Dashboard() {
  const [view, setView] = useState('dashboard');
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await api.get('/patients/');
      return res.data;
    }
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments/');
      return res.data;
    }
  });

  const predictNoShow = async (appointmentId) => {
    setPredicting(true);
    try {
      const response = await api.post('/ml/predict-no-show', { appointment_id: appointmentId });
      setPredictionResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setPredicting(false);
    }
  };

  const stats = {
    totalPatients: patients?.length || 0,
    totalAppointments: appointments?.length || 0,
    upcomingAppointments: appointments?.filter(a => new Date(a.appointment_date) > new Date()).length || 0,
  };

  const today = new Date().toDateString();
  const todayAppointments = appointments?.filter(a => new Date(a.appointment_date).toDateString() === today) || [];

  if (view === 'calendar') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Appointments Calendar</h1>
          <button
            onClick={() => setView('dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
        <AppointmentCalendar />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={() => setView('calendar')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaCalendarAlt size={16} />
          Calendar View
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={FaUsers} color="bg-blue-500" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={FaCalendarCheck} color="bg-green-500" />
        <StatCard title="Upcoming" value={stats.upcomingAppointments} icon={FaChartLine} color="bg-yellow-500" />
        <StatCard title="WhatsApp Active" value="24/7" icon={FaPhoneAlt} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Today's Appointments</h2>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No appointments today</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Appointment #{apt.id}</p>
                    <p className="text-sm text-gray-500">{new Date(apt.appointment_date).toLocaleTimeString()}</p>
                  </div>
                  <button onClick={() => predictNoShow(apt.id)} disabled={predicting} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {predicting ? <FaSpinner className="animate-spin" /> : 'Predict No-Show'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prediction Result */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">No-Show Risk Analysis</h2>
          {predictionResult ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{predictionResult.no_show_probability}%</div>
                <RiskBadge risk={predictionResult.risk_level} />
                <p className="text-gray-600 mt-2">{predictionResult.recommendation}</p>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-500"><strong>Patient:</strong> {predictionResult.patient_name}</p>
                <p className="text-sm text-gray-500 mt-1"><strong>Appointment ID:</strong> {predictionResult.appointment_id}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaExclamationTriangle className="mx-auto text-4xl mb-3 text-gray-300" />
              <p>Click "Predict No-Show" on any appointment</p>
              <p className="text-sm mt-2">to see AI-powered risk analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.slice(0, 10).map((apt) => {
                let statusClass = "bg-gray-100 text-gray-700";
                if (apt.status === "scheduled") statusClass = "bg-yellow-100 text-yellow-700";
                if (apt.status === "confirmed") statusClass = "bg-green-100 text-green-700";
                return (
                  <tr key={apt.id} className="border-t">
                    <td className="px-4 py-2">{apt.id}</td>
                    <td className="px-4 py-2">{new Date(apt.appointment_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span className={"px-2 py-1 rounded-full text-xs " + statusClass}>{apt.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => predictNoShow(apt.id)} className="text-blue-600 hover:text-blue-700 text-sm">
                        Analyze Risk
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
