const { z } = require("zod");

// Business rules
const ROOM_CAPACITY = { single: 1, double: 2, suite: 3 };
const ROOM_PRICE = { single: 500, double: 1000, suite: 1500 };
const MAX_ROOMS_PER_BOOKING = 20;

// Shape of a single room item
const RoomItem = z.object({
  type: z.enum(["single", "double", "suite"]),
  count: z.number().int().min(0),
});

// Booking input schema
const CreateBookingSchema = z.object({
  guests: z.number().int().positive(),
  nights: z.number().int().positive().default(1),
  rooms: z.array(RoomItem).nonempty(),
  contact: z
    .object({
      name: z.string().min(1).max(120),
      email: z.string().email().optional(),
      phone: z.string().min(5).max(40).optional(),
    })
    .optional(),
});

// Helpers
function computeCapacity(rooms) {
  return rooms.reduce((sum, r) => sum + ROOM_CAPACITY[r.type] * r.count, 0);
}

function computeTotalRooms(rooms) {
  return rooms.reduce((sum, r) => sum + r.count, 0);
}

function computePrice(nights, rooms) {
  const perNight = rooms.reduce(
    (sum, r) => sum + ROOM_PRICE[r.type] * r.count,
    0
  );
  return perNight * nights;
}

// Validate business rules beyond just schema
function validateBusinessRules(input) {
  const capacity = computeCapacity(input.rooms);
  const totalRooms = computeTotalRooms(input.rooms);

  if (totalRooms > MAX_ROOMS_PER_BOOKING) {
    return {
      ok: false,
      statusCode: 400,
      message: `Too many rooms requested: ${totalRooms} (max ${MAX_ROOMS_PER_BOOKING}).`,
      code: "TOO_MANY_ROOMS",
    };
  }

  if (capacity !== input.guests) {
    return {
      ok: false,
      statusCode: 400,
      message: `Guest count (${input.guests}) must exactly match room capacity (${capacity}).`,
      code: "CAPACITY_MISMATCH",
    };
  }

  return { ok: true };
}

module.exports = {
  ROOM_CAPACITY,
  ROOM_PRICE,
  MAX_ROOMS_PER_BOOKING,
  CreateBookingSchema,
  computeCapacity,
  computePrice,
  validateBusinessRules,
};
