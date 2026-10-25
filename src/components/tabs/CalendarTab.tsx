import React, { useState } from 'react';
import { CalendarEvent, User } from '../../types';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

interface CalendarTabProps {
  events: CalendarEvent[];
  currentUser: User;
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  events,
  currentUser,
  onAddEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDateStr);
  const [eventTime, setEventTime] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format YYYY-MM-DD
  const formatDayString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Check if a day has events
  const getEventsForDay = (dateStr: string) => {
    return events.filter((e) => e.date === dateStr);
  };

  const selectedDayEvents = getEventsForDay(selectedDateStr);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      setError('Please provide a title and date for the event.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddEvent({
        title: title.trim(),
        date: eventDate,
        time: eventTime.trim() || undefined,
        description: description.trim() || undefined,
      });

      setShowAddModal(false);
      setTitle('');
      setEventTime('');
      setDescription('');
    } catch {
      setError('Failed to create calendar event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title with Gold Underline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#22244A] dark:text-white gold-underline">
            Family Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Birthdays, gatherings, anniversaries, and reunions
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEventDate(selectedDateStr);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold shadow-md transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#E2B04A]" />
            Add Event (Admin)
          </button>
        )}
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white dark:bg-[#1a1b35] rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800">
        {/* Month Header with Previous / Next Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#22244A] dark:text-white">
            {monthNames[month]} {year}
          </h3>

          <button
            onClick={nextMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-2xl p-1" />
          ))}

          {/* Month Days */}
          {Array.from({ length: totalDaysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = formatDayString(dayNum);
            const isSelected = selectedDateStr === dayStr;
            const dayEvents = getEventsForDay(dayStr);
            const hasEvents = dayEvents.length > 0;
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => setSelectedDateStr(dayStr)}
                className={`relative aspect-square rounded-2xl p-1 flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#22244A] text-white shadow-md ring-2 ring-[#E2B04A]'
                    : isToday
                    ? 'bg-[#E2B04A]/15 text-[#22244A] dark:text-white font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="text-xs sm:text-sm font-semibold">{dayNum}</span>

                {/* GOLD DOT for days with events */}
                {hasEvents && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-[#E2B04A] ring-1 ring-white' : 'bg-[#E2B04A] shadow-[0_0_6px_#E2B04A]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#E2B04A]" />
            Events for {selectedDateStr}
          </h3>
          <span className="text-xs text-slate-400">
            {selectedDayEvents.length} event(s)
          </span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1b35] rounded-3xl p-6 text-center border border-slate-100 dark:border-slate-800 text-slate-400 text-xs">
            No events scheduled for this day.
            {isAdmin && (
              <button
                onClick={() => {
                  setEventDate(selectedDateStr);
                  setShowAddModal(true);
                }}
                className="block mx-auto mt-2 text-xs text-[#E2B04A] font-bold hover:underline"
              >
                + Add event on {selectedDateStr}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white dark:bg-[#1a1b35] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E2B04A]" />
                    <h4 className="font-heading font-bold text-base text-slate-800 dark:text-white">
                      {evt.title}
                    </h4>
                  </div>

                  {evt.time && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 ml-4.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {evt.time}
                    </p>
                  )}

                  {evt.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 ml-4.5 whitespace-pre-line">
                      {evt.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1b35] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-heading text-lg font-bold text-[#22244A] dark:text-white mb-1">
              Add Calendar Event
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              All approved members will receive automatic notices based on their preferences.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mom's Birthday Dinner"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Location (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Meeting at Grand Central Restaurant, table for 12..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E2B04A]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#22244A] hover:bg-[#2c2f60] text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
