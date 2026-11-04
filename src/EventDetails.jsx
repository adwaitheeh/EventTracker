import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function EventDetails() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/events/${id}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch events");
                }

                const data = await response.json();
                setEvent(data);
                
            } catch (error) {
                console.error("Could not load event:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [id]);


    if (loading) {
        return <p>Loading event details...</p>;
    }

    if (error) {
        return (
            <div className="admin-page">
                <p className="error-state">{error}</p>
                <Link to="/">← Back to events</Link>
            </div>
        );
    }

    if (!event) {
        return <p>Event not found.</p>;
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