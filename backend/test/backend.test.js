const evaluateGuess = require("../src/utils/evaluateGuess");
const authMiddleware = require("../src/middleware/authMiddleware");
const seedWords = require("../src/utils/seedWords");
const Word = require("../src/models/Word");
const jwt = require("jsonwebtoken");

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe("evaluateGuess", () => {
  test("marks all letters correct on an exact match", () => {
    expect(evaluateGuess("apple", "apple")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  test("marks present letters when they are in the wrong position", () => {
    expect(evaluateGuess("grape", "peach")).toEqual([
      "absent",
      "absent",
      "correct",
      "present",
      "present",
    ]);
  });

  test("keeps letters absent when they do not exist in the target", () => {
    expect(evaluateGuess("zzzzz", "apple")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ]);
  });

  test("handles duplicate letters in the guess without overcounting", () => {
    expect(evaluateGuess("allee", "apple")).toEqual([
      "correct",
      "present",
      "absent",
      "absent",
      "correct",
    ]);
  });

  test("handles duplicate letters in the target without overcounting", () => {
    expect(evaluateGuess("eeeee", "eerie")).toEqual([
      "correct",
      "correct",
      "absent",
      "absent",
      "correct",
    ]);
  });
});

describe("authMiddleware", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("rejects requests without a valid bearer header", () => {
    for (const headers of [{}, { authorization: "Token abc" }]) {
      const req = { headers };
      const res = createResponse();
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ message: "Missing or invalid token." });
      expect(next).not.toHaveBeenCalled();
    }
  });

  test("attaches the decoded user when the token is valid", () => {
    jest.spyOn(jwt, "verify").mockReturnValue({
      id: "123",
      username: "alice",
      email: "alice@example.com",
    });

    const req = { headers: { authorization: "Bearer token-value" } };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.body).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      id: "123",
      username: "alice",
      email: "alice@example.com",
    });
  });

  test("rejects invalid tokens", () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid token");
    });

    const req = { headers: { authorization: "Bearer broken" } };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Invalid token." });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("seedWords", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("inserts the seed list when the collection is empty", async () => {
    const countSpy = jest.spyOn(Word, "countDocuments").mockResolvedValue(0);
    const insertSpy = jest.spyOn(Word, "insertMany").mockResolvedValue([]);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await seedWords();

    expect(countSpy).toHaveBeenCalledTimes(1);
    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(insertSpy.mock.calls[0][0]).toHaveLength(20);
    expect(insertSpy.mock.calls[0][0][0]).toEqual({ value: "apple" });
    expect(logSpy).toHaveBeenCalledWith("Seeded word list");
  });

  test("skips insertion when words already exist", async () => {
    const countSpy = jest.spyOn(Word, "countDocuments").mockResolvedValue(1);
    const insertSpy = jest.spyOn(Word, "insertMany").mockResolvedValue([]);

    await seedWords();

    expect(countSpy).toHaveBeenCalledTimes(1);
    expect(insertSpy).not.toHaveBeenCalled();
  });
});
