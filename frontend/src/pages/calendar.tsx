import React, { useState, useEffect, useMemo } from 'react';
import reminderService from '../services/reminder.service';
import type { Reminder } from '../services/reminder.service';

// --- Helpers ---

// Bulletproof helper to get YYYY-MM-DD in the user's LOCAL timezone
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7; 
  const start = new Date(date);
  start.setDate(date.getDate() - distanceToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// --- Main Component ---
const Calendar: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD
  const [editingId, setEditingId] = useState<number | null>(null); // 👉 Đánh dấu đang sửa reminder nào
  
  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTime, setFormTime] = useState('09:00'); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Data Fetching ---
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getReminders();
      setReminders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // --- Handlers ---
  
  // 1. Mở Modal để TẠO MỚI
  const handleOpenModal = (dateStr: string) => {
    setEditingId(null); // Đảm bảo reset về trạng thái tạo mới
    setSelectedDate(dateStr);
    setFormTitle('');
    setFormContent('');
    setFormTime('09:00');
    setIsModalOpen(true);
  };

  // 2. Mở Modal để SỬA (Đổ dữ liệu cũ vào form)
  const handleEditClick = (event: Reminder) => {
    setEditingId(event.reminder_id); 
    
    // 1. Convert the ISO string into a safe JavaScript Date object
    const eventDate = new Date(event.shown_at);

    // 2. Extract Local Date (YYYY-MM-DD) using your existing bulletproof helper
    const datePart = toLocalDateString(eventDate);

    // 3. Extract Local Time (HH:mm) safely
    const hours = String(eventDate.getHours()).padStart(2, '0');
    const minutes = String(eventDate.getMinutes()).padStart(2, '0');
    const timePart = `${hours}:${minutes}`;
    
    // 4. Populate the form
    setSelectedDate(datePart);
    setFormTime(timePart);
    setFormTitle(event.title);
    setFormContent(event.content);
    setIsModalOpen(true);
  };
  
  // 3. Xử lý khi bấm nút Lưu (Dùng chung cho cả Tạo mới và Cập nhật)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const shown_at = `${selectedDate} ${formTime}:00`;
      
      if (editingId) {
        // NẾU CÓ EDITING ID -> GỌI API UPDATE
        await reminderService.updateReminder(editingId, {
          title: formTitle,
          content: formContent,
          shown_at
        });
      } else {
        // NẾU KHÔNG CÓ -> GỌI API CREATE
        await reminderService.createReminder({
          title: formTitle,
          content: formContent,
          shown_at
        });
      }
      
      setIsModalOpen(false);
      fetchReminders(); // Tải lại danh sách
    } catch (err: any) {
      alert(err?.message || 'Failed to save reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await reminderService.completeReminder(id);
      fetchReminders();
    } catch (err: any) {
      alert(err?.message || 'Failed to mark as complete');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await reminderService.deleteReminder(id);
      fetchReminders();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete reminder');
    }
  };

  // --- Derived State (Grid Mapping) ---
  const weekDays = useMemo(() => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    
    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);
      return day;
    });
  }, []);

  const eventsByDate = useMemo(() => {
    const mapped = new Map<string, Reminder[]>();
    
    reminders.forEach(reminder => {
      // Parse "YYYY-MM-DD HH:mm:ss" into local Date object
      const eventDate = new Date(reminder.shown_at.replace(' ', 'T'));
      
      // FIX: Safely get YYYY-MM-DD in local time
      const dateKey = toLocalDateString(eventDate); 
      
      if (!mapped.has(dateKey)) {
        mapped.set(dateKey, []);
      }
      mapped.get(dateKey)?.push(reminder);
    });
    
    return mapped;
  }, [reminders]);

  const todayStr = toLocalDateString(new Date());

  return (
    <div className="min-h-screen bg-[#DCE9F6] text-slate-900 font-sans p-8 md:p-12 relative">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Weekly Planner</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium tracking-wide uppercase">Manage your schedule</p>
        </div>
        {loading && <span className="text-sm text-slate-500 font-medium animate-pulse">Syncing...</span>}
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Weekly Container */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* 7-Column Grid */}
        <div className="grid grid-cols-7 divide-x divide-slate-200/80 min-h-[600px]">
          
          {weekDays.map((day) => {
            const dateKey = toLocalDateString(day);
            const isToday = dateKey === todayStr;
            const dayEvents = eventsByDate.get(dateKey) || [];

            return (
              <div 
                key={dateKey} 
                className={`flex flex-col pt-6 pb-4 px-3 transition-colors group/col ${isToday ? 'bg-blue-50/40' : 'bg-gray-50'}`}
              >
                {/* Column Header */}
                <div className="flex flex-col items-center mb-6 relative">
                  <span className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  {/* Quick Add Button */}
                  <button 
                    onClick={() => handleOpenModal(dateKey)}
                    className="absolute -bottom-6 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 shadow-sm opacity-0 group-hover/col:opacity-100 transition-all cursor-pointer z-10"
                    title="Add reminder"
                  >
                    +
                  </button>
                </div>

                {/* Events List */}
                <div className="flex flex-col gap-3 flex-grow mt-2">
                  {dayEvents.length === 0 ? (
                    <div 
                      onClick={() => handleOpenModal(dateKey)}
                      className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer border-2 border-dashed border-transparent hover:border-slate-200 rounded-xl"
                    >
                      <span className="text-xs text-slate-400 font-medium">Click to add</span>
                    </div>
                  ) : (
                    dayEvents.map(event => {
                      const eventTime = new Date(event.shown_at.replace(' ', 'T'));
                      const isCompleted = event.status === 'completed';
                      
                      return (
                        <div 
                          key={event.reminder_id}
                          className={`relative bg-white border border-slate-100/80 rounded-xl p-3 shadow-sm hover:shadow-md transition-all group ${isCompleted ? 'opacity-50 grayscale' : ''}`}
                        >
                          <h3 className={`text-sm font-semibold leading-tight mb-1 transition-colors ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-blue-600'}`}>
                            {event.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {formatTime(eventTime)}
                          </p>

                          {/* Hover Actions */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isCompleted && (
                              <>
                                {/* 👉 NÚT EDIT (SỬA) */}
                                <button onClick={() => handleEditClick(event)} className="w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-500 rounded hover:bg-blue-100 transition-colors" title="Edit">
                                  ✎
                                </button>
                                
                                {/* Nút Complete */}
                                <button onClick={() => handleComplete(event.reminder_id)} className="w-6 h-6 flex items-center justify-center bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors" title="Complete">
                                  ✓
                                </button>
                              </>
                            )}
                            {/* Nút Delete */}
                            <button onClick={() => handleDelete(event.reminder_id)} className="w-6 h-6 flex items-center justify-center bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors" title="Delete">
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Content */}
            <div className="px-6 py-5 border-b border-slate-100">
              {/* Tự động đổi tiêu đề Modal */}
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit Reminder' : 'New Reminder'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Scheduling for {selectedDate}</p>
            </div>
            
            {/* Gọi hàm handleSubmitForm dùng chung */}
            <form onSubmit={handleSubmitForm} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Time</label>
                <input 
                  type="time" 
                  required
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="E.g., Design Review"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Add details..."
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {/* Tự động đổi text nút bấm */}
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Reminder' : 'Save Reminder')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;