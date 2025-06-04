import React, { useState } from "react";
import "./Reserva.css";
import { useNavigate, useLocation } from "react-router-dom";

interface ReservaFormProps {
  fieldId: number;
  fieldName: string;
  fieldType: 'futbol7' | 'futbol11';
  maxUsers: number;
  pricePerHour: number;
}

const Reserva: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fieldId, fieldName, fieldType, maxUsers, pricePerHour } = location.state || {};
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userIds, setUserIds] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const userIdArr = userIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean);
    if (userIdArr.length === 0 || userIdArr.length > maxUsers) {
      setError(`Debes indicar entre 1 y ${maxUsers} usuarios.`);
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          field_id: fieldId,
          start_time: startTime,
          end_time: endTime,
          total_price: pricePerHour, 
          user_ids: userIdArr,
        }),
      });
      if (res.ok) {
        setSuccess("Reserva realizada correctamente");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        const data = await res.json();
        setError(data.message || "Error al realizar la reserva");
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reserva-container">
      <div className="reserva-card">
        <h2>Reservar {fieldName}</h2>
        <form onSubmit={handleSubmit} className="reserva-form">
          <div className="form-group">
            <label>Fecha y hora de inicio</label>
            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Fecha y hora de fin</label>
            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>IDs de usuarios (separados por coma)</label>
            <input type="text" value={userIds} onChange={e => setUserIds(e.target.value)} placeholder="Ej: 1,2,3" required />
            <small>Máximo {maxUsers} usuarios</small>
          </div>
          <div className="form-group">
            <label>Precio por hora</label>
            <input type="text" value={`${pricePerHour} €`} disabled />
          </div>
          {error && <div className="reserva-error">{error}</div>}
          {success && <div className="reserva-success">{success}</div>}
          <button type="submit" className="reserva-btn" disabled={loading}>{loading ? "Reservando..." : "Confirmar Reserva"}</button>
          <button type="button" className="reserva-cancel" onClick={() => navigate(-1)}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default Reserva;
