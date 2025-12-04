const mongoose = require("mongoose");

// In production, env vars come from Render dashboard, not .env file
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  const path = require("path");
  require('dotenv').config({ path: path.join(__dirname, "../.env") });
}

const useInMemoryDb = !isProduction && String(process.env.USE_IN_MEMORY_DB || "").toLowerCase() === "true";
let mongoUrl = (process.env.MONGO_URL || process.env.MONGO_LOCAL_URL || "").trim();
let memoryServer;

const connectionOptions = {
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 30000,
  socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
};

async function initializeDatabase() {
  try {
    // Only use in-memory DB in development when explicitly enabled
    if (!mongoUrl && useInMemoryDb) {
      // Dynamically import mongodb-memory-server only when needed (dev only)
      const { MongoMemoryServer } = require("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      mongoUrl = memoryServer.getUri();
      console.log(`Using in-memory MongoDB instance at ${mongoUrl}`);
    }

    if (!mongoUrl) {
      console.error('MongoDB connection string is not defined. Please set MONGO_URL in environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl, connectionOptions);
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      console.error('Unable to resolve the MongoDB host. Double-check the cluster hostname.');
    }

    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

initializeDatabase();

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("MongoDB Connection Successful");
});

connection.on("error", (err) => {
  console.error("MongoDB Connection Failed:", err);
});

connection.on("disconnected", () => {
  console.log("MongoDB Disconnected");
});

const gracefulShutdown = async () => {
  await connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

module.exports = connection;
