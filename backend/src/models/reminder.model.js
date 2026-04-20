import pool from '../config/database.js';

const reminderModel = {
    createReminder: async (title, content, user_id, shown_at) => {
        const [result] = await pool.query(
            `INSERT INTO reminder (title, content, user_id, shown_at) VALUES (?, ?, ?, ?)`,
            [title, content, user_id, shown_at]
        );
        return { reminder_id: result.insertId, title, content, shown_at };
    },

    findReminderById: async (reminder_id) => {
        const [rows] = await pool.query(
            `SELECT * FROM reminder WHERE reminder_id = ?`, 
            [reminder_id]
        );
        // PHẢI LÀ DÒNG NÀY: Lấy phần tử đầu tiên, nếu không có thì trả về null
        return rows || null; 
    },
    // Hàm này dùng cho getReminders/getAll
    findRemindersByUserId: async (user_id) => {
        const [rows] = await pool.query(
            `SELECT * FROM reminder WHERE user_id = ? ORDER BY shown_at ASC`, 
            [user_id]
        );
        
        return rows; 
    },


    updateReminder: async (reminder_id, updates) => {
        const fields = [];
        const values = [];
        
        // Use !== undefined to allow setting null values if needed
        if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
        if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content); }
        if (updates.shown_at !== undefined) { fields.push('shown_at = ?'); values.push(updates.shown_at); }
        if (updates.level !== undefined) { fields.push('level = ?'); values.push(updates.level); }
        if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }

        if (fields.length === 0) return false;

        values.push(reminder_id);
        const [result] = await pool.query(
            `UPDATE reminder SET ${fields.join(', ')} WHERE reminder_id = ?`,
            values
        );
        return result.affectedRows === 1;
    },

    deleteReminder: async (reminder_id) => {
        const [result] = await pool.query(`DELETE FROM reminder WHERE reminder_id = ?`, [reminder_id]);
        return result.affectedRows > 0;
    },

    // --- Methods for CronJob / Service ---

    /**
     * Finds due reminders and locks them. 
     * MUST be called inside a transaction passed from Service.
     */
    findDueRemindersLocked: async (connection, limit = 50) => {
        // Đổi UTC_TIMESTAMP() thành NOW() và dùng Sub-query để fix lỗi JOIN của TiDB
        const sql = `
            SELECT 
                r.*, 
                (SELECT gmail FROM users u WHERE u.user_id = r.user_id) AS gmail
            FROM reminder r
            WHERE r.status = 'pending' AND r.shown_at <= NOW()
            LIMIT ? 
            FOR UPDATE SKIP LOCKED
        `;
        
        const [rows] = await connection.query(sql, [limit]);
        return rows;
    },

    markAsSent: async (connection, reminderIds) => {
        if (reminderIds.length === 0) return;
        await connection.query(
            `UPDATE reminder SET status = 'sent' WHERE reminder_id IN (?)`,
            [reminderIds]
        );
    }
};

export default reminderModel;