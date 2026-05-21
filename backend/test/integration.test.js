const mongoose = require("mongoose");

const User = require("../src/models/User");
const GameResult = require("../src/models/GameResult");
const Word = require("../src/models/Word");
const {
  createApp,
  connectToDatabase,
  initializeAppData,
} = require("../src/server");

jest.setTimeout(60000);

let mongoUri;
let server;
let baseUrl;

async function waitForDatabase(uri) {
  const timeoutAt = Date.now() + 30000;
  let lastError;

  while (Date.now() < timeoutAt) {
    try {
      await mongoose.connect(uri);
      await mongoose.disconnect();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error("MongoDB did not become ready in time.");
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });

  const body = await response.json();
  return { status: response.status, body };
}

async function createUserAndLogin({
  username = "alice",
  email = "alice@example.com",
  password = "Secret123!",
} = {}) {
  const registration = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

  expect(registration.status).toBe(201);

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  expect(login.status).toBe(200);
  expect(login.body.token).toEqual(expect.any(String));

  return login.body.token;
}

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "integration-test-secret";
  mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Integration tests require MONGO_URI to be set.");
  }
  process.env.MONGO_URI = mongoUri;

  await waitForDatabase(mongoUri);
  await connectToDatabase(mongoUri);
  await initializeAppData();

  const app = createApp();
  server = await new Promise((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

beforeEach(async () => {
  await User.deleteMany({});
  await GameResult.deleteMany({});
  await Word.deleteMany({});
  await initializeAppData();
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await mongoose.disconnect();
});

describe("integration: auth flow", () => {
  test("registers, logs in, and reads the current user", async () => {
    const token = await createUserAndLogin();

    const me = await request("/api/auth/me", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(me.status).toBe(200);
    expect(me.body).toEqual({
      username: "alice",
      email: "alice@example.com",
    });

    const storedUser = await User.findOne({
      email: "alice@example.com",
    }).lean();
    expect(storedUser).toMatchObject({
      username: "alice",
      email: "alice@example.com",
    });
    expect(storedUser.passwordHash).not.toBe("Secret123!");
  });
});

describe("integration: game flow", () => {
  test("starts a game, stores results, and returns a sorted leaderboard", async () => {
    const token = await createUserAndLogin({
      username: "bob",
      email: "bob@example.com",
      password: "Secret123!",
    });

    const newGame = await request("/api/game/new", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(newGame.status).toBe(200);
    expect(newGame.body.word).toEqual(expect.any(String));
    expect(newGame.body.word).toHaveLength(newGame.body.length);

    const firstResult = await request("/api/game/result", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        won: true,
        attemptsUsed: 3,
        targetWord: newGame.body.word,
        score: 120,
      }),
    });

    expect(firstResult.status).toBe(201);

    await GameResult.create({
      username: "carol",
      won: true,
      attemptsUsed: 2,
      targetWord: "apple",
      score: 180,
    });

    const leaderboard = await request("/api/game/leaderboard", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(leaderboard.status).toBe(200);
    expect(leaderboard.body.results).toHaveLength(2);
    expect(leaderboard.body.results.map((entry) => entry.username)).toEqual([
      "carol",
      "bob",
    ]);
    expect(leaderboard.body.results.map((entry) => entry.score)).toEqual([
      180, 120,
    ]);
  });
});
