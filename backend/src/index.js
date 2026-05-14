const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const seedWords = require("./utils/seedWords");
const { logInfo, logError } = require("./utils/logger");

dotenv.config();

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  logError("Missing required environment variables", { missing });
  logError("Environment setup required", {
    messageDetail: "Create backend/.env based on backend/.env.example",
  });
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://wordle-qjbl.onrender.com",
  }),
);

// Serve the frontend
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logInfo("MongoDB connected");
  } catch (error) {
    logError("Failed to connect to MongoDB", { errorMessage: error.message });
    process.exit(1);
  }

  try {
    await seedWords();
  } catch (error) {
    logError("Failed to seed words", { errorMessage: error.message });
    process.exit(1);
  }

  app.listen(PORT, () => {
    logInfo("Server started", { port: PORT });
  });
}

startServer();
