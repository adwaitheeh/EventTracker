
import { Link, useNavigate } from "react-router-dom";

function AdminPortal({ events, onAdminStatusChange }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/logout",
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
    <div className="admin-page">
      <div className="admin-header">
        <Link to="/">← Back to public website</Link>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>

      <h1>Admin Portal</h1>
      <p>Manage the status of campus events.</p>

      {events.map((event) => (
        <div className="admin-event" key={event.id}>
          <h2>{event.name}</h2>

          <p>Date: {event.date}</p>
          <p>Current setting: {event.adminStatus}</p>

          <label htmlFor={`status-${event.id}`}>
            Change event status:
          </label>

          <select
            id={`status-${event.id}`}
            value={event.adminStatus}
            onChange={(e) =>
              onAdminStatusChange(event.id, e.target.value)
            }
          >
            <option value="automatic">Automatic</option>
            <option value="LIVE NOW">Force Live</option>
            <option value="ENDED">Mark Ended</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default AdminPortal;
