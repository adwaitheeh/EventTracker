import events from "./data/events";
import EventCard from "./components/EventCard";
import { useEffect, useState } from "react";
import { getEventStatus } from "./eventUtils";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventDetails from "./EventDetails";
function App() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const liveEvents = events.filter((event) => getEventStatus(event, now) === "LIVE NOW");
  const startingSoonEvents = events.filter((event) => getEventStatus(event, now) === "STARTING SOON");
  const upcomingEvents = events.filter((event) => getEventStatus(event, now) === "UPCOMING");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>Campus Event Live Tracker</h1>

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

        <Route path="/events/:id" element={<EventDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;