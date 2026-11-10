
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/events/${id}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Event not found"
              : "Failed to fetch event details"
          );
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

  return (
    <main className="event-details-shell">

      {loading ? (
        <div className="details-message">
          <p>Loading event details...</p>
        </div>
      ) : error || !event ? (
        <div className="details-message">
          <p className="details-error">
            {error || "Event not found"}
          </p>

          <Link to="/" className="details-back-button">
            ← Back to events
          </Link>
        </div>
      ) : (
        <div className="details-page">

          <Link to="/" className="details-back-button">
            <span>←</span> Back to all events
          </Link>

          <div className="details-top-label">
            CAMPUS EVENT / EVENT DETAILS
          </div>

          <article className="event-details-card">

            <div className="details-image-wrapper">
              {event.poster ? (
                <img
                  src={event.poster}
                  alt={event.name}
                  className="event-details-poster"
                />
              ) : (
                <div className="details-image-placeholder">
                  <span>CE</span>
                  <p>Campus Event</p>
                </div>
              )}

              <div className="details-image-overlay"></div>

              <div className="details-image-title">
                <span>FEATURED CAMPUS EVENT</span>
                <h1>{event.name}</h1>
              </div>
            </div>

            <div className="event-details-content">

              {event.category && (
                <span className="details-category">
                  {event.category}
                </span>
              )}

              <div className="details-section-heading">
                <h2>Event Information</h2>
                <span className="details-accent-line"></span>
              </div>

              {event.description && (
                <p className="event-details-description">
                  {event.description}
                </p>
              )}

              <div className="event-details-grid">

                <div className="detail-item">
                  <span>EVENT DATE</span>
                  <strong>{event.date}</strong>
                </div>

                <div className="detail-item">
                  <span>EVENT TIME</span>
                  <strong>
                    {event.startTime} – {event.endTime}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>VENUE</span>
                  <strong>{event.venue || "Not specified"}</strong>
                </div>

                <div className="detail-item">
                  <span>PERFORMER</span>
                  <strong>{event.performer || "Not specified"}</strong>
                </div>

              </div>

              <div className="details-footer">
                <span>Campus Event Live Tracker</span>
                <span>DISCOVER. PARTICIPATE. EXPERIENCE.</span>
              </div>

            </div>

          </article>

        </div>
      )}

    </main>
  );
}

export default EventDetails;
