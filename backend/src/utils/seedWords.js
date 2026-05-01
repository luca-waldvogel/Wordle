const Word = require("../models/Word");

// Seed a small list of simple 5-letter words
const seedList = [
  "apple",
  "grape",
  "peach",
  "berry",
  "lemon",
  "mango",
  "cherry",
  "melon",
  "olive",
  "spice",
  "stone",
  "plain",
  "straw",
  "tiger",
  "zebra",
  "eagle",
  "shark",
  "whale",
  "piano",
  "candy",
];

module.exports = async function seedWords() {
  const count = await Word.countDocuments();
  if (count > 0) {
    return;
  }

  await Word.insertMany(seedList.map((value) => ({ value })));
  console.log("Seeded word list");
};

