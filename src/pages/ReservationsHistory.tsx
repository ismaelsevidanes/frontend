import React, { useEffect, useState } from "react";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import { useUserMenu } from "../shared/components/UserMenuProvider";
import { authFetch } from "../shared/utils/authFetch";
import CancelReservationButton from "../shared/components/CancelReservationButton";
import Pagination from "../shared/components/Pagination";
import "./reservationsHistory.css";

interface Reservation {
  id: number;
  fieldName: string;
  fieldAddress: string;
  date: string;
  slotLabel: string;
  total_price: number;
  created_at: string;
  creator_id: number;
  status: string;
  quantity: number;
}

const PAGE_SIZE = 5;

const ReservationsHistory: React.FC = () => {
  const { menuOpen, setMenuOpen, handleLogout } = useUserMenu();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    authFetch(`/api/reservations/me?page=${page}&pageSize=${PAGE_SIZE}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setReservations(data.data);
        setTotalPages(data.totalPages);
        setTotalReservations(data.totalReservations);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar las reservas");
        setLoading(false);
      });
  }, [page]);

  // Utilidad para saber si la reserva está activa o completada
  function getReservationStatus(res: Reservation) {
    // La fecha viene ya formateada, pero necesitamos la original para comparar
    // Usamos created_at como backup si no hay fecha
    let dateStr = res.date;
    // Si date es tipo '21/6/2025', parseamos a Date
    let dateParts = dateStr.split('/');
    let dateObj: Date;
    if (dateParts.length === 3) {
      // Formato dd/mm/yyyy o d/m/yyyy
      dateObj = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
    } else {
      // Fallback: intentar parsear como ISO
      dateObj = new Date(dateStr);
    }
    // Si hay slotLabel, sumamos la hora de inicio
    if (res.slotLabel && typeof res.slotLabel === 'string') {
      const match = res.slotLabel.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        dateObj.setHours(Number(match[1]), Number(match[2]), 0, 0);
      }
    }
    const now = new Date();
    if (dateObj.getTime() > now.getTime()) {
      return { label: 'Activo', color: '#4caf50', textColor: '#fff' };
    } else {
      return { label: 'Completado', color: '#1976d2', textColor: '#fff' };
    }
  }

  return (
    <div className="dashboard-layout">
      <Header
        onUserMenu={() => setMenuOpen((open) => !open)}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <main className="dashboard-main">
        <h2 className="dashboard-title" style={{ textAlign: 'center', marginBottom: 32 }}>Historial de Reservas</h2>
        {loading ? (
          <div className="dashboard-loading" style={{ textAlign: 'center', marginBottom: 32 }}>Cargando reservas...</div>
        ) : error ? (
          <div className="dashboard-error">{error}</div>
        ) : reservations.length === 0 ? (
          <div className="dashboard-empty">No tienes reservas realizadas.</div>
        ) : (
          <>
            <div className="reservations-history-list">
              {reservations.map(res => (
                <div
                  key={res.id}
                  className={`reservation-card${selected?.id === res.id ? " selected" : ""}`}
                  tabIndex={0}
                  aria-label={`Ver detalles de la reserva en ${res.fieldName} el ${res.date}`}
                  onClick={() => setSelected(res)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelected(res); }}
                >
                  <div className="reservation-card-main">
                    <div className="reservation-card-title">{res.fieldName}</div>
                    <div className="reservation-card-date">{res.date} - {res.slotLabel}</div>
                    <div className="reservation-card-address">{res.fieldAddress}</div>
                    <div className="reservation-card-quantity">Nº de Reservas: {res.quantity}</div>
                    <div className="reservation-card-price">{Number(res.total_price).toFixed(2)} €</div>
                  </div>
                  <button
                    className="reservation-card-detail-btn"
                    onClick={e => { e.stopPropagation(); setSelected(res); }}
                    aria-label="Ver detalles"
                  >
                    Ver Detalle
                  </button>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalReservations}
              totalLabel="Reservas"
            />
          </>
        )}
        {selected && (
          <div className="reservation-detail-modal" role="dialog" aria-modal="true">
            <div className="reservation-detail-content">
              <button className="reservation-detail-close" onClick={() => setSelected(null)} aria-label="Cerrar detalle">×</button>
              <h3>Detalle de la Reserva</h3>
              <div className="reservation-detail-row"><b>Campo:</b> {selected.fieldName}</div>
              <div className="reservation-detail-row"><b>Dirección:</b> {selected.fieldAddress}</div>
              <div className="reservation-detail-row"><b>Fecha:</b> {selected.date}</div>
              <div className="reservation-detail-row"><b>Hora:</b> {selected.slotLabel}</div>
              <div className="reservation-detail-row"><b>Nº de Reservas:</b> {selected.quantity}</div>
              <div className="reservation-detail-row"><b>Total:</b> {Number(selected.total_price).toFixed(2)} €</div>
              <div className="reservation-detail-row">
                <b>Estado:</b>{' '}
                <span className={`reservation-status-badge reservation-status-${getReservationStatus(selected).label.toLowerCase()}`}>
                  {getReservationStatus(selected).label}
                </span>
              </div>
              <div className="reservation-detail-actions">
                <CancelReservationButton
                  reservationId={selected.id}
                  createdAt={selected.created_at}
                  creatorId={selected.creator_id}
                  onCancelSuccess={() => {
                    setSelected(null);
                    setReservations(reservations => reservations.filter(r => r.id !== selected.id));
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ReservationsHistory;
