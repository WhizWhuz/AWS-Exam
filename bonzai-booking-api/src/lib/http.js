function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// Success responses
const ok = (body) => response(200, body);
const created = (body) => response(201, body);
const noContent = () => response(204, "");

// Error responses
const badRequest = (message, details) =>
  response(400, { message, details, code: "BAD_REQUEST" });

const notFound = (message) => response(404, { message, code: "NOT_FOUND" });

const serverError = (message, code = "SERVER_ERROR") =>
  response(500, { message, code });

module.exports = {
  response,
  ok,
  created,
  noContent,
  badRequest,
  notFound,
  serverError,
};
