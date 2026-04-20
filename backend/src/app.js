import express from "express";
import routes from "./routes/index.js";
import scheduler from "./cron/scheduler.js";
import cors from 'cors';
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/", routes);

// Init cron jobs
scheduler.init();
// CORS configuration - Chỉ cho phép frontend của bạn truy cập API
app.use(cors({
    origin: 'https://remindme-app-drab.vercel.app', 
    credentials: true
}));
// Global error handler
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err);

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: true,
    message: message
  });
});

export default app;