
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import AdminLogin from "./AdminLogin";
import events from "./data/events";
import EventCard from "./components/EventCard";
import { getEventStatus } from "./eventUtils";
import EventDetails from "./EventDetails";
import AdminPortal from "./AdminPage";

import "./App.css";

// Protect the Admin Portal
function ProtectedAdmin({ children }) {
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    fetch("/api/admin/me", {
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 401) {
          return false;
        }

        if (!response.ok) {
          throw new Error("Could not verify session");
        }

        return true;
      })
      .then((authenticated) => {
        if (active) {
          setAuthStatus(
            authenticated ? "authenticated" : "unauthenticated"
          );
        }
      })
      .catch((error) => {
        console.error("Authentication check failed:", error);

        if (active) {
          setAuthStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (authStatus === "checking") {
    return <p>Verifying administrator access...</p>;
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  if (authStatus === "error") {
    return (
      <div className="admin-page">
        <p className="error-state">
          Unable to verify login. Please check the backend.
        </p>
        <Link to="/">← Back to website</Link>
      </div>
    );
  }

  return children;
}

function App() {
  const [eventList, setEventList] = useState(events);
  const [now, setNow] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update event status in the backend
  const handleAdminStatusChange = async (eventId, newStatus) => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminStatus: newStatus }),
        }
      );

      if (response.status === 401) {
        throw new Error("Your admin session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Failed to update event status");
      }

      const updatedEvent = await response.json();

      setEventList((previousEvents) =>
        previousEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    } catch (error) {
      console.error("Status update failed:", error);
      alert(error.message);
    }
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch events from MongoDB through the backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setError("");

        const response = await fetch(
          "/api/events"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        setEventList(data);
      } catch (error) {
        console.error("Could not load events:", error);
        setError("Unable to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Categorize events according to their current status
  const liveEvents = eventList.filter(
    (event) => getEventStatus(event, now) === "LIVE NOW"
  );

  const startingSoonEvents = eventList.filter(
    (event) => getEventStatus(event, now) === "STARTING SOON"
  );

  const upcomingEvents = eventList.filter(
    (event) => getEventStatus(event, now) === "UPCOMING"
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Student Homepage */}
        <Route
          path="/"
          element={
            <div className="public-site">
              <div className="site-header">
                <h1>Campus Event Live Tracker</h1>

                <Link to="/admin" className="admin-link">
                  Admin Portal 
                </Link>
              </div>

              {loading ? (
                <p className="empty-state">Loading events...</p>
              ) : error ? (
                <p className="error-state">{error}</p>
              ) : (
                <div>
                  <section>
                    <h2>Happening Now</h2>

                    {liveEvents.length === 0 ? (
                      <p className="empty-state">
                        No events are happening right now.
                      </p>
                    ) : (
                      <div className="event-grid">
                        {liveEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <h2>Starting Soon</h2>

                    {startingSoonEvents.length === 0 ? (
                      <p className="empty-state">
                        No events are starting soon.
                      </p>
                    ) : (
                      <div className="event-grid">
                        {startingSoonEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  <section>
                    <h2>Upcoming Events</h2>

                    {upcomingEvents.length === 0 ? (
                      <p className="empty-state">
                        No upcoming events at the moment.
                      </p>
                    ) : (
                      <div className="event-grid">
                        {upcomingEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          }
        />

        {/* Individual Event Details */}
        <Route
          path="/events/:id"
          element={<EventDetails />}
        />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Protected Admin Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              {loading ? (
                <p className="empty-state">
                  Loading Admin Portal...
                </p>
              ) : error ? (
                <div className="admin-page">
                  <p className="error-state">{error}</p>
                  <Link to="/">← Back to website</Link>
                </div>
              ) : (
                <AdminPortal
                  events={eventList}
                  onAdminStatusChange={handleAdminStatusChange}
                />
              )}
            </ProtectedAdmin>
          }
        />

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
