
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    poster: {
      type: String,
      default: "",
    },

    date: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    venue: String,
    performer: String,
    category: String,
    description: String,

    adminStatus: {
      type: String,
      enum: ["automatic", "LIVE NOW", "ENDED"],
      default: "automatic",
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
