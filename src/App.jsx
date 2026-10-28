import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import events from "./data/events";
import EventCard from "./components/EventCard";
import { getEventStatus } from "./eventUtils";
import EventDetails from "./EventDetails";
import AdminPortal from "./AdminPage";

import "./App.css";

function App() {
  const [eventList, setEventList] = useState(events);
  const [now, setNow] = useState(new Date());

  const handleAdminStatusChange = (eventId, newStatus) => {
    setEventList((previousEvents) =>
      previousEvents.map((event) =>
        event.id === eventId
          ? { ...event, adminStatus: newStatus }
          : event
      )
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
        <Route
          path="/"
          element={
            <div>
              <div className="site-header">
                <h1>Campus Event Live Tracker</h1>

                <Link to="/admin" className="admin-link">
                  Admin Portal →
                </Link>
              </div>

              <section>
                <h2>Happening Now</h2>

                {liveEvents.length === 0 ? (
                  <p className="empty-state">
                    No events are happening right now.
                  </p>
                ) : (
                  <div className="event-grid">
                    {liveEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
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
                      <EventCard key={event.id} event={event} />
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
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          }
        />

        <Route
          path="/events/:id"
          element={<EventDetails />}
        />

        <Route
          path="/admin"
          element={
            <AdminPortal
              events={eventList}
              onAdminStatusChange={handleAdminStatusChange}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;