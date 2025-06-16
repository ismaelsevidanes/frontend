import React, { useEffect, useState, useRef } from "react";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import { useUserMenu } from "../shared/components/UserMenuProvider";
import { authFetch } from "../shared/utils/authFetch";
import CancelReservationButton from "../shared/components/CancelReservationButton";
import Pagination from "../shared/components/Pagination";
import ReservationFilters from "../shared/components/ReservationFilters";
import Breadcrumbs from "../shared/components/Breadcrumbs";
import "./reservationsHistory.css";

interface Reservation {
  id: number;
  fieldName: string;
  fieldAddress: string;
  fieldLocation?: string;
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [fecha, setFecha] = useState("");
  const [numReservasMin, setNumReservasMin] = useState("");
  const [numReservasMax, setNumReservasMax] = useState("");
  const [ordenarPorFecha, setOrdenarPorFecha] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("pageSize", String(PAGE_SIZE));
    if (precioMin) params.append("precioMin", precioMin);
    if (precioMax) params.append("precioMax", precioMax);
    if (ubicacion) params.append("ubicacion", ubicacion);
    if (localidad) params.append("localidad", localidad);
    if (ordenarPorFecha) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      params.append("fecha", `${yyyy}-${mm}-${dd}`);
    }
    if (numReservasMin) params.append("numReservasMin", numReservasMin);
    if (numReservasMax) params.append("numReservasMax", numReservasMax);
    authFetch(`/api/reservations/me?${params.toString()}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        // Reconstruir slotLabel si falta
        const SLOTS = [
          { id: 1, label: "09:00 - 10:30" },
          { id: 2, label: "10:30 - 12:00" },
          { id: 3, label: "12:00 - 13:30" },
          { id: 4, label: "13:30 - 15:00" },
        ];
        const reservas = (data.data || []).map((r: any) => ({
          ...r,
          slotLabel: r.slotLabel || SLOTS.find(s => s.id === Number(r.slot))?.label || r.slot,
        }));
        setReservations(reservas);
        setTotalPages(data.totalPages);
        setTotalReservations(data.totalReservations);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar las reservas");
        setLoading(false);
      });
  }, [page, precioMin, precioMax, ubicacion, localidad, ordenarPorFecha, numReservasMin, numReservasMax]);

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
      <Breadcrumbs />
      <main className="dashboard-main">
        <ReservationFilters
          precioMin={precioMin}
          setPrecioMin={setPrecioMin}
          precioMax={precioMax}
          setPrecioMax={setPrecioMax}
          ubicacion={ubicacion}
          setUbicacion={setUbicacion}
          localidad={localidad}
          setLocalidad={setLocalidad}
          ordenarPorFecha={ordenarPorFecha}
          setOrdenarPorFecha={setOrdenarPorFecha}
          numReservasMin={numReservasMin}
          setNumReservasMin={setNumReservasMin}
          numReservasMax={numReservasMax}
          setNumReservasMax={setNumReservasMax}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
        />
        <h2 className="dashboard-title" style={{ textAlign: 'center', marginBottom: 32 }}>Historial de Reservas</h2>
          <div style={{ minHeight: 420, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, pointerEvents: loading ? 'auto' : 'none', opacity: loading ? 1 : 0, transition: 'opacity 0.2s' }}>
            {loading && (
              <div className="dashboard-loading" style={{ textAlign: 'center', marginBottom: 32, background: 'rgba(255,255,255,0.85)', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500 }}>
                Cargando reservas...
              </div>
            )}
          </div>
          <div style={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.2s' }}>
            {error ? (
              <div className="dashboard-error">{error}</div>
            ) : reservations.length === 0 && !loading ? (
              <div className="dashboard-empty" style={{ textAlign: 'center', marginBottom: 32 }}>No tienes reservas realizadas.</div>
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
                        <div className="reservation-card-quantity">Nº de Reservas: {res.quantity || res.numUsers || 1}</div>
                        <div className="reservation-card-price">{Number(res.total_price).toFixed(2)} €</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <button
                          className="reservation-card-detail-btn"
                          onClick={e => { e.stopPropagation(); setSelected(res); }}
                          aria-label="Ver detalles"
                        >
                          Ver Detalle
                        </button>
                        <div onClick={e => e.stopPropagation()}>
                          <CancelReservationButton
                            reservationId={res.id}
                            createdAt={res.created_at}
                            creatorId={res.creator_id}
                            onCancelSuccess={() => {
                              setSelected(null);
                              setReservations(prev => prev.filter(r => r.id !== res.id));
                            }}
                            className="summary-ticket-btn cancel"
                          />
                        </div>
                      </div>
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
          </div>
        </div>
        {selected && (
          <div className="reservation-detail-modal" role="dialog" aria-modal="true">
            <div className="reservation-detail-content">
              <button className="reservation-detail-close" onClick={() => setSelected(null)} aria-label="Cerrar detalle">×</button>
              <h3>Detalle de la Reserva</h3>
              <div className="reservation-detail-row"><b>Campo:</b> {selected.fieldName}</div>
              <div className="reservation-detail-row"><b>Dirección:</b> {selected.fieldAddress}</div>
              {selected.fieldLocation && (
                <div className="reservation-detail-row"><b>Localidad:</b> {selected.fieldLocation}</div>
              )}
              <div className="reservation-detail-row"><b>Fecha:</b> {selected.date}</div>
              <div className="reservation-detail-row"><b>Hora:</b> {selected.slotLabel || selected.slot}</div>
              <div className="reservation-detail-row"><b>Nº de Reservas:</b> {selected.quantity || selected.numUsers || 1}</div>
              <div className="reservation-detail-row"><b>Total:</b> {Number(selected.total_price).toFixed(2)} €</div>
              <div className="reservation-detail-row">
                <b>Estado:</b>{' '}
                <span className={`reservation-status-badge reservation-status-${getReservationStatus(selected).label.toLowerCase()}`}>
                  {getReservationStatus(selected).label}
                </span>
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
