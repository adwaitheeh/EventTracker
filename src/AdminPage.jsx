
import { Link, useNavigate } from "react-router-dom";

function AdminPortal({ events, onAdminStatusChange }) {
  const navigate = useNavigate();

  const liveCount = events.filter(
    (event) => event.adminStatus === "LIVE NOW"
  ).length;

  const endedCount = events.filter(
    (event) => event.adminStatus === "ENDED"
  ).length;

  const automaticCount = events.filter(
    (event) => event.adminStatus === "automatic"
  ).length;

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Could not log out. Please try again.");
    }
  };

  return (
    <div className="admin-shell">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <Link to="/" className="admin-brand">
          <span className="admin-brand-icon">CE</span>

          <span className="admin-brand-text">
            <strong>Campus Events</strong>
            <small>Management console</small>
          </span>
        </Link>

        <div className="admin-nav-label">WORKSPACE</div>

        <nav className="admin-navigation">
          <a href="#overview" className="admin-nav-link active">
            <span className="nav-icon">▦</span>
            Overview
          </a>

          <a href="#events" className="admin-nav-link">
            <span className="nav-icon">▤</span>
            Manage Events
          </a>

          <Link to="/" className="admin-nav-link">
            <span className="nav-icon">↗</span>
            Public Website
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">A</div>

            <div className="admin-user-info">
              <strong>Administrator</strong>
              <span>Event Manager</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            <span>↪</span> Sign Out
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">

        {/* TOP HEADER */}
        <header className="admin-topbar">
          <div>
            <div className="admin-breadcrumb">
              WORKSPACE / ADMINISTRATION
            </div>

            <h1>Event Management</h1>

            <p>
              Monitor campus activities and manage event visibility.
            </p>
          </div>

          <div className="admin-session-badge">
            <span></span>
            Secure Session
          </div>
        </header>

        {/* OVERVIEW */}
        <section id="overview" className="admin-overview">

          <div className="admin-section-heading">
            <div>
              <h2>Overview</h2>
              <p>Your campus event summary.</p>
            </div>
          </div>

          <div className="admin-stats-grid">

            <div className="admin-stat-card">
              <div className="admin-stat-icon">▤</div>
              <span>Total Events</span>
              <strong>{events.length}</strong>
              <small>Events in database</small>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon live-icon">●</div>
              <span>Force Live</span>
              <strong>{liveCount}</strong>
              <small>Manually marked live</small>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon auto-icon">◷</div>
              <span>Automatic</span>
              <strong>{automaticCount}</strong>
              <small>Using scheduled status</small>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon ended-icon">✓</div>
              <span>Marked Ended</span>
              <strong>{endedCount}</strong>
              <small>Manually marked ended</small>
            </div>

          </div>
        </section>

        {/* EVENT MANAGEMENT */}
        <section id="events" className="admin-events-section">

          <div className="admin-section-heading">
            <div>
              <div className="admin-breadcrumb">CONTENT MANAGEMENT</div>
              <h2>Campus Events</h2>
              <p>Manage the status and visibility of your events.</p>
            </div>

            <span className="admin-record-count">
              {events.length} Records
            </span>
          </div>

          <div className="admin-event-list">

            {events.length === 0 ? (
              <div className="admin-empty-state">
                No events available.
              </div>
            ) : (
              events.map((event) => (

                <article className="admin-event-row" key={event.id}>

                  <div className="admin-event-identity">

                    {event.poster ? (
                      <img
                        src={event.poster}
                        alt={event.name}
                        className="admin-event-thumbnail"
                      />
                    ) : (
                      <div className="admin-event-thumbnail placeholder">
                        CE
                      </div>
                    )}

                    <div className="admin-event-info">

                      <span className="admin-event-id">
                        EVENT #{String(event.id).padStart(3, "0")}
                      </span>

                      <h3>{event.name}</h3>

                      <p>
                        {event.date} · {event.venue || "Venue not specified"}
                      </p>

                    </div>
                  </div>

                  <div className="admin-event-controls">

                    <div className="admin-current-status">
                      <span className="admin-control-label">
                        CURRENT SETTING
                      </span>

                      <span
                        className={`admin-status-pill ${
                          event.adminStatus === "LIVE NOW"
                            ? "manual-live"
                            : event.adminStatus === "ENDED"
                            ? "manual-ended"
                            : "manual-auto"
                        }`}
                      >
                        {event.adminStatus === "LIVE NOW"
                          ? "Force Live"
                          : event.adminStatus === "ENDED"
                          ? "Marked Ended"
                          : "Automatic"}
                      </span>
                    </div>

                    <div className="admin-select-wrapper">

                      <label
                        htmlFor={`status-${event.id}`}
                        className="admin-control-label"
                      >
                        CHANGE STATUS
                      </label>

                      <select
                        id={`status-${event.id}`}
                        value={event.adminStatus}
                        onChange={(e) =>
                          onAdminStatusChange(
                            event.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="automatic">
                          Automatic
                        </option>

                        <option value="LIVE NOW">
                          Force Live
                        </option>

                        <option value="ENDED">
                          Mark Ended
                        </option>
                      </select>

                    </div>

                  </div>

                </article>

              ))
            )}

          </div>
        </section>

        <footer className="admin-footer">
          Campus Event Live Tracker
          <span>Administration Console</span>
        </footer>

      </main>
    </div>
  );
}

export default AdminPortal;
