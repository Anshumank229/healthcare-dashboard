import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multimonthPlugin from '@fullcalendar/multimonth';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { FaClock, FaUser, FaUserMd, FaInfoCircle } from 'react-icons/fa';

const AppointmentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: appointments, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments/');
      return response.data;
    }
  });

  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const calendarEvents = appointments.map(apt => {
        let startDate = new Date(apt.appointment_date);

        if (isNaN(startDate.getTime())) return null;

        const statusColors = {
          scheduled: { bg: '#0ea5e9', border: '#0284c7' },
          confirmed: { bg: '#10b981', border: '#059669' },
          cancelled: { bg: '#ef4444', border: '#dc2626' },
          completed: { bg: '#64748b', border: '#475569' },
          no_show: { bg: '#f59e0b', border: '#d97706' },
        };

        const colors = statusColors[apt.status] || statusColors.scheduled;

        return {
          id: apt.id,
          title: `Apt #${apt.id}${apt.reason ? ' — ' + apt.reason : ''}`,
          start: startDate,
          end: new Date(startDate.getTime() + (apt.duration_minutes || 30) * 60000),
          backgroundColor: colors.bg,
          borderColor: colors.border,
          extendedProps: {
            status: apt.status || 'scheduled',
            patient_id: apt.patient_id,
            doctor_id: apt.doctor_id,
            reason: apt.reason || 'No reason provided',
            duration: apt.duration_minutes || 30,
            appointment_date: apt.appointment_date
          }
        };
      }).filter(event => event !== null);

      setEvents(calendarEvents);
    }
  }, [appointments]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowModal(true);
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      toast.success(`Appointment ${newStatus}`);
      refetch();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-100 dark:border-surface-700 p-4 md:p-6">
      <div className="h-[600px] md:h-[700px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multimonthPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="timeGridWeek"
          editable={false}
          selectable={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          eventClick={handleEventClick}
          height="100%"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          slotDuration="00:30:00"
          nowIndicator={true}
          eventDisplay="block"
          eventBorderColor="transparent"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
        {[
          { label: 'Scheduled', color: '#0ea5e9' },
          { label: 'Confirmed', color: '#10b981' },
          { label: 'Cancelled', color: '#ef4444' },
          { label: 'Completed', color: '#64748b' },
          { label: 'No Show', color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-surface-400">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={showModal && !!selectedEvent}
        onClose={() => setShowModal(false)}
        title="Appointment Details"
        size="sm"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-0.5">Appointment ID</p>
                <p className="font-semibold text-surface-800 dark:text-surface-200">#{selectedEvent.id}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-0.5">Status</p>
                <StatusBadge status={selectedEvent.extendedProps.status} />
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-0.5 flex items-center gap-1"><FaClock size={10} /> Date & Time</p>
                <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">{selectedEvent.start?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-0.5">Duration</p>
                <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">{selectedEvent.extendedProps.duration} min</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-0.5 flex items-center gap-1"><FaUser size={10} /> Patient</p>
                <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">Patient #{selectedEvent.extendedProps.patient_id}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-0.5 flex items-center gap-1"><FaUserMd size={10} /> Doctor</p>
                <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">Doctor #{selectedEvent.extendedProps.doctor_id}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-0.5 flex items-center gap-1"><FaInfoCircle size={10} /> Reason</p>
              <p className="text-sm text-surface-700 dark:text-surface-300">{selectedEvent.extendedProps.reason}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-surface-100 dark:border-surface-700">
              {selectedEvent.extendedProps.status !== 'confirmed' && selectedEvent.extendedProps.status !== 'cancelled' && (
                <Button size="sm" className="flex-1" onClick={() => updateAppointmentStatus(selectedEvent.id, 'confirmed')}>
                  Confirm
                </Button>
              )}
              {selectedEvent.extendedProps.status !== 'completed' && selectedEvent.extendedProps.status !== 'cancelled' && (
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => updateAppointmentStatus(selectedEvent.id, 'completed')}>
                  Complete
                </Button>
              )}
              {selectedEvent.extendedProps.status !== 'cancelled' && (
                <Button variant="danger" size="sm" className="flex-1" onClick={() => updateAppointmentStatus(selectedEvent.id, 'cancelled')}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;
