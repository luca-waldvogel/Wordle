const mongoose = require("mongoose");

const { createApp } = require("./app");
const seedWords = require("./utils/seedWords");
const { logInfo } = require("./utils/logger");

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];

function validateRequiredEnv(env = process.env) {
  return requiredEnv.filter((key) => !env[key]);
}

async function connectToDatabase(uri = process.env.MONGO_URI) {
  await mongoose.connect(uri);
  logInfo("MongoDB connected");
}

async function initializeAppData() {
  await seedWords();
}

async function startServer({ port = process.env.PORT || 5000 } = {}) {
  const missing = validateRequiredEnv();
  if (missing.length > 0) {
    const error = new Error("Missing required environment variables");
    error.missing = missing;
    throw error;
  }

  await connectToDatabase();
  await initializeAppData();

  const app = createApp();
  const server = await new Promise((resolve) => {
    const listener = app.listen(port, () => resolve(listener));
  });

  logInfo("Server started", { port });
  return { app, server };
}

module.exports = {
  createApp,
  connectToDatabase,
  initializeAppData,
  startServer,
  validateRequiredEnv,
};
