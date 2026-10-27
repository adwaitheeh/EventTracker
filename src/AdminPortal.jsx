import { Link } from "react-router-dom";

function AdminPortal({ events, onAdminStatusChange }) {
    return (
        <div className="admin-page">
            <Link to="/">← Back to public website</Link>

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