module.exports = [
  {
    ignores: ["backend/node_modules/**"],
  },
  {
    files: ["backend/src/**/*.js", "backend/test/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        jest: "readonly",
        afterEach: "readonly",
      },
    },
    rules: {
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-redeclare": "error",
      "no-unreachable": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["frontend/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Date: "readonly",
        Math: "readonly",
      },
    },
    rules: {
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-redeclare": "error",
      "no-unreachable": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
