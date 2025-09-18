const {
  ROOM_CAPACITY,
  ROOM_PRICE,
  MAX_ROOMS_PER_BOOKING,
} = require("../lib/validation");

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Return rules about rooms and pricing
async function getRules() {
  return json(200, {
    types: [
      {
        type: "single",
        capacity: ROOM_CAPACITY.single,
        pricePerNightSEK: ROOM_PRICE.single,
      },
      {
        type: "double",
        capacity: ROOM_CAPACITY.double,
        pricePerNightSEK: ROOM_PRICE.double,
      },
      {
        type: "suite",
        capacity: ROOM_CAPACITY.suite,
        pricePerNightSEK: ROOM_PRICE.suite,
      },
    ],
    maxRoomsPerBooking: MAX_ROOMS_PER_BOOKING,
    notes:
      "Guests must exactly match total capacity of chosen rooms. Dates are optional and not enforced for availability.",
  });
}

module.exports = { getRules };
