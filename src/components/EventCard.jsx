function EventCard({ event, onBook }) {
  const formattedDate = new Date(
    `${event.date}T12:00:00`
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <article className="event-card">
      <div className="event-art">
        <span className="event-emoji">{event.emoji}</span>
        <span className="category-tag">{event.category}</span>
      </div>

      <div className="event-content">
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>

        <p className="event-detail">📅 {formattedDate}</p>
        <p className="event-detail">🕒 {event.time}</p>
        <p className="event-detail">📍 {event.venue}</p>

        <div className="event-footer">
          <div>
            <span className="price-label">Ticket price</span>
            <strong>₹{event.price}</strong>
          </div>

          <button
            className="primary-button"
            onClick={() => onBook(event)}
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default EventCard;