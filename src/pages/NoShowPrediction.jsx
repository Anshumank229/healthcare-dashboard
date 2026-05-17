import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FaRobot, FaBrain, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { ContentCard, StatCard } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useTheme } from '../contexts/ThemeContext';

export default function NoShowPrediction() {
  const { isDark } = useTheme();
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments/');
      return res.data;
    }
  });

  const upcomingAppointments = appointments?.filter(
    a => new Date(a.appointment_date) > new Date() && a.status !== 'cancelled' && a.status !== 'completed'
  ) || [];

  const predictNoShow = async () => {
    if (!selectedAppointment) return;
    setPredicting(true);
    try {
      const response = await api.post('/ml/predict-no-show', { appointment_id: parseInt(selectedAppointment) });
      setPredictionResult(response.data);
      setPredictionHistory(prev => [response.data, ...prev].slice(0, 10));
    } catch (error) {
      console.error(error);
    } finally {
      setPredicting(false);
    }
  };

  const getRiskColor = (probability) => {
    if (probability < 30) return 'text-emerald-500';
    if (probability < 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskGradient = (probability) => {
    if (probability < 30) return 'from-emerald-500 to-emerald-600';
    if (probability < 60) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
          <FaBrain className="text-primary-600" /> AI No-Show Predictions
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          ML-powered appointment no-show risk analysis
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Upcoming Appointments" value={upcomingAppointments.length} icon={FaChartLine} accentColor="teal" />
        <StatCard title="Predictions Made" value={predictionHistory.length} icon={FaRobot} accentColor="purple" />
        <StatCard
          title="Avg Risk Level"
          value={predictionHistory.length > 0
            ? `${Math.round(predictionHistory.reduce((s, p) => s + p.no_show_probability, 0) / predictionHistory.length)}%`
            : '—'}
          icon={FaExclamationTriangle}
          accentColor="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Form */}
        <ContentCard title="Run Prediction" className="h-fit">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Select Appointment
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-800
                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200
                  dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100"
                value={selectedAppointment}
                onChange={(e) => setSelectedAppointment(e.target.value)}
              >
                <option value="">Choose an upcoming appointment...</option>
                {upcomingAppointments.map(apt => (
                  <option key={apt.id} value={apt.id}>
                    Appointment #{apt.id} — {new Date(apt.appointment_date).toLocaleDateString()} {apt.reason ? `(${apt.reason})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <Button
              icon={FaRobot}
              loading={predicting}
              disabled={!selectedAppointment}
              onClick={predictNoShow}
              className="w-full"
            >
              Predict No-Show Risk
            </Button>

            {/* Result Display */}
            {predictionResult && (
              <div className="mt-6 animate-fade-in">
                <div className="text-center py-6 px-4 rounded-2xl bg-surface-50 dark:bg-surface-700/30">
                  {/* Gauge */}
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke={isDark ? '#334155' : '#e2e8f0'} strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke={predictionResult.no_show_probability < 30 ? '#10b981' : predictionResult.no_show_probability < 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${predictionResult.no_show_probability * 3.14} ${314 - predictionResult.no_show_probability * 3.14}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-3xl font-bold ${getRiskColor(predictionResult.no_show_probability)}`}>
                        {predictionResult.no_show_probability}%
                      </span>
                      <span className="text-xs text-surface-500 dark:text-surface-400">risk</span>
                    </div>
                  </div>

                  <RiskBadge risk={predictionResult.risk_level} />
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 max-w-xs mx-auto">
                    {predictionResult.recommendation}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-surface-100 dark:border-surface-700">
                    <span className="text-surface-500 dark:text-surface-400">Patient</span>
                    <span className="font-medium text-surface-800 dark:text-surface-200">{predictionResult.patient_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-surface-100 dark:border-surface-700">
                    <span className="text-surface-500 dark:text-surface-400">Appointment ID</span>
                    <span className="font-medium text-surface-800 dark:text-surface-200">#{predictionResult.appointment_id}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ContentCard>

        {/* Prediction History */}
        <ContentCard title="Prediction History">
          {predictionHistory.length === 0 ? (
            <EmptyState
              icon={FaRobot}
              title="No predictions yet"
              description="Select an appointment and run a prediction to see results here"
            />
          ) : (
            <div className="space-y-3">
              {predictionHistory.map((pred, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-700/30 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRiskGradient(pred.no_show_probability)} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{pred.no_show_probability}%</span>
                    </div>
                    <div>
                      <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">{pred.patient_name}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">Appointment #{pred.appointment_id}</p>
                    </div>
                  </div>
                  <RiskBadge risk={pred.risk_level} />
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>
    </div>
  );
}
