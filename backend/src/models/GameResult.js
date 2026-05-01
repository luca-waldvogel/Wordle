const mongoose = require("mongoose");

const gameResultSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    won: { type: Boolean, required: true },
    attemptsUsed: { type: Number, required: true },
    targetWord: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameResult", gameResultSchema);

