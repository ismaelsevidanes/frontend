import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserMenuProvider, useUserMenu } from "../shared/components/UserMenuProvider";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CancelReservationButton from "../shared/components/CancelReservationButton";
import CheckoutStepper from "../shared/components/CheckoutStepper";
import "./Summary.css";

const SummaryContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { menuOpen, setMenuOpen, handleLogout, username } = useUserMenu();
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    // Intenta obtener los datos del ticket de location.state o sessionStorage
    let ticketData = null;
    if (location.state && (location.state as any).ticket) {
      ticketData = (location.state as any).ticket;
    } else {
      const reserva = sessionStorage.getItem("lastTicket");
      if (reserva) ticketData = JSON.parse(reserva);
    }
    setTicket(ticketData);
    // Redirige si no hay ticket
    if (!ticketData) {
      navigate("/dashboard", { replace: true });
    }
  }, [location.state, navigate]);

  // Handler para abrir/cerrar menú usuario (igual que en PaymentMethod)
  const handleUserMenu = () => setMenuOpen((open) => !open);

  // Función para descargar el ticket como imagen o PDF (placeholder)
  const handleDownload = async () => {
    const ticketElement = document.getElementById("festival-ticket");
    if (!ticketElement) return;

    // Añade la clase para exportar bonito
    ticketElement.classList.add("export-pdf");

    // Espera a que el DOM aplique el estilo
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Convierte el ticket a imagen
    const canvas = await html2canvas(ticketElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    // Crea el PDF con el tamaño del ticket
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [700, 300],
    });

    pdf.addImage(imgData, "PNG", 0, 0, 700, 300);
    pdf.save("PitchDreamers-Ticket.pdf");

    // Quita la clase para no afectar la vista normal
    ticketElement.classList.remove("export-pdf");
  };

  if (!ticket) return null;

  return (
    <div className="dashboard-layout">
      <Header
        onUserMenu={handleUserMenu}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      >
        <CheckoutStepper step={2} />
      </Header>
      <main className="dashboard-main summary-main-center">
        <div className="summary-ticket-container print-ticket">
          <div id="festival-ticket" className="summary-ticket festival-ticket">
            <div className="ticket-barcode">
              <svg
                className="barcode-vertical"
                width="32"
                height="120"
                viewBox="0 0 32 120"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0" y="0" width="2" height="120" fill="#000"/>
                <rect x="4" y="0" width="2" height="120" fill="#000"/>
                <rect x="8" y="0" width="2" height="120" fill="#000"/>
                <rect x="12" y="0" width="2" height="120" fill="#000"/>
                <rect x="16" y="0" width="2" height="120" fill="#000"/>
                <rect x="20" y="0" width="2" height="120" fill="#000"/>
                <rect x="24" y="0" width="2" height="120" fill="#000"/>
                <rect x="28" y="0" width="2" height="120" fill="#000"/>
              </svg>
              <div className="barcode-number barcode-number-black">{ticket.id || ticket.reservationId || "-"}</div>
            </div>
            <div className="festival-ticket-content">
              <div className="summary-ticket-header festival-ticket-header">
                <h2 className="festival-title">{ticket.fieldName || ticket.field_id}</h2>
              </div>
              <div className="summary-ticket-body festival-ticket-body">
                <div className="festival-row"><b>Usuario:</b> {username}</div>
                <div className="festival-row"><b>Dirección:</b> {ticket.fieldAddress || ticket.address}</div>
                <div className="festival-row"><b>Fecha:</b> {ticket.date}</div>
                <div className="festival-row"><b>Hora:</b> {ticket.slotLabel || ticket.slot}</div>
                <div className="festival-row"><b>Nº de reservas:</b> {ticket.numUsers || 1}</div>
                <div className="festival-row"><b>Total:</b> {ticket.total_price ? Number(ticket.total_price).toFixed(2) : "0.00"}€</div>
              </div>
              <div className="ticket-url-vertical">
                <span>https://pitchdreamers.duckdns.org</span>
              </div>
            </div>
          </div>
        </div>
        <div className="summary-ticket-footer festival-ticket-footer ticket-footer-outside">
          <button className="summary-ticket-btn download" onClick={handleDownload}>Descargar ticket</button>
          {ticket && (ticket.id || ticket.reservationId) && (ticket.created_at || ticket.createdAt) && (ticket.creator_id || ticket.user_id) && (
            <CancelReservationButton
              reservationId={ticket.id || ticket.reservationId}
              createdAt={ticket.created_at || ticket.createdAt}
              creatorId={ticket.creator_id || ticket.user_id}
              onCancelSuccess={() => {
                sessionStorage.removeItem("lastTicket");
                navigate("/dashboard");
              }}
              className="summary-ticket-btn cancel"
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Summary: React.FC = () => (
  <UserMenuProvider>
    <SummaryContent />
  </UserMenuProvider>
);

export default Summary;
