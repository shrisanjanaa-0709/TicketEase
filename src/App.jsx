
import AuthForm from "./components/AuthForm";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import EventCard from "./components/EventCard";
import BookingModal from "./components/BookingModal";
import TicketQR from "./components/TicketQR";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ticketeaseUser")) || null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("ticketeaseToken") || ""
  );

  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [message, setMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancellingReference, setCancellingReference] = useState("");

  useEffect(() => {
    fetch(`${API}/api/events`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load events");
        return response.json();
      })
      .then(setEvents)
      .catch(() => setError("Unable to load events. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  async function loadBookings(token = authToken) {
    if (!token) {
      setBookings([]);
      setMessage("Please log in to view your bookings.");
      setShowAuth(true);
      setShowBookings(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      setBookings(data);
    } catch (err) {
      setMessage(err.message || "Unable to load bookings. Please try again.");
    }
  }

  function handleSessionExpired() {
    localStorage.removeItem("ticketeaseToken");
    localStorage.removeItem("ticketeaseUser");

    setAuthToken("");
    setUser(null);
    setBookings([]);
    setShowBookings(false);
    setShowAdmin(false);
    setShowAuth(true);
    setMessage("Your session expired. Please log in again.");
  }

  const categories = [
    "All",
    ...new Set(events.map((event) => event.category))
  ];

  const normalizedSearch = search.trim().toLowerCase();

  const filteredEvents = events.filter((event) => {
    const title = (event.title || "").toLowerCase();
    const venue = (event.venue || "").toLowerCase();
    const eventCategory = (event.category || "").toLowerCase();

    const matchesSearch =
      title.includes(normalizedSearch) ||
      venue.includes(normalizedSearch) ||
      eventCategory.includes(normalizedSearch);

    const matchesCategory =
      category === "All" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  async function handleBooking(customer) {
    if (!selectedEvent || bookingLoading) return;

    if (!authToken) {
      setMessage("Please log in before booking an event.");
      setShowAuth(true);
      return;
    }

    setBookingLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...customer,
          eventId: selectedEvent.id
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setSelectedEvent(null);
      setMessage(`Booking successful! Reference: ${data.booking.reference}`);
      setShowBookings(true);
      await loadBookings(authToken);
    } catch (err) {
      setMessage(err.message || "Unable to create booking.");
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancelBooking(reference) {
    if (!authToken || cancellingReference) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${reference}?`
    );

    if (!confirmed) return;

    setCancellingReference(reference);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/api/bookings/${encodeURIComponent(reference)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel booking.");
      }

      setMessage("Booking cancelled successfully.");
      await loadBookings(authToken);
    } catch (err) {
      setMessage(err.message || "Unable to cancel booking.");
    } finally {
      setCancellingReference("");
    }
  }

  function goHome() {
    setShowBookings(false);
    setShowAdmin(false);
    setShowAuth(false);
    setMessage("");
  }

  async function goToBookings() {
    setShowAdmin(false);
    setShowAuth(false);
    setShowBookings(true);
    setMessage("");
    await loadBookings();
  }

  function handleAuthSuccess(data) {
    localStorage.setItem("ticketeaseToken", data.token);
    localStorage.setItem("ticketeaseUser", JSON.stringify(data.user));

    setAuthToken(data.token);
    setUser(data.user);
    setShowAuth(false);
    setShowAdmin(false);
    setMessage("Login successful!");
  }

  function handleLogout() {
    localStorage.removeItem("ticketeaseToken");
    localStorage.removeItem("ticketeaseUser");

    setAuthToken("");
    setUser(null);
    setBookings([]);
    setShowAuth(false);
    setShowAdmin(false);
    setShowBookings(false);
    setMessage("You have logged out.");
  }

  function openAdminDashboard() {
    setShowAdmin(true);
    setShowAuth(false);
    setShowBookings(false);
    setMessage("");
  }

  return (
    <div className="app">
      <Header
        onHome={goHome}
        onBookings={goToBookings}
        onLogin={() => {
          setShowAuth(true);
          setShowAdmin(false);
          setShowBookings(false);
          setMessage("");
        }}
        user={user}
        onLogout={handleLogout}
      />

      {user?.role === "admin" && !showAuth && (
        <div className="admin-entry">
          <button
            className="primary-button"
            onClick={openAdminDashboard}
          >
            Open Admin Dashboard
          </button>
        </div>
      )}

      <main>
        {showAuth ? (
          <AuthForm
            onAuthSuccess={handleAuthSuccess}
            onBack={() => setShowAuth(false)}
          />
        ) : showAdmin ? (
          <AdminDashboard
            token={authToken}
            onBack={() => setShowAdmin(false)}
          />
        ) : (
          <>
            <section className="hero">
              <div className="hero-content">
                <span className="eyebrow">
                  YOUR NEXT EXPERIENCE STARTS HERE
                </span>

                <h1>
                  Discover events.
                  <br />
                  <span>Make memories.</span>
                </h1>

                <p>
                  Find exciting events, explore new experiences and
                  book your tickets in just a few clicks.
                </p>

                {!showBookings && (
                  <button
                    className="hero-button"
                    onClick={() =>
                      document.getElementById("events")?.scrollIntoView({
                        behavior: "smooth"
                      })
                    }
                  >
                    Explore Events ↓
                  </button>
                )}
              </div>

              <div className="hero-art" aria-hidden="true">
                <div className="hero-ticket">
                  <span>YOUR TICKET</span>
                  <span className="ticket-emoji">🎫</span>
                  <strong>Great experiences</strong>
                  <span>One click away</span>
                  <div className="ticket-dots">•••• •••• ••••</div>
                </div>

                <span className="floating-star star-one">✦</span>
                <span className="floating-star star-two">✧</span>
              </div>
            </section>

            {message && (
              <div className="success-message" role="status">
                {message}
              </div>
            )}

            {showBookings ? (
              <section className="section bookings-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">YOUR TICKETS</span>
                    <h2>My Bookings</h2>
                  </div>

                  <button className="secondary-button" onClick={goHome}>
                    Browse Events
                  </button>
                </div>

                {!authToken ? (
                  <div className="empty-state">
                    <h3>Please log in</h3>
                    <p>Log in to view your bookings.</p>
                    <button
                      className="primary-button"
                      onClick={() => setShowAuth(true)}
                    >
                      Log In
                    </button>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="empty-state">
                    <span>🎟️</span>
                    <h3>No bookings yet</h3>
                    <p>
                      Your bookings will appear here after you book an event.
                    </p>
                    <button className="primary-button" onClick={goHome}>
                      Explore Events
                    </button>
                  </div>
                ) : (
                  <div className="booking-list">
                    {bookings.map((booking) => (
                      <article
                        className="booking-card"
                        key={booking.reference}
                      >
                        <div>
                          <span className="category-tag">
                            {booking.status === "cancelled"
                              ? "Cancelled"
                              : "Confirmed"}
                          </span>

                          <h3>{booking.eventTitle}</h3>
                          <p>Booked by: {booking.name}</p>
                          <p>Tickets: {booking.quantity}</p>
                          <p>Reference: {booking.reference}</p>

                          {booking.status !== "cancelled" && (
                            <TicketQR booking={booking} />
                          )}

                          <p>
                            Date booked:{" "}
                            {new Date(booking.bookedAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="booking-actions">
                          <strong>₹{booking.total}</strong>

                          {booking.status !== "cancelled" && (
                            <button
                              className="secondary-button"
                              disabled={
                                cancellingReference === booking.reference
                              }
                              onClick={() =>
                                handleCancelBooking(booking.reference)
                              }
                            >
                              {cancellingReference === booking.reference
                                ? "Cancelling..."
                                : "Cancel booking"}
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="section" id="events">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      FIND YOUR NEXT EXPERIENCE
                    </span>
                    <h2>Upcoming Events</h2>
                    <p className="section-subtitle">
                      Choose an event and reserve your spot.
                    </p>
                  </div>

                  <span className="event-count">
                    {filteredEvents.length} events
                  </span>
                </div>

                {loading && <p>Loading events...</p>}
                {error && <p role="alert">{error}</p>}

                {!loading && !error && (
                  <>
                    <div className="search-box">
                      <span>⌕</span>
                      <input
                        aria-label="Search events"
                        placeholder="Search by event name or venue..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <div className="category-filters">
                      {categories.map((item) => (
                        <button
                          key={item}
                          className={
                            category === item
                              ? "filter-button active"
                              : "filter-button"
                          }
                          onClick={() => setCategory(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    {filteredEvents.length === 0 ? (
                      <div className="empty-state">
                        <span>🔎</span>
                        <h3>No events found</h3>
                        <p>Try another search term or category.</p>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setSearch("");
                            setCategory("All");
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      <div className="event-grid">
                        {filteredEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onBook={(eventToBook) => {
                              if (!authToken) {
                                setMessage("Please log in before booking.");
                                setShowAuth(true);
                                setShowBookings(false);
                                return;
                              }

                              setSelectedEvent(eventToBook);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <span>🎟️ TicketEase</span>
        <p>Discover events. Make memories.</p>
        <small>Student project prototype · Demo bookings only</small>
      </footer>

      <BookingModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onConfirm={handleBooking}
        isSubmitting={bookingLoading}
      />
    </div>
  );
}

export default App;
