import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Summary.css";

const Summary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

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
    // Obtener nombre usuario
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.name || payload.email || "Usuario");
      } catch {
        setUsername("Usuario");
      }
    } else {
      setUsername("Usuario");
    }
  }, [location.state, navigate]);

  // Handler para abrir/cerrar menú usuario (igual que en PaymentMethod)
  const handleUserMenu = () => setMenuOpen((open) => !open);

  // Handler para logout (igual que en PaymentMethod)
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      await fetch("/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

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

  // Función para cancelar la reserva (placeholder, lógica a implementar después)
  const handleCancel = () => {
    alert("Funcionalidad de cancelar reserva próximamente.");
  };

  if (!ticket) return null;

  return (
    <div className="dashboard-layout">
      <Header
        username={username}
        onUserMenu={handleUserMenu}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
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
                <div className="festival-row"><b>Total:</b> {ticket.total_price}€</div>
              </div>
              <div className="ticket-url-vertical">
                <span>https://pitchdreamers.duckdns.org</span>
              </div>
            </div>
          </div>
        </div>
        <div className="summary-ticket-footer festival-ticket-footer ticket-footer-outside">
          <button className="summary-ticket-btn download" onClick={handleDownload}>Descargar ticket</button>
          <button className="summary-ticket-btn cancel" onClick={handleCancel}>Cancelar reserva</button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Summary;
