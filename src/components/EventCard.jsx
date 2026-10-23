import { useEffect, useState } from "react";
import "./EventCard.css";
import { getEventStatus , getTimeRemaining } from "../eventUtils";
import { Link } from "react-router-dom";

function getStatusLabel(status) {

    if (status === "LIVE NOW") {
        return "🟢 LIVE NOW";
    }
    if (status === "STARTING SOON") {
        return "🟡 STARTING SOON";
    }

    if (status === "UPCOMING") {
        return "🔵 UPCOMING";
    }

    return "🔴 ENDED";
}

function EventCard({ event }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const status = getEventStatus(event, now);
    const statusLabel = getStatusLabel(status);
    const remaining = getTimeRemaining(event, now);
    const statusClass = status.toLocaleLowerCase().replace(" ", "-");

    return (
        <Link to={`/events/${event.id}`} className="event-card">
            <img
                src={event.poster}
                alt={event.name}
            />
            <h2>{event.name}</h2>

            <p className={`status ${statusClass}`}>Status: {statusLabel}</p>
            {status ==="UPCOMING"&& remaining && (
                <p className="countdown">
                    Starts in: {remaining.days}d {remaining.hours}h{" "}
                    {remaining.minutes}m {remaining.seconds}s
                </p>
            )}

            <p>Date: {event.date}</p>
            <p>Time: {event.startTime} - {event.endTime}</p>
            <p>Venue: {event.venue}</p>
            <p>Performer: {event.performer}</p>
            <p>Category: {event.category}</p>
            <p>{event.description}</p>
        </Link>
    );
}

export default EventCard;