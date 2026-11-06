
const request = require("supertest");
const app = require("./server");

describe("TicketEase API Tests", () => {
  test("GET / should confirm that the backend is running", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "TicketEase backend is running!"
    );
  });

  test("GET /api/events should return six events", async () => {
    const response = await request(app).get("/api/events");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(6);
    expect(response.body[0].title).toBe("Tech Innovation Summit");
  });

  test("GET /api/bookings should return a list", async () => {
    const response = await request(app).get("/api/bookings");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /api/bookings should create a valid booking", async () => {
    const response = await request(app)
      .post("/api/bookings")
      .send({
        name: "Test User",
        email: "test@example.com",
        quantity: 2,
        eventId: 1
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.booking.name).toBe("Test User");
    expect(response.body.booking.quantity).toBe(2);
    expect(response.body.booking.total).toBe(598);
  });

  test("POST /api/bookings should reject an invalid email", async () => {
    const response = await request(app)
      .post("/api/bookings")
      .send({
        name: "Test User",
        email: "invalid-email",
        quantity: 1,
        eventId: 1
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  test("POST /api/bookings should reject an invalid quantity", async () => {
    const response = await request(app)
      .post("/api/bookings")
      .send({
        name: "Test User",
        email: "test@example.com",
        quantity: 11,
        eventId: 1
      });

    expect(response.statusCode).toBe(400);
  });

  test("POST /api/bookings should reject a nonexistent event", async () => {
    const response = await request(app)
      .post("/api/bookings")
      .send({
        name: "Test User",
        email: "test@example.com",
        quantity: 1,
        eventId: 999
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Event not found.");
  });
});
