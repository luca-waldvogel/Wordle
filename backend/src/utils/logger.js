function baseLog(level, message, context = {}) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  console.log(JSON.stringify(payload));
}

function serializeError(error) {
  if (!error) {
    return {};
  }

  return {
    errorName: error.name,
    errorMessage: error.message,
  };
}

function logInfo(message, context) {
  baseLog("info", message, context);
}

function logError(message, context) {
  baseLog("error", message, context);
}

module.exports = {
  logInfo,
  logError,
  serializeError,
};
