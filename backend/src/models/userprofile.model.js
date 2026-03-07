    import pool from '../config/database.js';

const userProfileModel = {
    getWithUserInfo: async (user_id) => {
        // Fixed table alias bug (users.user_id)
        const [rows] = await pool.query(`
            SELECT u.username, u.gmail, p.avatar_url, p.weekly_goal
            FROM users u
            LEFT JOIN userprofile p ON u.user_id = p.user_id
            WHERE u.user_id = ?
        `, [user_id]);
        return rows[0] || null;
    },

    updateAvatar: async (user_id, newAvatar) => {
        const [result] = await pool.query(
            `UPDATE userprofile SET avatar_url = ? WHERE user_id = ?`,
            [newAvatar, user_id]
        );
        return result.affectedRows === 1;
    },

    updateWeeklyGoal: async (user_id, newGoal) => {
        const [result] = await pool.query(
            `UPDATE userprofile SET weekly_goal = ? WHERE user_id = ?`,
            [newGoal, user_id]
        );
        return result.affectedRows === 1;
    }
};

export default userProfileModel;