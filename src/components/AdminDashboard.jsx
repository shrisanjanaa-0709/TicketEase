
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

function AdminDashboard({ token, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("bookings");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [bookingResponse, userResponse] = await Promise.all([
          fetch(`${API}/api/admin/bookings`, { headers }),
          fetch(`${API}/api/admin/users`, { headers })
        ]);

        const bookingData = await bookingResponse.json();
        const userData = await userResponse.json();

        if (
          bookingResponse.status === 401 ||
          userResponse.status === 401
        ) {
          throw new Error("Your session expired. Please log in again.");
        }

        if (
          bookingResponse.status === 403 ||
          userResponse.status === 403
        ) {
          throw new Error("Admin access is required for this page.");
        }

        if (!bookingResponse.ok || !userResponse.ok) {
          throw new Error("Unable to load admin data.");
        }

        setBookings(bookingData);
        setUsers(userData);
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadDashboard();
    } else {
      setError("Please log in as an administrator.");
      setLoading(false);
    }
  }, [token]);

  const confirmedBookings = bookings.filter(
    (booking) => booking.status !== "cancelled"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  );

  const confirmedRevenue = confirmedBookings.reduce(
    (total, booking) => total + Number(booking.total || 0),
    0
  );

  return (
    <section className="section admin-dashboard">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TICKETEASE MANAGEMENT</span>
          <h2>Admin Dashboard</h2>
          <p className="section-subtitle">
            Manage bookings and view registered users.
          </p>
        </div>

        <button className="secondary-button" onClick={onBack}>
          Back to Events
        </button>
      </div>

      {loading && <p role="status">Loading admin dashboard...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-stats">
            <article className="admin-stat">
              <span>Total bookings</span>
              <strong>{bookings.length}</strong>
            </article>

            <article className="admin-stat">
              <span>Confirmed bookings</span>
              <strong>{confirmedBookings.length}</strong>
            </article>

            <article className="admin-stat">
              <span>Cancelled bookings</span>
              <strong>{cancelledBookings.length}</strong>
            </article>

            <article className="admin-stat">
              <span>Registered users</span>
              <strong>{users.length}</strong>
            </article>

            <article className="admin-stat">
              <span>Confirmed booking value</span>
              <strong>₹{confirmedRevenue}</strong>
            </article>
          </div>

          <div className="admin-tabs">
            <button
              className={
                view === "bookings"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setView("bookings")}
            >
              All Bookings
            </button>

            <button
              className={
                view === "users"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setView("users")}
            >
              Registered Users
            </button>
          </div>

          {view === "bookings" ? (
            <div className="admin-table-wrap">
              <h3>All Bookings</h3>

              {bookings.length === 0 ? (
                <p>No bookings have been created yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Customer</th>
                      <th>Event</th>
                      <th>Tickets</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.reference}>
                        <td>{booking.reference}</td>
                        <td>
                          {booking.name}
                          <br />
                          {booking.email}
                        </td>
                        <td>{booking.eventTitle}</td>
                        <td>{booking.quantity}</td>
                        <td>₹{booking.total}</td>
                        <td>
                          {booking.status === "cancelled"
                            ? "Cancelled"
                            : "Confirmed"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="admin-table-wrap">
              <h3>Registered Users</h3>

              {users.length === 0 ? (
                <p>No registered users found.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((registeredUser) => (
                      <tr key={registeredUser.id}>
                        <td>{registeredUser.name}</td>
                        <td>{registeredUser.email}</td>
                        <td>{registeredUser.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default AdminDashboard;
