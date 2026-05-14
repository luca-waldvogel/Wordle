const API_BASE_URL = window.API_BASE_URL;

const authSection = document.getElementById("auth-section");
const gameSection = document.getElementById("game-section");
const messageEl = document.getElementById("message");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const toRegisterBtn = document.getElementById("to-register");
const toLoginBtn = document.getElementById("to-login");
const loginSwitch = document.getElementById("login-switch");
const logoutBtn = document.getElementById("logout-btn");
const newGameBtn = document.getElementById("new-game-btn");
const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const leaderboardBody = document.getElementById("leaderboard-body");
const currentUserEl = document.getElementById("current-user");
const scoreValueEl = document.getElementById("score-value");
const attemptsValueEl = document.getElementById("attempts-value");
const scoreUsernameEl = document.getElementById("score-username");

// State for current game
let authToken = localStorage.getItem("wordleToken");
let targetWord = "";
let board = [];
let currentRow = 0;
let currentCol = 0;
let gameActive = false;
let currentScore = 10000;
let totalPenalty = 0;
let gameStartTime = 0;
let scoreTimerId = null;

function setMessage(text) {
  messageEl.textContent = text;
}

function setAuthMode(mode) {
  const isLogin = mode === "login";
  loginTab.classList.toggle("active", isLogin);
  registerTab.classList.toggle("active", !isLogin);
  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);
  loginForm.hidden = !isLogin;
  registerForm.hidden = isLogin;
  loginSwitch.classList.toggle("hidden", isLogin);
  loginSwitch.hidden = isLogin;
  toRegisterBtn.parentElement.classList.toggle("hidden", !isLogin);
  toRegisterBtn.parentElement.hidden = !isLogin;
}

function showGame() {
  authSection.classList.add("hidden");
  gameSection.classList.remove("hidden");
}

function hideGame() {
  gameSection.classList.add("hidden");
  authSection.classList.remove("hidden");
}

function setToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem("wordleToken", token);
  } else {
    localStorage.removeItem("wordleToken");
  }
}

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function buildBoard() {
  boardEl.innerHTML = "";
  board = Array.from({ length: 10 }, () => Array(5).fill(""));

  for (let row = 0; row < 10; row += 1) {
    const rowEl = document.createElement("div");
    rowEl.className = "board-row";
    for (let col = 0; col < 5; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      rowEl.appendChild(cell);
    }
    boardEl.appendChild(rowEl);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  rows.forEach((letters, rowIndex) => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";

    if (rowIndex === 2) {
      rowEl.appendChild(createKey("ENTER"));
    }

    letters.split("").forEach((letter) => {
      rowEl.appendChild(createKey(letter));
    });

    if (rowIndex === 2) {
      rowEl.appendChild(createKey("BACK"));
    }

    keyboardEl.appendChild(rowEl);
  });
}

function createKey(label) {
  const key = document.createElement("button");
  key.type = "button";
  key.className = "key";
  key.dataset.key = label;
  key.textContent = label === "BACK" ? "DEL" : label;
  return key;
}

function clearKeyboardStyles() {
  keyboardEl.querySelectorAll(".key").forEach((key) => {
    key.classList.remove("correct", "present", "absent");
  });
}

function updateCell(row, col, value, status) {
  const cell = boardEl.querySelector(
    `.cell[data-row='${row}'][data-col='${col}']`,
  );
  if (!cell) return;
  cell.textContent = value ? value.toUpperCase() : "";
  cell.classList.remove("correct", "present", "absent");
  if (status) {
    cell.classList.add(status);
  }
}

function resetGameState() {
  currentRow = 0;
  currentCol = 0;
  gameActive = true;
  currentScore = 10000;
  totalPenalty = 0;
  gameStartTime = Date.now();
  if (scoreTimerId) {
    clearInterval(scoreTimerId);
  }
  scoreTimerId = setInterval(() => {
    if (!gameActive) return;
    currentScore = calculateScore();
    updateScoreCard();
  }, 1000);
  buildBoard();
  clearKeyboardStyles();
  setMessage("Good luck!");
  updateScoreCard();
}

function calculateScore() {
  const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
  const timePenalty = elapsedSeconds * 2;
  return Math.max(0, 10000 - timePenalty - totalPenalty);
}

function applyScorePenalty(evaluation) {
  const penalty = evaluation.reduce((total, status) => {
    if (status === "absent") return total + 100;
    if (status === "present") return total + 50;
    return total;
  }, 0);
  totalPenalty += penalty;
  currentScore = calculateScore();
}

function setKeyStatus(letter, status) {
  const key = keyboardEl.querySelector(`.key[data-key='${letter}']`);
  if (!key) return;

  const priority = { correct: 3, present: 2, absent: 1 };
  const existing = key.classList.contains("correct")
    ? "correct"
    : key.classList.contains("present")
      ? "present"
      : key.classList.contains("absent")
        ? "absent"
        : null;

  if (!existing || priority[status] > priority[existing]) {
    key.classList.remove("correct", "present", "absent");
    key.classList.add(status);
  }
}

function updateScoreCard() {
  const attemptsUsed = currentRow + (currentCol > 0 ? 1 : 0);
  if (attemptsValueEl) {
    attemptsValueEl.textContent = attemptsUsed.toString();
  }
  if (scoreValueEl) {
    scoreValueEl.textContent = currentScore.toString();
  }
  if (scoreUsernameEl) {
    scoreUsernameEl.textContent = currentUserEl.textContent || "-";
  }
}

// Word evaluation logic
function evaluateGuess(guess, target) {
  const result = Array(5).fill("absent");
  const targetLetters = target.split("");
  const guessLetters = guess.split("");

  guessLetters.forEach((letter, index) => {
    if (letter === targetLetters[index]) {
      result[index] = "correct";
      targetLetters[index] = null;
    }
  });

  guessLetters.forEach((letter, index) => {
    if (result[index] === "correct") return;
    const matchIndex = targetLetters.indexOf(letter);
    if (matchIndex !== -1) {
      result[index] = "present";
      targetLetters[matchIndex] = null;
    }
  });

  return result;
}

function applyGuess(guess, evaluation) {
  guess.split("").forEach((letter, index) => {
    updateCell(currentRow, index, letter, evaluation[index]);
    setKeyStatus(letter.toUpperCase(), evaluation[index]);
  });
}

function handleLetter(letter) {
  if (!gameActive) return;
  if (currentCol >= 5) return;
  board[currentRow][currentCol] = letter;
  updateCell(currentRow, currentCol, letter, null);
  currentCol += 1;
  updateScoreCard();
}

function handleBackspace() {
  if (!gameActive) return;
  if (currentCol === 0) return;
  currentCol -= 1;
  board[currentRow][currentCol] = "";
  updateCell(currentRow, currentCol, "", null);
  updateScoreCard();
}

async function handleEnter() {
  if (!gameActive) return;
  if (currentCol < 5) {
    setMessage("Enter a 5-letter word.");
    return;
  }

  const guess = board[currentRow].join("").toLowerCase();
  const evaluation = evaluateGuess(guess, targetWord);
  applyGuess(guess, evaluation);
  applyScorePenalty(evaluation);
  updateScoreCard();

  if (guess === targetWord) {
    await finishGame(true);
    return;
  }

  if (currentRow === 9) {
    await finishGame(false);
    return;
  }

  currentRow += 1;
  currentCol = 0;
  updateScoreCard();
}

async function finishGame(won) {
  gameActive = false;
  if (scoreTimerId) {
    clearInterval(scoreTimerId);
    scoreTimerId = null;
  }
  const attemptsUsed = currentRow + 1;
  currentScore = calculateScore();
  setMessage(
    won ? "You won!" : `You lost. The word was ${targetWord.toUpperCase()}.`,
  );
  updateScoreCard();

  try {
    await apiRequest("/api/game/result", {
      method: "POST",
      body: JSON.stringify({
        won,
        attemptsUsed,
        targetWord,
        score: currentScore,
      }),
    });
    await loadLeaderboard();
  } catch (error) {
    setMessage(error.message);
  }
}

async function startNewGame() {
  try {
    const data = await apiRequest("/api/game/new");
    targetWord = data.word.toLowerCase();
    resetGameState();
  } catch (error) {
    setMessage(error.message);
  }
}

async function loadLeaderboard() {
  try {
    const data = await apiRequest("/api/game/leaderboard");
    leaderboardBody.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = "<td colspan='4'>No results yet.</td>";
      leaderboardBody.appendChild(row);
      return;
    }

    data.results.forEach((result) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${result.username}</td>
        <td>${result.score}</td>
        <td>${result.attemptsUsed}</td>
        <td>${result.won ? "Won" : "Lost"}</td>
      `;
      leaderboardBody.appendChild(row);
    });
  } catch (error) {
    setMessage(error.message);
  }
}

async function restoreSession() {
  if (!authToken) {
    hideGame();
    updateScoreCard();
    return;
  }

  try {
    const data = await apiRequest("/api/auth/me");
    currentUserEl.textContent = data.username;
    updateScoreCard();
    showGame();
    await startNewGame();
    await loadLeaderboard();
  } catch (error) {
    console.log("Failed to restore session:", error);
    setToken(null);
    hideGame();
    updateScoreCard();
  }
}

function clearButtonFocus() {
  const active = document.activeElement;
  if (active && active.tagName === "BUTTON") {
    active.blur();
  }
}

loginTab.addEventListener("click", () => setAuthMode("login"));
registerTab.addEventListener("click", () => setAuthMode("register"));

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = {
    email: formData.get("email").trim(),
    password: formData.get("password").trim(),
  };

  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setToken(data.token);
    currentUserEl.textContent = data.username;
    updateScoreCard();
    showGame();
    setMessage("Login successful.");
    await startNewGame();
    await loadLeaderboard();
  } catch (error) {
    setMessage(error.message);
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const payload = {
    username: formData.get("username").trim(),
    email: formData.get("email").trim(),
    password: formData.get("password").trim(),
  };

  try {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setAuthMode("login");
    setMessage(data.message || "Registration successful. Please log in.");
    registerForm.reset();
  } catch (error) {
    setMessage(error.message);
  }
});

if (toRegisterBtn) {
  toRegisterBtn.addEventListener("click", () => setAuthMode("register"));
}
if (toLoginBtn) {
  toLoginBtn.addEventListener("click", () => setAuthMode("login"));
}

logoutBtn.addEventListener("click", () => {
  setToken(null);
  currentUserEl.textContent = "";
  currentScore = 10000;
  totalPenalty = 0;
  if (scoreTimerId) {
    clearInterval(scoreTimerId);
    scoreTimerId = null;
  }
  updateScoreCard();
  hideGame();
  setMessage("Logged out.");
});

newGameBtn.addEventListener("click", () => {
  clearButtonFocus();
  startNewGame();
});

keyboardEl.addEventListener("click", (event) => {
  const target = event.target.closest(".key");
  if (!target) return;
  clearButtonFocus();
  const key = target.dataset.key;
  if (key === "ENTER") {
    handleEnter();
  } else if (key === "BACK") {
    handleBackspace();
  } else {
    handleLetter(key.toLowerCase());
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const active = document.activeElement;
    if (active && active.tagName === "BUTTON") {
      event.preventDefault();
      active.blur();
      return;
    }
    handleEnter();
    return;
  }
  if (event.key === "Backspace") {
    handleBackspace();
    return;
  }
  if (/^[a-zA-Z]$/.test(event.key)) {
    handleLetter(event.key.toLowerCase());
  }
});

buildBoard();
buildKeyboard();
updateScoreCard();
restoreSession();
setAuthMode("login");
