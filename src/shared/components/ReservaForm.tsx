import React, { useState } from "react";
import dayjs from "dayjs";
import "./ReservaForm.css";

interface Field {
  id: number;
  name: string;
  type: 'futbol7' | 'futbol11';
  max_reservations: number;
  price_per_hour: number;
}

interface ReservaFormProps {
  field: Field;
  nextWeekendDates: Date[];
  onSuccess?: () => void;
}

const SLOTS = [
  { id: 1, label: "09:00 - 10:30", start: "09:00", end: "10:30" },
  { id: 2, label: "10:30 - 12:00", start: "10:30", end: "12:00" },
  { id: 3, label: "12:00 - 13:30", start: "12:00", end: "13:30" },
  { id: 4, label: "13:30 - 15:00", start: "13:30", end: "15:00" },
];

const ReservaForm: React.FC<ReservaFormProps> = ({ field, nextWeekendDates, onSuccess }) => {
  const [date, setDate] = useState<string>("");
  const [slot, setSlot] = useState<number | "">("");
  const [numUsers, setNumUsers] = useState(1);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // UX: Día solo puede ser sábado o domingo próximos
  const handleDayClick = (d: string) => {
    setDate(d);
    setSlot("");
  };

  const handleSlotClick = (slotId: number) => {
    setSlot(slotId);
  };

  const getSlotTimes = (date: string, slotId: number) => {
    const slot = SLOTS.find(s => s.id === slotId);
    if (!slot) return { start: '', end: '' };
    // date: 'YYYY-MM-DD', slot.start: 'HH:mm', slot.end: 'HH:mm'
    const start = `${date}T${slot.start}:00`;
    const end = `${date}T${slot.end}:00`;
    return { start, end };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (!date || !slot) {
      setFormError("Debes seleccionar un día y un horario.");
      return;
    }
    if (numUsers < 1 || numUsers > field.max_reservations) {
      setFormError(`Debes indicar entre 1 y ${field.max_reservations} usuarios.`);
      return;
    }
    setLoading(true);
    try {
      if (!token) {
        localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
        window.location.href = "/login";
        return;
      }
      // Guardar los datos de la reserva temporalmente en el estado global o sessionStorage
      const reservaTemp = {
        field_id: field.id,
        date,
        slot: Number(slot),
        total_price: field.price_per_hour,
        numUsers,
      };
      sessionStorage.setItem("reservaTemp", JSON.stringify(reservaTemp));
      // Redirigir a la vista de método de pago
      window.location.href = "/pago";
    } finally {
      setLoading(false);
    }
  };

  // Calcular el máximo de reservas permitidas según plazas disponibles
  const maxReservas = (typeof (field as any).available_spots === 'number' && (field as any).available_spots >= 1)
    ? (field as any).available_spots
    : 0;
  // Si no hay plazas, bloquear input y botones
  const reservasDisabled = maxReservas === 0;

  // Calcular el precio total dinámico
  const totalPrice = reservasDisabled ? 0 : (numUsers * field.price_per_hour);

  return (
    <form onSubmit={handleSubmit} className="reserva-form" aria-label="Formulario de reserva">
      <div className="reserva-pricebox">
        <span className="reserva-price">
          {totalPrice.toFixed(2)}<span className="reserva-price-eur">€</span>
        </span>
      </div>
      <div>
        <span className="reserva-label">Día</span>
        <div className="reserva-day-group" role="radiogroup" aria-label="Selecciona día">
          {nextWeekendDates.map((d, i) => {
            const value = d.toISOString().slice(0, 10);
            const label = d.toLocaleDateString("es-ES", { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
            return (
              <button
                type="button"
                key={i}
                className={"reserva-day-btn" + (date === value ? " selected" : "")}
                aria-pressed={date === value}
                tabIndex={0}
                onClick={() => handleDayClick(value)}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleDayClick(value)}
              >
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <span className="reserva-label">Horario</span>
        <div className="reserva-slot-group" role="radiogroup" aria-label="Selecciona horario">
          {SLOTS.map(s => (
            <button
              type="button"
              key={s.id}
              className={"reserva-slot-btn" + (slot === s.id ? " selected" : "")}
              aria-pressed={slot === s.id}
              tabIndex={0}
              disabled={!date}
              onClick={() => handleSlotClick(s.id)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleSlotClick(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="reserva-users">
        <label htmlFor="numUsers" className="reserva-label" style={{ marginBottom: 0 }}>Número de reservas</label>
        <div className="reserva-users-inputbox">
          <button type="button" className="reserva-users-btn" aria-label="Disminuir" onClick={() => setNumUsers(Math.max(1, numUsers - 1))} tabIndex={0} disabled={numUsers <= 1 || reservasDisabled}>-</button>
          <input
            id="numUsers"
            type="number"
            min={1}
            max={maxReservas}
            value={reservasDisabled ? '' : numUsers}
            onChange={e => {
              let value = Number(e.target.value);
              if (isNaN(value)) value = 1;
              value = Math.max(1, Math.min(maxReservas, value));
              setNumUsers(value);
            }}
            required
            aria-label="Cantidad de reservas"
            className="reserva-users-input"
            disabled={reservasDisabled}
          />
          <button type="button" className="reserva-users-btn" aria-label="Aumentar" onClick={() => setNumUsers(Math.min(maxReservas, numUsers + 1))} tabIndex={0} disabled={numUsers >= maxReservas || reservasDisabled}>+</button>
        </div>
        <span className="reserva-users-max">{reservasDisabled ? 'No hay plazas disponibles' : `Máximo ${maxReservas}`}</span>
      </div>
      {formError && <div className="reserva-error">{formError}</div>}
      {success && <div className="reserva-success">{success}</div>}
      <button type="submit" className="reserva-btn" disabled={loading || reservasDisabled}>{loading ? "Reservando..." : "Confirmar Reserva"}</button>
    </form>
  );
};

export default ReservaForm;
