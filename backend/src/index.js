const dotenv = require("dotenv");
const { logInfo, logError } = require("./utils/logger");
const { startServer, validateRequiredEnv } = require("./server");

dotenv.config();

const missing = validateRequiredEnv();
if (missing.length > 0) {
  logError("Missing required environment variables", { missing });
  logError("Environment setup required", {
    messageDetail: "Create backend/.env based on backend/.env.example",
  });
  process.exit(1);
}

startServer()
  .then(() => {
    logInfo("Application boot complete");
  })
  .catch((error) => {
    if (error.missing) {
      logError("Missing required environment variables", {
        missing: error.missing,
      });
      process.exit(1);
    }

    logError("Application failed to start", { errorMessage: error.message });
    process.exit(1);
  });
