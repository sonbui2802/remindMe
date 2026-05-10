import pool from '../config/database.js'; 
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
        console.log("--- DEBUG UNAUTHORIZED ---");
        console.log("Reminder object from DB:", reminder);
        console.log("User ID from Token:", user_id);
        console.log("Compare result:", String(reminder.user_id) === String(user_id));
        // Đã ép kiểu String() cả 2 vế
        if (String(reminder.user_id) !== String(user_id)) throw new Error("Unauthorized");
        
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
        
        // Đã ép kiểu String() cả 2 vế
        if (String(reminder.user_id) !== String(user_id)) throw new Error("Unauthorized");
        
        if (["sent", "completed"].includes(reminder.status)) {
            throw new Error("Cannot update processed reminder");
        }
        if (updates.shown_at && new Date(updates.shown_at).getTime() < Date.now()) {
            throw new Error("Cannot update time to the past");
        }

        const ok = await reminderModel.updateReminder(reminder_id, updates);
        if (!ok) throw new Error("Failed to update");
        return true;
    },

    markCompleted: async (reminder_id, user_id) => {
        const reminder = await reminderModel.findReminderById(reminder_id);
        if (!reminder) throw new Error("Reminder not found");
        
        // Đã ép kiểu String() cả 2 vếf
        if (String(reminder.user_id) !== String(user_id)) throw new Error("Unauthorized");

        const ok = await reminderModel.updateReminder(reminder_id, { status: "completed" });
        if (!ok) throw new Error("Failed to update status");
        return true;
    },

    scanAndSchedule: async () => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Lấy và Khóa dữ liệu (SKIP LOCKED)
            const tasks = await reminderModel.findDueRemindersLocked(connection, 50);

            if (tasks.length > 0) {
                console.log(`[Scheduler] 🔎 Tìm thấy ${tasks.length} tasks đến hạn.`);
                
                // 2. Gom dữ liệu lại thành mảng 2 chiều
                const emailLogData = tasks.map(task => [
                    task.reminder_id,
                    task.user_id,
                    task.gmail, 
                    `🔔 Reminder: ${task.title}`,
                    task.content,
                    'pending'
                ]);

                // 3. ✅ FIX: Dùng Bulk Insert (INSERT IGNORE) 
                // Nhanh hơn vòng lặp for gấp 10 lần, nếu có trùng (duplicate) tự động bỏ qua.
                await connection.query(`
                    INSERT IGNORE INTO emaillog (reminder_id, user_id, recipient_email, subject, content, status)
                    VALUES ? 
                `, [emailLogData]);

                // 4. Update hàng loạt trạng thái thành 'sent'
                const ids = tasks.map(t => t.reminder_id);
                await reminderModel.markAsSent(connection, ids);
            }

            // 5. Commit siêu tốc để trả kết nối cho MySQL
            await connection.commit();
            return tasks.length;

        } catch (err) {
            await connection.rollback();
            console.error("[Scheduler Error]:", err);
            throw err;
        } finally {
            connection.release();
        }
    },
    getReminders: async (user_id) => {
        // Gọi xuống DB để lấy toàn bộ reminder của user này
        const reminders = await reminderModel.findRemindersByUserId(user_id);
        
        if (!reminders) return [];
        return reminders;
    },
};

export default reminderService;