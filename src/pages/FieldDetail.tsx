import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FieldDetail.css";

interface Field {
  id: number;
  name: string;
  location: string;
  address?: string;
  description?: string;
  type: 'futbol7' | 'futbol11';
  price_per_hour: number;
  reservations_count: number;
  max_reservations: number;
  available_spots: number;
  images: string[];
}

const FieldDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reservation form state
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userIds, setUserIds] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/fields/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && (data.data || data.id)) {
          // Soporta respuesta tipo {data: [field]} o {id, ...}
          const fieldData = data.data ? data.data[0] : data;
          setField(fieldData);
        } else {
          setError("Campo no encontrado");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar el campo");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    setFormLoading(true);
    if (!field) return;
    const userIdArr = userIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean);
    if (userIdArr.length === 0 || userIdArr.length > field.max_reservations) {
      setFormError(`Debes indicar entre 1 y ${field.max_reservations} usuarios.`);
      setFormLoading(false);
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
          field_id: field.id,
          start_time: startTime,
          end_time: endTime,
          total_price: field.price_per_hour,
          user_ids: userIdArr,
        }),
      });
      if (res.ok) {
        setSuccess("Reserva realizada correctamente");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        const data = await res.json();
        setFormError(data.message || "Error al realizar la reserva");
      }
    } catch (err) {
      setFormError("Error de red");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="field-detail-container"><div>Cargando campo...</div></div>;
  if (error) return <div className="field-detail-container"><div>{error}</div></div>;
  if (!field) return null;

  // Parse club name from field name if present
  let clubName = "";
  let fieldName = field.name;
  if (field.name.includes("(") && field.name.includes(")")) {
    fieldName = field.name.substring(0, field.name.indexOf("(")).trim();
    clubName = field.name.substring(field.name.indexOf("(") + 1, field.name.indexOf(")"));
  }

  // Carrusel local (no globalizado)
  const images = field.images && field.images.length > 0 ? field.images : ["/logo.webp"];
  const next = () => setCarouselIndex((i) => (i + 1) % images.length);
  const prev = () => setCarouselIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="field-detail-container">
      <div className="field-detail-carousel">
        <div className="field-carousel">
          <img src={images[carouselIndex]} alt="Campo" className="field-image" />
          <button className="carousel-btn left" onClick={prev} aria-label="Anterior">&#8592;</button>
          <button className="carousel-btn right" onClick={next} aria-label="Siguiente">&#8594;</button>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={i === carouselIndex ? "dot active" : "dot"}
                onClick={() => setCarouselIndex(i)}
                style={{ cursor: 'pointer' }}
              ></span>
            ))}
          </div>
        </div>
      </div>
      <div className="field-detail-info">
        <div className="field-detail-title">{fieldName}</div>
        {clubName && <div className="field-detail-club">{clubName}</div>}
        <div className="field-detail-location">{field.location}</div>
        {field.address && <div className="field-detail-address">{field.address}</div>}
        <div className="field-detail-description">{field.description}</div>
        <div className="field-detail-type">Tipo: <b>{field.type === 'futbol7' ? 'Fútbol 7' : 'Fútbol 11'}</b></div>
        <div className="field-detail-spots">Plazas disponibles: <b>{field.available_spots}</b> / {field.max_reservations}</div>
        <div className="field-detail-price">{field.price_per_hour} €/h</div>
      </div>
      <div className="field-detail-reserve-box">
        <h3>Reservar</h3>
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
            <small>Máximo {field.max_reservations} usuarios</small>
          </div>
          <div className="form-group">
            <label>Precio por hora</label>
            <input type="text" value={`${field.price_per_hour} €`} disabled />
          </div>
          {formError && <div className="reserva-error">{formError}</div>}
          {success && <div className="reserva-success">{success}</div>}
          <button type="submit" className="reserva-btn" disabled={formLoading}>{formLoading ? "Reservando..." : "Confirmar Reserva"}</button>
          <button type="button" className="reserva-cancel" onClick={() => navigate(-1)}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default FieldDetail;
