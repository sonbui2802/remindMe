import pool from '../config/database.js';
// query = promise
//connection = await
const userModel={
    registerByTransaction: async(username,gmail,passwordhash)=>{
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Kiểm tra xem username/gmail đã tồn tại chưa
        const [existingUser] = await connection.query("SELECT user_id FROM users WHERE username = ? or gmail = ?",[username,gmail]);
        if(existingUser.length > 0){
            throw new Error("Username hoặc gmail đã tồn tại!");
        }
        //thêm user mới
        const [userResult] = await connection.query(`INSERT INTO users (username, gmail, password)
        VALUES (?, ?, ?)`,[username,gmail,passwordhash]);
        
        const userId = userResult.insertId; // User_id

        await connection.query(
        `INSERT INTO userprofile (user_id, avatar_url)
         VALUES (?, ?)`,
        [userId, "default.png"]
        );
        await connection.commit();
        return {
            userId : userResult.insertId,

        }
    } catch (error) {
        await connection.rollback();
        throw error;
    }
    finally{
        connection.release();
    }
    },

    findUserById: async (user_id) => { 
    const [rows] = await pool.query(
        `SELECT user_id, username, gmail, role, created_at
         FROM users
         WHERE user_id = ?`,
        [user_id]
    );
    return rows[0] || null;
    },
    findByEmailOrUsername: async (loginInput) => { 
        const [rows] = await pool.query(
            `SELECT user_id, username, gmail, password, role
             FROM users
             WHERE gmail = ? OR username = ?`, // 2 dấu ?
            [loginInput, loginInput] // <--- QUAN TRỌNG: Phải truyền biến vào 2 lần để lấp vào 2 dấu ?
        );
        return rows[0] || null;
    },

    updatePassword: async (user_id,newPassword) => {
    const [rows] = await pool.query(
        `UPDATE users
         SET password = ?
         WHERE user_id = ? `,
        [newPassword, user_id])
    return rows.affectedRows === 1;     
    }


    };
export default userModel;



