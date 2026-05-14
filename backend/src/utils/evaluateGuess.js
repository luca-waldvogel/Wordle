// Word evaluation logic
module.exports = function evaluateGuess(guess, target) {
  const result = Array(5).fill("absent");
  const targetLetters = target.split("");
  const guessLetters = guess.split("");

  // First pass: correct positions
  guessLetters.forEach((letter, index) => {
    if (letter === targetLetters[index]) {
      result[index] = "correct";
      targetLetters[index] = null;
    }
  });

  // Second pass: present letters
  guessLetters.forEach((letter, index) => {
    if (result[index] === "correct") return;
    const matchIndex = targetLetters.indexOf(letter);
    if (matchIndex !== -1) {
      result[index] = "present";
      targetLetters[matchIndex] = null;
    }
  });

  return result;
};
