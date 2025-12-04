const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Only load dotenv in development (production uses Render's env vars)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Log environment for debugging
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("MONGO_URL exists:", !!process.env.MONGO_URL);

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3001,http://localhost:5000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  optionsSuccessStatus: 200,
  maxAge: 3600
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(helmet());
app.use(compression());

const rateLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(rateLimiter);
app.use(express.json({ limit: "1mb" }));

const dbConfig = require("./config/dbConfig");
const usersRoute = require("./routes/usersRoute");
const examsRoute = require("./routes/examsRoute");
const resportsRoute = require("./routes/reportsRoute");
const paymentsRoute = require("./routes/paymentsRoute");
const leaderboardRoute = require("./routes/leaderboardRoute");

app.get("/", (req, res) => {
  res.send("Server is running. Use /api endpoints to access the Mock Test Platform API.");
});

app.use("/api/users", usersRoute);
app.use("/api/exams", examsRoute);
app.use("/api/reports", resportsRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/leaderboard", leaderboardRoute);

__dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });   
}

// Global error handler (after all routes/middleware)
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).send({
    message: err.message || 'Something went wrong!',
    success: false,
  });
});

const startServer = async (retryCount = 0) => {
  const port = process.env.PORT || 5000 + retryCount;
  
  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        resolve();
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && retryCount < 10) {
          console.log(`Port ${port} is in use, trying next port...`);
          server.close();
          startServer(retryCount + 1);
        } else {
          console.error('Failed to start server:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Server startup failed:', error);
  }
};

startServer();
