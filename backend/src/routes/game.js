const express = require("express");
const Word = require("../models/Word");
const GameResult = require("../models/GameResult");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/new", authMiddleware, async (req, res) => {
  try {
    const words = await Word.aggregate([{ $sample: { size: 1 } }]);
    if (!words.length) {
      return res.status(500).json({ message: "No words available in database." });
    }

    const word = words[0].value;
    return res.json({ word, length: word.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to start a new game." });
  }
});

router.post("/result", authMiddleware, async (req, res) => {
  try {
    const { won, attemptsUsed, targetWord, score } = req.body;
    if (typeof won !== "boolean" || typeof attemptsUsed !== "number" || !targetWord) {
      return res.status(400).json({ message: "Invalid game result." });
    }

    const safeScore = typeof score === "number" ? Math.max(0, Math.floor(score)) : 0;

    const result = await GameResult.create({
      username: req.user.username,
      won,
      attemptsUsed,
      targetWord,
      score: safeScore,
    });

    return res.status(201).json({ id: result._id, score: safeScore });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save game result." });
  }
});

router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const results = await GameResult.find({})
      .sort({ score: -1, createdAt: 1 })
      .limit(10)
      .select("username score attemptsUsed won createdAt");

    return res.json({ results });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load leaderboard." });
  }
});

module.exports = router;
