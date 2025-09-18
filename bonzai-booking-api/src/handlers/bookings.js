console.log("Exports at startup:", module.exports);

const {
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const { docClient } = require("../lib/db");
const { randomUUID } = require("crypto");
const {
  CreateBookingSchema,
  validateBusinessRules,
  computePrice,
} = require("../lib/validation");

const { withErrorHandling } = require("../lib/handler");
const {
  ok,
  created,
  noContent,
  badRequest,
  notFound,
  serverError,
} = require("../lib/http");

const TABLE_NAME = process.env.TABLE_NAME;

// Create booking
async function create(event) {
  const raw = JSON.parse(event.body || "{}");

  const parsed = CreateBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }
  const input = parsed.data;

  const ruleCheck = validateBusinessRules(input);
  if (!ruleCheck.ok) {
    return badRequest(ruleCheck.message, { code: ruleCheck.code });
  }

  const id = randomUUID();
  const totalPrice = computePrice(input.nights ?? 1, input.rooms);
  const item = {
    id,
    ...input,
    currency: "SEK",
    totalPrice,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

  return created({
    message: "Booking created successfully",
    booking: item,
  });
}

// Get one booking by id
async function getOne(event) {
  const id = event.pathParameters?.id;
  if (!id) return badRequest("Missing booking id");

  const res = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  );

  if (!res.Item) return notFound(`Booking with id '${id}' not found`);
  return ok(res.Item);
}

// List all bookings
async function listAll() {
  const res = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  return ok(res.Items || []);
}

// Delete booking
async function remove(event) {
  const id = event.pathParameters?.id;
  if (!id) return badRequest("Missing booking id");

  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { id } })
  );
  return noContent();
}

// Update booking
async function update(event) {
  const id = event.pathParameters?.id;
  if (!id) return badRequest("Missing booking id");

  const raw = JSON.parse(event.body || "{}");
  const parsed = CreateBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }
  const input = parsed.data;

  const ruleCheck = validateBusinessRules(input);
  if (!ruleCheck.ok) {
    return badRequest(ruleCheck.message, { code: ruleCheck.code });
  }

  const totalPrice = computePrice(input.nights ?? 1, input.rooms);
  const updatedItem = {
    id,
    ...input,
    currency: "SEK",
    totalPrice,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({ TableName: TABLE_NAME, Item: updatedItem })
  );

  return ok({
    message: "Booking updated successfully",
    booking: updatedItem,
  });
}

module.exports = {
  create: withErrorHandling(create),
  getOne: withErrorHandling(getOne),
  listAll: withErrorHandling(listAll),
  remove: withErrorHandling(remove),
  update: withErrorHandling(update),
};
