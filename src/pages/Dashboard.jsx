import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import {
  FaUsers, FaCalendarCheck, FaChartLine, FaPhoneAlt, FaClock,
  FaArrowRight, FaRobot, FaCalendarAlt, FaUserPlus, FaBell
} from 'react-icons/fa';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatCard, ContentCard } from '../components/ui/Card';
import { StatusBadge, RiskBadge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [predicting, setPredicting] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await api.get('/patients/');
      return res.data;
    }
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments/');
      return res.data;
    }
  });

  const isLoading = patientsLoading || appointmentsLoading;

  const predictNoShow = async (appointmentId) => {
    setPredicting(appointmentId);
    try {
      const response = await api.post('/ml/predict-no-show', { appointment_id: appointmentId });
      setPredictionResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setPredicting(null);
    }
  };

  // Computed stats
  const stats = useMemo(() => {
    const totalPatients = patients?.length || 0;
    const totalAppointments = appointments?.length || 0;
    const upcoming = appointments?.filter(a => new Date(a.appointment_date) > new Date()).length || 0;
    const today = new Date().toDateString();
    const todayCount = appointments?.filter(a => new Date(a.appointment_date).toDateString() === today).length || 0;
    return { totalPatients, totalAppointments, upcoming, todayCount };
  }, [patients, appointments]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    return appointments?.filter(a => new Date(a.appointment_date).toDateString() === today) || [];
  }, [appointments]);

  // Chart data: appointments by day of week
  const weeklyData = useMemo(() => {
    if (!appointments) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    appointments.forEach(a => {
      const day = new Date(a.appointment_date).getDay();
      if (!isNaN(day)) counts[day]++;
    });
    return days.map((name, i) => ({ name, appointments: counts[i] }));
  }, [appointments]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    if (!appointments) return [];
    const statusCounts = {};
    appointments.forEach(a => {
      const s = a.status || 'scheduled';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  const PIE_COLORS = ['#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#6b7280', '#8b5cf6'];

  // Recent activity
  const recentActivity = useMemo(() => {
    if (!appointments) return [];
    return [...appointments]
      .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
      .slice(0, 5)
      .map(a => ({
        id: a.id,
        title: `Appointment #${a.id}`,
        status: a.status,
        time: new Date(a.appointment_date).toLocaleString(),
        type: a.status === 'cancelled' ? 'danger' : a.status === 'confirmed' ? 'success' : 'info',
      }));
  }, [appointments]);

  const tooltipStyle = {
    contentStyle: {
      background: isDark ? '#1e293b' : '#fff',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Here's what's happening with your practice today.</p>
        </div>
        <div className="flex gap-2">
          <Button icon={FaCalendarAlt} variant="secondary" size="sm" onClick={() => navigate('/calendar')}>
            Calendar
          </Button>
          <Button icon={FaUserPlus} size="sm" onClick={() => navigate('/patients')}>
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={FaUsers} accentColor="teal" trend={12} trendLabel="this month" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={FaCalendarCheck} accentColor="blue" trend={8} trendLabel="this week" />
        <StatCard title="Upcoming" value={stats.upcoming} icon={FaClock} accentColor="amber" />
        <StatCard title="Today" value={stats.todayCount} icon={FaCalendarAlt} accentColor="emerald" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Bar Chart */}
        <ContentCard title="Weekly Overview" className="lg:col-span-2">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="appointments" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data yet" description="Appointments will appear here" />
          )}
        </ContentCard>

        {/* Status Pie */}
        <ContentCard title="Status Distribution">
          {statusData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusData.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-surface-400">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="capitalize">{s.name}</span>
                    <span className="font-medium text-surface-800 dark:text-surface-200">({s.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No data" />
          )}
        </ContentCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Appointments */}
        <ContentCard
          title="Today's Appointments"
          action={
            <Button variant="ghost" size="sm" iconRight={FaArrowRight} onClick={() => navigate('/appointments')}>
              View All
            </Button>
          }
        >
          {todayAppointments.length === 0 ? (
            <EmptyState
              icon={FaCalendarCheck}
              title="No appointments today"
              description="Your schedule is clear for today."
            />
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-50 dark:bg-surface-700/30 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <FaCalendarCheck className="text-primary-600 dark:text-primary-400" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">Appointment #{apt.id}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FaRobot}
                      onClick={() => predictNoShow(apt.id)}
                      loading={predicting === apt.id}
                    >
                      Predict
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        {/* Prediction Result + Activity Timeline */}
        <div className="space-y-4">
          {/* Prediction Result */}
          <ContentCard title="AI Risk Analysis" className={predictionResult ? '' : ''}>
            {predictionResult ? (
              <div className="text-center space-y-4">
                <div>
                  <p className="text-5xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                    {predictionResult.no_show_probability}%
                  </p>
                  <RiskBadge risk={predictionResult.risk_level} />
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-3">{predictionResult.recommendation}</p>
                </div>
                <div className="border-t border-surface-100 dark:border-surface-700 pt-4 text-left space-y-1">
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    <span className="font-medium text-surface-700 dark:text-surface-300">Patient:</span> {predictionResult.patient_name}
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    <span className="font-medium text-surface-700 dark:text-surface-300">Appointment:</span> #{predictionResult.appointment_id}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FaRobot}
                title="No prediction yet"
                description="Click 'Predict' on any appointment to see AI-powered risk analysis"
              />
            )}
          </ContentCard>

          {/* Recent Activity */}
          <ContentCard title="Recent Activity">
            {recentActivity.length === 0 ? (
              <EmptyState title="No recent activity" />
            ) : (
              <div className="space-y-3">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 relative">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        act.type === 'success' ? 'bg-emerald-500' :
                        act.type === 'danger' ? 'bg-red-500' : 'bg-healthcare-500'
                      }`} />
                      {i < recentActivity.length - 1 && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-8 bg-surface-200 dark:bg-surface-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{act.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={act.status} />
                        <span className="text-xs text-surface-400">{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
