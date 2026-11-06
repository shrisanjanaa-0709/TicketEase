
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

function TicketQR({ booking }) {
  const canvasRef = useRef(null);

  function downloadQR() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `TicketEase-${booking.reference}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="ticket-qr">
      <h4>Your QR Ticket</h4>

      <QRCodeCanvas
        ref={canvasRef}
        value={JSON.stringify({
          app: "TicketEase",
          reference: booking.reference,
          eventId: booking.eventId,
          eventTitle: booking.eventTitle
        })}
        size={180}
        level="H"
        includeMargin
      />

      <p>Booking reference: {booking.reference}</p>

      <button
        type="button"
        className="primary-button"
        onClick={downloadQR}
      >
        Download QR Ticket
      </button>
    </div>
  );
}

export default TicketQR;
