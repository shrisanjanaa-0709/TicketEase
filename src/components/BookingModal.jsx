import { useState } from "react";

function BookingModal({ event, onClose, onConfirm, isSubmitting = false}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");

  if (!event) return null;

  const total = event.price * Number(quantity);

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    onConfirm({
      name: name.trim(),
      email: email.trim(),
      quantity: Number(quantity)
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-button"
          type="button"
          onClick={onClose}
          aria-label="Close booking form"
        >
          ×
        </button>

        <span className="modal-emoji">{event.emoji}</span>
        <h2 id="booking-title">Book your tickets</h2>
        <p className="modal-event-title">{event.title}</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="customer-name">Full name</label>
          <input
            id="customer-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />

          <label htmlFor="customer-email">Email address</label>
          <input
            id="customer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="ticket-quantity">Number of tickets</label>
          <select
            id="ticket-quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          >
            {[1, 2, 3, 4, 5].map((number) => (
              <option key={number} value={number}>
                {number} {number === 1 ? "ticket" : "tickets"}
              </option>
            ))}
          </select>

          <div className="total-row">
            <span>Total amount</span>
            <strong>₹{total}</strong>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
           className="primary-button submit-button"
           type="submit"
           disabled={isSubmitting}
          >
           {isSubmitting ? "Booking..." : "Confirm Booking"}
          </button>
        </form>

        <p className="demo-note">
          Demo only: no payment is collected. Bookings are temporarily stored
          in backend memory and are cleared when the server restarts.
        </p>
      </section>
    </div>
  );
}

export default BookingModal;