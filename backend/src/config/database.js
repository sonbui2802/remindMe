import mysql from "mysql2/promise";
import dotenv from 'dotenv';

// FIX: Must load env variables before creating the pool
dotenv.config();

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    // Added safety limits for concurrent Cron + HTTP requests
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function connectDB() {
    try {
        await pool.query("SELECT 1");
        console.log("[Database] Connection Success! ✅");
    } catch (error) {
        console.error("[Database] Connection failed ❌", error);
        process.exit(1); // Hard fail: if DB is dead, stop the server
    }
}

export { connectDB };
export default pool;