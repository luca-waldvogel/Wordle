const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5500",
    }),
  );

  app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

  app.use("/api/auth", authRoutes);
  app.use("/api/game", gameRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}

module.exports = {
  createApp,
};
