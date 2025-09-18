const { serverError } = require("./http");

function withErrorHandling(fn) {
  return async (event) => {
    try {
      return await fn(event);
    } catch (err) {
      console.error("Unhandled error:", err);
      return serverError("Unexpected error occurred", "UNHANDLED_ERROR");
    }
  };
}

module.exports = { withErrorHandling };
