import api from './api';

// --- Types matching backend contract ---
export interface Reminder {
  reminder_id: number;
  title: string;
  content: string;
  shown_at: string; // "YYYY-MM-DD HH:mm:ss"
  status: 'pending' | 'sent' | 'completed';
}

export interface CreateReminderPayload {
  title: string;
  content: string;
  shown_at: string;
}

export interface UpdateReminderPayload {
  title?: string;
  content?: string;
  shown_at?: string;
}

// --- Service ---
const reminderService = {
  getReminders: async (): Promise<Reminder[]> => {
    try {
      const response = await api.get('/reminders');
      // FIX: Extract the nested 'data' array from the backend envelope.
      // We use `response.data.data || response.data` so it won't break 
      // if your backend occasionally sends a raw array instead of the envelope.
      const payload = response.data.data || response.data;
      return payload;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  createReminder: async (payload: CreateReminderPayload) => {
    try {
      const response = await api.post('/reminders', payload);
      // It's fine to leave this as response.data because the Calendar component
      // doesn't directly use the return value of createReminder right now,
      // but returning response.data.data is best practice for consistency.
      return response.data.data || response.data; 
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateReminder: async (id: number, payload: UpdateReminderPayload) => {
    try {
      const response = await api.put(`/reminders/${id}`, payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  deleteReminder: async (id: number) => {
    try {
      const response = await api.delete(`/reminders/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  completeReminder: async (id: number) => {
    try {
      const response = await api.post(`/reminders/${id}/complete`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
};

export default reminderService;