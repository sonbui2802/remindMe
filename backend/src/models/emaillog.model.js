import pool from '../config/database.js';

const emailLogModel = {
    // Supports external transaction (connection) or uses default pool
    createLog: async (connection, { reminder_id, user_id, recipient_email, subject, content }) => {
        const conn = connection || pool; 
        const [result] = await conn.query(
            `INSERT INTO emaillog (reminder_id, user_id, recipient_email, subject, content) VALUES (?, ?, ?, ?, ?)`,
            // FIX: Use the new variable name here too
            [reminder_id, user_id, recipient_email, subject, content] 
        );
        return result.insertId;
    },

    claimPendingEmails: async (limit = 10) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [rows] = await connection.query(`
                SELECT email_id, recipient_email, subject, content
                FROM emaillog 
                WHERE status = 'pending'
                LIMIT ?
                FOR UPDATE SKIP LOCKED
            `, [limit]);

            if (rows.length > 0) {
                const ids = rows.map(r => r.email_id);
                await connection.query(
                    `UPDATE emaillog SET status = 'sending' WHERE email_id IN (?)`,
                    [ids]
                );
            }

            await connection.commit();
            return rows;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    updateStatus: async (email_id, status) => {
        const [result] = await pool.query(`
            UPDATE emaillog 
            SET status = ?, 
                sent_at = CASE 
                    WHEN ? = 'sent' THEN UTC_TIMESTAMP()
                    ELSE sent_at 
                END
            WHERE email_id = ?
        `, [status, status, email_id]);

        return result.affectedRows === 1;
    },
};

export default emailLogModel;