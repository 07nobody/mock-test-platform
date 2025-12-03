const path = require("path");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

require('dotenv').config({ path: path.join(__dirname, "../.env") });

const useInMemoryDb = String(process.env.USE_IN_MEMORY_DB || "").toLowerCase() === "true";
let mongoUrl = useInMemoryDb ? "" : (process.env.MONGO_URL || process.env.MONGO_LOCAL_URL || "").trim();
let memoryServer;

const connectionOptions = {
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
  socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
};

async function initializeDatabase() {
  try {
    if (!mongoUrl && useInMemoryDb) {
      memoryServer = await MongoMemoryServer.create();
      mongoUrl = memoryServer.getUri();
      console.log(`Using in-memory MongoDB instance at ${mongoUrl}`);
    }

    if (!mongoUrl) {
      console.error('MongoDB connection string is not defined. Please set MONGO_URL (or MONGO_LOCAL_URL) in server/.env');
      process.exit(1);
    }

    await mongoose.connect(mongoUrl, connectionOptions);
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      console.error('Unable to resolve the MongoDB host. Double-check the cluster hostname or ensure your network allows DNS lookups for mongodb.net domains.');
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
