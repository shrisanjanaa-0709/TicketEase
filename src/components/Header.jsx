
function Header({ onHome, onBookings, onLogin, user, onLogout }) {
  return (
    <header className="header">
      <button className="brand" onClick={onHome}>
        <span className="brand-icon">🎟️</span>
        TicketEase
      </button>

      <nav className="nav">
        <button onClick={onHome}>Explore Events</button>
        <button onClick={onBookings}>My Bookings</button>

        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button onClick={onLogin}>Login / Register</button>
        )}
      </nav>
    </header>
  );
}

export default Header;
