
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const JWT_SECRET =
  process.env.JWT_SECRET || "ticketease-development-secret-change-me";

// Event data
const events = [
  {
    id: 1,
    title: "Tech Innovation Summit",
    category: "Technology",
    date: "2026-11-15",
    time: "10:00 AM",
    venue: "KCT Auditorium, Coimbatore",
    price: 299,
    emoji: "💻",
    description: "Explore new technologies and meet innovators."
  },
  {
    id: 2,
    title: "Live Music Night",
    category: "Music",
    date: "2026-11-20",
    time: "6:00 PM",
    venue: "Open Air Theatre, Coimbatore",
    price: 499,
    emoji: "🎸",
    description: "Enjoy an evening filled with music."
  },
  {
    id: 3,
    title: "Startup Pitch Fest",
    category: "Business",
    date: "2026-11-25",
    time: "11:00 AM",
    venue: "Innovation Centre, Coimbatore",
    price: 199,
    emoji: "🚀",
    description: "Discover startup ideas and entrepreneurship."
  },
  {
    id: 4,
    title: "Photography Workshop",
    category: "Workshop",
    date: "2026-12-02",
    time: "2:00 PM",
    venue: "Creative Studio, Coimbatore",
    price: 149,
    emoji: "📸",
    description: "Learn photography basics and creative techniques."
  },
  {
    id: 5,
    title: "Campus Cultural Fest",
    category: "Music",
    date: "2026-12-10",
    time: "5:00 PM",
    venue: "College Ground, Coimbatore",
    price: 249,
    emoji: "🎉",
    description: "Celebrate music, dance and campus culture."
  },
  {
    id: 6,
    title: "AI and Future Workshop",
    category: "Technology",
    date: "2026-12-15",
    time: "9:30 AM",
    venue: "Seminar Hall, Coimbatore",
    price: 199,
    emoji: "🤖",
    description: "Learn about AI applications and future careers."
  }
];

// Temporary in-memory storage
const bookings = [];
const users = [];

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to continue."
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (error, decodedUser) => {
    if (error) {
      return res.status(401).json({
        message: "Your session is invalid or expired. Please log in again."
      });
    }

    req.user = decodedUser;
    next();
  });
}

// Admin-only middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Administrator access is required."
    });
  }

  next();
}

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Enter a name, valid email, and password of at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((user) => user.email === normalizedEmail)) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      // Demo rule only. Secure admin creation before production.
      role:
        normalizedEmail === "admin@ticketease.com"
          ? "admin"
          : "user"
    };

    users.push(user);

    return res.status(201).json({
      message: "Registration successful. You can now log in."
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed."
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(
      (item) => item.email === normalizedEmail
    );

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed."
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "TicketEase backend is running!"
  });
});

// List events
app.get("/api/events", (req, res) => {
  res.json(events);
});

// Get only the logged-in user's bookings
app.get("/api/bookings", authenticateToken, (req, res) => {
  const userBookings = bookings.filter(
    (booking) => booking.userId === req.user.id
  );

  res.json(userBookings);
});

// Create a booking
app.post("/api/bookings", authenticateToken, (req, res) => {
  const { name, email, quantity, eventId } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 1 ||
    Number(quantity) > 10
  ) {
    return res.status(400).json({
      message: "Enter a valid name, email, and quantity from 1 to 10."
    });
  }

  const event = events.find(
    (item) => item.id === Number(eventId)
  );

  if (!event) {
    return res.status(404).json({
      message: "Event not found."
    });
  }

  const booking = {
    reference: `TE-${Date.now().toString().slice(-8)}-${Math.floor(
      Math.random() * 1000
    )}`,
    userId: req.user.id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    quantity: Number(quantity),
    eventId: event.id,
    eventTitle: event.title,
    price: event.price,
    total: event.price * Number(quantity),
    bookedAt: new Date().toISOString(),
    status: "confirmed"
  };

  bookings.unshift(booking);

  return res.status(201).json({
    message: "Booking created successfully.",
    booking
  });
});

// Cancel a booking belonging to the logged-in user
app.delete(
  "/api/bookings/:reference",
  authenticateToken,
  (req, res) => {
    const bookingIndex = bookings.findIndex(
      (booking) =>
        booking.reference === req.params.reference &&
        booking.userId === req.user.id
    );

    if (bookingIndex === -1) {
      return res.status(404).json({
        message: "Booking not found."
      });
    }

    const booking = bookings[bookingIndex];

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "This booking has already been cancelled."
      });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date().toISOString();

    return res.json({
      message: "Booking cancelled successfully.",
      booking
    });
  }
);

// Admin: view all bookings
app.get(
  "/api/admin/bookings",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    res.json(bookings);
  }
);

// Admin: view registered users without password hashes
app.get(
  "/api/admin/users",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const safeUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }));

    res.json(safeUsers);
  }
);

// Start the server when run directly.
// Export the app for automated tests.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `TicketEase backend running at http://localhost:${PORT}`
    );
  });
}

module.exports = app;
