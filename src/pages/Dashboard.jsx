import { useQuery } from '@tanstack/react-query';
import AppointmentCalendar from '../components/Calendar/AppointmentCalendar';
import { useState, useMemo, useCallback } from 'react';
import {
    FaUsers,
    FaCalendarCheck,
    FaExclamationTriangle,
    FaChartLine,
    FaCalendarAlt,
    FaArrowRight,
    FaCheckCircle,
    FaClock,
    FaUserInjured,
    FaChevronRight
} from 'react-icons/fa';
import api from '../services/api';

// ─── Constants ───────────────────────────────────────────────────────────────
const RISK_COLORS = {
    Low: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
    High: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' }
};

const STATUS_STYLES = {
    scheduled: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Scheduled' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    no_show: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'No Show' }
};

const STAT_CONFIG = [
    { key: 'totalPatients', title: 'Total Patients', icon: FaUsers, gradient: 'from-primary-500 to-primary-600' },
    { key: 'totalAppointments', title: 'Total Appointments', icon: FaCalendarCheck, gradient: 'from-green-500 to-green-600' },
    { key: 'upcomingAppointments', title: 'Upcoming', icon: FaChartLine, gradient: 'from-yellow-500 to-yellow-600' },
    { key: 'todayAppointments', title: "Today's", icon: FaClock, gradient: 'from-purple-500 to-purple-600' }
];

// ─── Reusable Components ─────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 sm:p-6 border border-gray-100 group cursor-default">
        <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{title}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 text-gray-800 group-hover:scale-105 transition-transform origin-left">
                    {value}
                </p>
            </div>
            <div className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform flex-shrink-0 ml-3`}>
                <Icon className="text-white" size={20} />
            </div>
        </div>
    </div>
);

const RiskBadge = ({ risk }) => {
    const style = RISK_COLORS[risk] || { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-500' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            <span className={`w-2 h-2 rounded-full ${style.bar}`} />
            {risk} Risk
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.scheduled;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {status === 'confirmed' && <FaCheckCircle size={10} />}
            {style.label}
        </span>
    );
};

const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="text-center py-8 sm:py-10 text-gray-400">
        <div className="bg-gray-50 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
            <Icon className="text-xl sm:text-2xl text-gray-300" />
        </div>
        <p className="font-medium text-gray-500 text-sm">{title}</p>
        <p className="text-xs sm:text-sm mt-1">{description}</p>
    </div>
);

const LoadingSpinner = ({ size = "md" }) => {
    const sizeClasses = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-8 h-8" };
    return (
        <div className={`${sizeClasses[size]} border-2 border-primary-600 border-t-transparent rounded-full animate-spin`} />
    );
};

const ErrorAlert = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
        <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-red-700 text-sm font-medium">Failed to load data</p>
            <p className="text-red-600 text-xs">{message}</p>
        </div>
        {onRetry && (
            <button onClick={onRetry} className="text-red-700 text-sm font-medium hover:underline flex-shrink-0">
                Retry
            </button>
        )}
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-24" />
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-16" />
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-2xl flex-shrink-0 ml-3" />
        </div>
    </div>
);

// ─── Main Dashboard Component ────────────────────────────────────────────────

export default function Dashboard() {
    const [view, setView] = useState('dashboard');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [predictingId, setPredictingId] = useState(null);
    const [predictionResult, setPredictionResult] = useState(null);
    const [predictionError, setPredictionError] = useState(null);
    const [activeTab, setActiveTab] = useState('today');

    // ─── Data Fetching ───────────────────────────────────────────────────────
    const {
        data: patients,
        isLoading: patientsLoading,
        error: patientsError,
        refetch: refetchPatients
    } = useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            const response = await api.get('/patients/');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    const {
        data: appointments,
        isLoading: appointmentsLoading,
        error: appointmentsError,
        refetch: refetchAppointments
    } = useQuery({
        queryKey: ['appointments'],
        queryFn: async () => {
            const response = await api.get('/appointments/');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    // ─── Memoized Computations ───────────────────────────────────────────────
    const stats = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        return {
            totalPatients: patients?.length || 0,
            totalAppointments: appointments?.length || 0,
            upcomingAppointments: appointments?.filter(a => new Date(a.appointment_date) > now).length || 0,
            todayAppointments: appointments?.filter(a => {
                const d = new Date(a.appointment_date);
                return d >= todayStart && d < todayEnd;
            }).length || 0
        };
    }, [patients, appointments]);

    const todayAppointmentsList = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        return (appointments || [])
            .filter(a => {
                const d = new Date(a.appointment_date);
                return d >= todayStart && d < todayEnd;
            })
            .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    }, [appointments]);

    const recentAppointments = useMemo(() => {
        return (appointments || [])
            .slice()
            .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
            .slice(0, 10);
    }, [appointments]);

    const isLoading = patientsLoading || appointmentsLoading;
    const hasError = patientsError || appointmentsError;

    // ─── Event Handlers ──────────────────────────────────────────────────────
    const predictNoShow = useCallback(async (appointmentId) => {
        setPredictingId(appointmentId);
        setPredictionError(null);
        setSelectedAppointment(appointmentId);

        try {
            const response = await api.post('/ml/predict-no-show', { appointment_id: appointmentId });
            setPredictionResult(response.data);
        } catch (error) {
            console.error('Prediction failed:', error);
            setPredictionError(
                error.response?.data?.detail ||
                error.message ||
                'Failed to analyze risk. Please try again.'
            );
        } finally {
            setPredictingId(null);
        }
    }, []);

    const formatTime = useCallback((dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }, []);

    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, []);

    // ─── Calendar View ───────────────────────────────────────────────────────
    if (view === 'calendar') {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Appointments Calendar</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and view all scheduled appointments</p>
                    </div>
                    <button
                        onClick={() => setView('dashboard')}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium shadow-sm flex items-center gap-2"
                    >
                        <FaArrowRight className="rotate-180" size={14} />
                        Back to Dashboard
                    </button>
                </div>
                <AppointmentCalendar />
            </div>
        );
    }

    // ─── Dashboard View ──────────────────────────────────────────────────────
    return (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">Dashboard</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => setView('calendar')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-200 transition-all text-sm font-medium flex items-center gap-2 flex-shrink-0"
                >
                    <FaCalendarAlt size={16} />
                    Calendar View
                </button>
            </div>

            {/* Error State */}
            {hasError && (
                <ErrorAlert
                    message="Unable to load dashboard data. Please check your connection."
                    onRetry={() => {
                        refetchPatients();
                        refetchAppointments();
                    }}
                />
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : STAT_CONFIG.map((stat) => (
                        <StatCard
                            key={stat.key}
                            title={stat.title}
                            value={stats[stat.key]}
                            icon={stat.icon}
                            gradient={stat.gradient}
                        />
                    ))
                }
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Appointments Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                                activeTab === 'today'
                                    ? 'text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Today's Appointments
                            {todayAppointmentsList.length > 0 && (
                                <span className="ml-2 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                                    {todayAppointmentsList.length}
                                </span>
                            )}
                            {activeTab === 'today' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('recent')}
                            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                                activeTab === 'recent'
                                    ? 'text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Recent Appointments
                            {activeTab === 'recent' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                            )}
                        </button>
                    </div>

                    <div className="p-4 sm:p-6">
                        {activeTab === 'today' ? (
                            todayAppointmentsList.length === 0 ? (
                                <EmptyState
                                    icon={FaCalendarAlt}
                                    title="No appointments today"
                                    description="You're all caught up for today!"
                                />
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    {todayAppointmentsList.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                        >
                                            {/* Time */}
                                            <div className="flex-shrink-0 w-14 sm:w-16 text-left sm:text-center">
                                                <p className="text-base sm:text-lg font-bold text-gray-800">
                                                    {formatTime(apt.appointment_date).split(' ')[0]}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatTime(apt.appointment_date).split(' ')[1]}
                                                </p>
                                            </div>

                                            {/* Divider - hidden on mobile */}
                                            <div className="hidden sm:block w-px h-10 bg-gray-200 flex-shrink-0" />

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                                        {apt.patient_name || `Patient #${apt.patient_id}`}
                                                    </p>
                                                    <StatusBadge status={apt.status} />
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                                    {apt.reason || 'General Checkup'} • Dr. {apt.doctor_name || 'TBD'}
                                                </p>
                                            </div>

                                            {/* Action */}
                                            <button
                                                onClick={() => predictNoShow(apt.id)}
                                                disabled={predictingId === apt.id}
                                                className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                            >
                                                {predictingId === apt.id ? (
                                                    <>
                                                        <LoadingSpinner size="sm" />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaChartLine size={12} />
                                                        Predict
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="overflow-x-auto -mx-2">
                                <table className="w-full text-sm min-w-[500px]">
                                    <thead>
                                    <tr className="text-left text-gray-500 border-b border-gray-100">
                                        <th className="pb-3 font-medium px-2">Patient</th>
                                        <th className="pb-3 font-medium px-2">Date</th>
                                        <th className="pb-3 font-medium px-2">Status</th>
                                        <th className="pb-3 font-medium text-right px-2">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {recentAppointments.map((apt) => (
                                        <tr key={apt.id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                        <FaUserInjured className="text-primary-600 text-xs" />
                                                    </div>
                                                    <span className="font-medium text-gray-800 text-sm truncate">
                                                            {apt.patient_name || `Patient #${apt.patient_id}`}
                                                        </span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-gray-600 text-sm px-2 whitespace-nowrap">
                                                {formatDate(apt.appointment_date)}
                                            </td>
                                            <td className="py-3 px-2">
                                                <StatusBadge status={apt.status} />
                                            </td>
                                            <td className="py-3 text-right px-2">
                                                <button
                                                    onClick={() => predictNoShow(apt.id)}
                                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                                                >
                                                    Analyze
                                                    <FaChevronRight size={10} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Prediction Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-base sm:text-lg">
                            <FaChartLine className="text-primary-600" />
                            No-Show Risk Analysis
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                            AI-powered prediction model to identify potential no-shows
                        </p>
                    </div>

                    <div className="p-4 sm:p-6">
                        {predictionError ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
                                <FaExclamationTriangle className="mx-auto text-2xl sm:text-3xl text-red-400 mb-3" />
                                <p className="text-red-700 font-medium text-sm">Analysis Failed</p>
                                <p className="text-red-600 text-xs sm:text-sm mt-1">{predictionError}</p>
                                <button
                                    onClick={() => setPredictionError(null)}
                                    className="mt-4 text-red-700 text-sm font-medium hover:underline"
                                >
                                    Dismiss
                                </button>
                            </div>
                        ) : predictionResult ? (
                            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                                {/* Probability Gauge */}
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="transform -rotate-90 w-28 h-28 sm:w-40 sm:h-40">
                                            <circle
                                                cx="56"
                                                cy="56"
                                                r="48"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="transparent"
                                                className="text-gray-100"
                                            />
                                            <circle
                                                cx="56"
                                                cy="56"
                                                r="48"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={`${2 * Math.PI * 48}`}
                                                strokeDashoffset={`${2 * Math.PI * 48 * (1 - predictionResult.no_show_probability / 100)}`}
                                                strokeLinecap="round"
                                                className={
                                                    predictionResult.no_show_probability > 70 ? 'text-red-500' :
                                                        predictionResult.no_show_probability > 40 ? 'text-yellow-500' :
                                                            'text-green-500'
                                                }
                                                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl sm:text-4xl font-bold text-gray-800">
                                                {predictionResult.no_show_probability}%
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">No-Show Probability</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Level & Recommendation */}
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <RiskBadge risk={predictionResult.risk_level} />
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                            <span className="font-semibold text-gray-800">Recommendation:</span>{' '}
                                            {predictionResult.recommendation}
                                        </p>
                                    </div>
                                </div>

                                {/* Patient Details */}
                                <div className="border-t border-gray-100 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                                    <div className="flex items-center gap-2 sm:gap-3 text-sm">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                            <FaUserInjured className="text-primary-600 text-xs sm:text-sm" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-800 text-sm truncate">{predictionResult.patient_name}</p>
                                            <p className="text-gray-500 text-xs">Patient ID: {predictionResult.patient_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 text-sm pl-1">
                                        <FaCalendarCheck className="text-gray-400 ml-1.5 sm:ml-2.5 text-xs" />
                                        <span className="text-gray-600 text-xs sm:text-sm">
                                            Appointment #{predictionResult.appointment_id}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 sm:gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setPredictionResult(null);
                                            setSelectedAppointment(null);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
                                    >
                                        Clear Result
                                    </button>
                                    <button
                                        onClick={() => {/* TODO: Send reminder */}}
                                        className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-xs sm:text-sm font-medium shadow-sm"
                                    >
                                        Send Reminder
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <EmptyState
                                icon={FaChartLine}
                                title="No analysis yet"
                                description="Click 'Predict No-Show' on any appointment to see AI-powered risk analysis"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}