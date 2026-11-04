import express from "express";
import cors from "cors";
import events from "../src/data/events.js";
import "dotenv/config";
import mongoose from "mongoose";
import Event from "./models/Event.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import bcrypt from "bcryptjs";

const app = express();
const PORT = 5000;


const mongoClientPromise = (async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  return mongoose.connection.getClient();
})();


async function seedEvents() {
  for (const event of events) {
    await Event.updateOne(
      { id: event.id },
      { $setOnInsert: event },
      { upsert: true }
    );
  }

  console.log("✅ Initial events added to MongoDB");
}

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
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


function requireAdmin(req, res, next) {
  if (!req.session || req.session.admin !== true) {
    return res.status(401).json({
      error: "Authentication required. Please log in.",
    });
  }

  next();
}


app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({
    authenticated: true,
    username: process.env.ADMIN_USERNAME,
  });
});

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
    });

    res.json({
      message: "Admin logged out successfully",
    });
  });
});



app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});


app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findOne({
      id: Number(req.params.id),
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});


app.patch(
  "/api/events/:id/status",
  requireAdmin,
  async (req, res) => {
    const { adminStatus } = req.body;

    const allowedStatuses = ["automatic", "LIVE NOW", "ENDED"];

    if (!allowedStatuses.includes(adminStatus)) {
      return res.status(400).json({ error: "Invalid event status" });
    }

    try {
      const updatedEvent = await Event.findOneAndUpdate(
        { id: Number(req.params.id) },
        { $set: { adminStatus } },
        { returnDocument: "after", runValidators: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(updatedEvent);

    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);


const startServer = async () => {
  try {
    await mongoClientPromise;

    console.log("✅ Connected to MongoDB Atlas");
    await seedEvents();

    app.listen(PORT, () => {
      console.log(`Backend server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();