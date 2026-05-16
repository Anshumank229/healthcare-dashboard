import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multimonthPlugin from '@fullcalendar/multimonth';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AppointmentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: appointments, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments/');
      console.log('Fetched appointments:', response.data.length);
      return response.data;
    }
  });

  useEffect(() => {
    if (appointments && appointments.length > 0) {
      console.log('Processing appointments:', appointments.length);
      
      const calendarEvents = appointments.map(apt => {
        let startDate = new Date(apt.appointment_date);
        
        if (isNaN(startDate.getTime())) {
          console.log('Invalid date for appointment:', apt.id);
          return null;
        }
        
        let backgroundColor = '#3b82f6';
        if (apt.status === 'confirmed') backgroundColor = '#10b981';
        if (apt.status === 'cancelled') backgroundColor = '#ef4444';
        if (apt.status === 'completed') backgroundColor = '#6b7280';
        if (apt.status === 'no_show') backgroundColor = '#f59e0b';
        
        return {
          id: apt.id,
          title: `Appointment #${apt.id}`,
          start: startDate,
          end: new Date(startDate.getTime() + (apt.duration_minutes || 30) * 60000),
          backgroundColor: backgroundColor,
          borderColor: backgroundColor,
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
      
      console.log('Created calendar events:', calendarEvents.length);
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
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Calendar</h2>
      <div className="h-[650px]">
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
        />
      </div>

      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Appointment Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                &times;
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Appointment ID</p>
                <p className="font-medium">{selectedEvent.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">{selectedEvent.start?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{selectedEvent.extendedProps.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedEvent.extendedProps.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                  selectedEvent.extendedProps.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  selectedEvent.extendedProps.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  selectedEvent.extendedProps.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {selectedEvent.extendedProps.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedEvent.extendedProps.reason}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {selectedEvent.extendedProps.status !== 'confirmed' && (
                <button
                  onClick={() => updateAppointmentStatus(selectedEvent.id, 'confirmed')}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Confirm
                </button>
              )}
              {selectedEvent.extendedProps.status !== 'cancelled' && (
                <button
                  onClick={() => updateAppointmentStatus(selectedEvent.id, 'cancelled')}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              )}
              {selectedEvent.extendedProps.status !== 'completed' && (
                <button
                  onClick={() => updateAppointmentStatus(selectedEvent.id, 'completed')}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
