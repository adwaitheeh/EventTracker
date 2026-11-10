
import { useEffect, useState } from "react";
import "./EventCard.css";
import { getEventStatus, getTimeRemaining } from "../eventUtils";
import { Link } from "react-router-dom";

function EventCard({ event }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const status = getEventStatus(event, now);
  const remaining = getTimeRemaining(event, now);

  const statusClass = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link to={`/events/${event.id}`} className="event-card">

      <div className="event-card-image">
        <img
          src={event.poster}
          alt={event.name}
          loading="lazy"
        />
      </div>

      <div className="event-card-content">

        <div className="event-card-badges">
          <span className={`status ${statusClass}`}>
            {status}
          </span>

          {event.category && (
            <span className="event-category">
              {event.category}
            </span>
          )}
        </div>

        <h2>{event.name}</h2>

        <div className="event-card-meta">

          <div className="event-card-meta-item">
            <span>Date</span>
            <strong>{event.date}</strong>
          </div>

          <div className="event-card-meta-item">
            <span>Time</span>
            <strong>
              {event.startTime} – {event.endTime}
            </strong>
          </div>

          <div className="event-card-meta-item">
            <span>Venue</span>
            <strong>{event.venue || "Not specified"}</strong>
          </div>

          <div className="event-card-meta-item">
            <span>Performer</span>
            <strong>{event.performer || "Not specified"}</strong>
          </div>

        </div>

        {status === "UPCOMING" && remaining && (
          <p className="countdown">
            Starts in: {remaining.days}d {remaining.hours}h{" "}
            {remaining.minutes}m {remaining.seconds}s
          </p>
        )}

        {event.description && (
          <p className="event-description">
            {event.description}
          </p>
        )}

        <div className="event-card-footer">
          <span>View event details</span>
          <span>→</span>
        </div>

      </div>
    </Link>
  );
}

export default EventCard;
