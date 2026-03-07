import pool from '../config/database.js'; // Need pool for transactions
import reminderModel from "../models/reminder.model.js";
import emailLogModel from "../models/emaillog.model.js";

const reminderService = {
    createReminder: async ({ title, content, shown_at }, user_id) => {
        const nowUtcMs = Date.now();
        const shownAtMs = Date.parse(shown_at);

        if (shownAtMs < nowUtcMs) {
            throw new Error("Cannot create reminder in the past!");
        }
        const reminder = await reminderModel.createReminder(
        title, content, user_id, shown_at
        );

        //  normalize for frontend
        return {
        reminder_id: reminder.reminder_id,
        title: reminder.title,
        content: reminder.content,
        shown_at: reminder.shown_at,
        status: reminder.status ?? 'pending'
        };
        },

    deleteReminder: async (reminder_id, user_id) => {
        const reminder = await reminderModel.findReminderById(reminder_id);
        
        if (!reminder) throw new Error("Reminder not found");
        
        if (reminder.user_id !== user_id) throw new Error("Unauthorized");
        
        if (["sent", "completed"].includes(reminder.status)) {
            throw new Error("Cannot delete processed reminder");
        }

        const ok = await reminderModel.deleteReminder(reminder_id);
        if (!ok) throw new Error("Failed to delete");
        return true;
    },

    updateReminder: async (reminder_id, user_id, updates) => {
        const reminder = await reminderModel.findReminderById(reminder_id);
        if (!reminder) throw new Error("Reminder not found");
        if (reminder.user_id !== user_id) throw new Error("Unauthorized");
        if (["sent", "completed"].includes(reminder.status)) {
            throw new Error("Cannot update processed reminder");
        }
        if (updates.shown_at &&
            new Date(updates.shown_at).getTime() < Date.now()
        ) {
            throw new Error("Cannot update time to the past");
        }

        const ok = await reminderModel.updateReminder(reminder_id, updates);
        if (!ok) throw new Error("Failed to update");
        return true;
    },
    getReminders: async (user_id) => {
        // Gọi hàm từ model để lấy data từ MySQL
        const reminders = await reminderModel.findRemindersByUserId(user_id); 
        return reminders;
    },

    markCompleted: async (reminder_id, user_id) => {
        const reminder = await reminderModel.findReminderById(reminder_id);
        if (!reminder) throw new Error("Reminder not found");
        if (reminder.user_id !== user_id) throw new Error("Unauthorized");

        const ok = await reminderModel.updateReminder(reminder_id, { status: "completed" });
        if (!ok) throw new Error("Failed to update status");
        return true;
    },

    scanAndSchedule: async () => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Lock and fetch due reminders (now includes 'gmail')
            const tasks = await reminderModel.findDueRemindersLocked(connection, 50);

            if (tasks.length > 0) {
                console.log(`[Scheduler] Found ${tasks.length} due tasks.`);
                
                // 2. Create Email Logs using the data we just fetched
                for (const task of tasks) {
                    await emailLogModel.createLog(connection, {
                        reminder_id: task.reminder_id,
                        user_id: task.user_id,
                        recipient_email: task.gmail, // Available due to JOIN
                        subject: `🔔 Reminder: ${task.title}`,
                        content: task.content
                    });
                }

                // 3. Mark reminders as 'sent'
                const ids = tasks.map(t => t.reminder_id);
                await reminderModel.markAsSent(connection, ids);
            }

            await connection.commit();
            return tasks.length;

        } catch (err) {
            await connection.rollback();
            console.error("[Scheduler] Error:", err);
            throw err;
        } finally {
            connection.release();
        }
    }
};

export default reminderService;