import { useParams } from "react-router-dom";
import events from "./data/events";
import { Link } from "react-router-dom";

function EventDetails() {
    const { id } = useParams();
    const event = events.find((event) => String(event.id) === id);
    if (!event) {
        return <h2>Event not found</h2>
    }

    return (
        <div>
            
<Link to="/">← Back to all events</Link>

            <h1>{event.name}</h1>

            <img
                src={event.poster}
                alt={event.name}
                style={{ width: "100%", maxWidth: "500px" }}
            />

            <p>Date: {event.date}</p>
            <p>Time: {event.startTime} - {event.endTime}</p>
            <p>Venue: {event.venue}</p>
            <p>Performer: {event.performer}</p>
            <p>Category: {event.category}</p>
            <p>{event.description}</p>
        </div>
    );
}

export default EventDetails;