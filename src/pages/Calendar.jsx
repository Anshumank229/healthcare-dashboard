import AppointmentCalendar from '../components/Calendar/AppointmentCalendar';

export default function Calendar() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Calendar</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          View and manage all appointments in calendar view
        </p>
      </div>
      <AppointmentCalendar />
    </div>
  );
}
