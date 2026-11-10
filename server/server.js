
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import events from "../src/data/events.js";
import Event from "./models/Event.js";

// ----------------------------------
// APP CONFIGURATION
// ----------------------------------

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const distPath = path.join(projectRoot, "dist");

// Render runs behind a reverse proxy.
// Trust the first proxy so secure cookies work correctly.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ----------------------------------
// ENVIRONMENT VALIDATION
// ----------------------------------

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing");
}

// ----------------------------------
// MONGODB CONNECTION
// ----------------------------------

const mongoClientPromise = mongoose
  .connect(process.env.MONGO_URI)
  .then(() => mongoose.connection.getClient());

// ----------------------------------
// INITIAL EVENT SEEDING
// ----------------------------------

async function seedEvents() {
  for (const event of events) {
    await Event.updateOne(
      { id: event.id },
      { $setOnInsert: event },
      { upsert: true }
    );
  }

  console.log("✅ Initial events checked");
}

// ----------------------------------
// MIDDLEWARE
// ----------------------------------

app.use(express.json());

// Serve the React production build.
app.use(express.static(distPath));

// Session configuration
app.use(
  session({
    name: "campus.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      clientPromise: mongoClientPromise,
      collectionName: "sessions",
      ttl: 8 * 60 * 60,
    }),

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

// ----------------------------------
// HEALTH CHECK
// ----------------------------------

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "connecting",
    database: connected ? "connected" : "unavailable",
  });
});

// ----------------------------------
// ADMIN LOGIN
// ----------------------------------

app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password
  ) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  try {
    const savedUsername = process.env.ADMIN_USERNAME;
    const savedHash = process.env.ADMIN_PASSWORD_HASH;

    if (!savedUsername || !savedHash) {
      return res.status(500).json({
        error: "Admin credentials are not configured",
      });
    }

    const usernameValid = username === savedUsername;

    const passwordValid = await bcrypt.compare(
      password,
      savedHash
    );

    if (!usernameValid || !passwordValid) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error("Session creation failed:", error);

        return res.status(500).json({
          error: "Could not create login session",
        });
      }

      req.session.admin = true;

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save failed:", saveError);

          return res.status(500).json({
            error: "Could not save login session",
          });
        }

        res.json({
          message: "Admin login successful",
        });
      });
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      error: "Login failed",
    });
  }
});

// ----------------------------------
// ADMIN AUTHENTICATION MIDDLEWARE
// ----------------------------------

function requireAdmin(req, res, next) {
  if (!req.session || req.session.admin !== true) {
    return res.status(401).json({
      error: "Authentication required. Please log in.",
    });
  }

  next();
}

// ----------------------------------
// CHECK ADMIN SESSION
// ----------------------------------

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({
    authenticated: true,
    username: process.env.ADMIN_USERNAME,
  });
});

// ----------------------------------
// ADMIN LOGOUT
// ----------------------------------

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout failed:", error);

      return res.status(500).json({
        error: "Could not log out",
      });
    }

    res.clearCookie("campus.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.json({
      message: "Admin logged out successfully",
    });
  });
});

// ----------------------------------
// GET ALL EVENTS
// ----------------------------------

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);

    res.status(500).json({
      error: "Failed to fetch events",
    });
  }
});

// ----------------------------------
// GET INDIVIDUAL EVENT
// ----------------------------------

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findOne({
      id: Number(req.params.id),
    });

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);

    res.status(500).json({
      error: "Failed to fetch event",
    });
  }
});

// ----------------------------------
// UPDATE EVENT STATUS (ADMIN ONLY)
// ----------------------------------

app.patch(
  "/api/events/:id/status",
  requireAdmin,
  async (req, res) => {
    const { adminStatus } = req.body;

    const allowedStatuses = [
      "automatic",
      "LIVE NOW",
      "ENDED",
    ];

    if (!allowedStatuses.includes(adminStatus)) {
      return res.status(400).json({
        error: "Invalid event status",
      });
    }

    try {
      const updatedEvent = await Event.findOneAndUpdate(
        { id: Number(req.params.id) },
        { $set: { adminStatus } },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

      if (!updatedEvent) {
        return res.status(404).json({
          error: "Event not found",
        });
      }

      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);

      res.status(500).json({
        error: "Failed to update event",
      });
    }
  }
);

// ----------------------------------
// REACT ROUTER FALLBACK
// ----------------------------------

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    return res.sendFile(
      path.join(distPath, "index.html"),
      (error) => {
        if (error) next(error);
      }
    );
  }

  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "API endpoint not found",
    });
  }

  next();
});

// ----------------------------------
// START SERVER
// ----------------------------------

// Start listening immediately, then finish database initialization.
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
});

async function initializeDatabase() {
  try {
    await mongoClientPromise;

    console.log("✅ Connected to MongoDB Atlas");

    await seedEvents();

    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ MongoDB initialization failed:", error);

    server.close(() => {
      process.exit(1);
    });
  }
}

initializeDatabase();
