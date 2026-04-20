import express from "express";
import routes from "./routes/index.js";
import scheduler from "./cron/scheduler.js";
import cors from "cors";

const app = express();

// CORS configuration
const allowedOrigins = [
  "https://remind-me-weld.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép request không có origin (Postman, curl)
      if (!origin) return callback(null, true);

      // Allow exact domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments (nhưng vẫn check tên project)
      if (
        origin.endsWith(".vercel.app") &&
        origin.includes("remind-me")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/", routes);

// Init cron jobs
scheduler.init();

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err);

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: true,
    message: message,
  });
});

export default app;