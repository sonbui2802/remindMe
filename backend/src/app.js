import express from "express";
import routes from "./routes/index.js";
import scheduler from "./cron/scheduler.js";
import cors from "cors";

const app = express();

// ===== CORS CONFIG =====
const allowedOrigins = [
  "https://remind-me-weld.vercel.app", 
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow preview deploy của chính project
    if (
      origin.endsWith(".vercel.app") &&
      origin.includes("remind-me-weld")
    ) {
      return callback(null, true);
    }

    return callback(null, false); 
  },
  
};

// CORS trước routes
app.use(cors(corsOptions));


// ===== MIDDLEWARE =====
app.use(express.json());

// ===== ROUTES =====
app.use("/api", routes);

// ===== CRON =====
scheduler.init();

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err);

  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
});

export default app;