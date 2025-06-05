import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FieldDetail.css";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import "../shared/components/Header.css";
import "../shared/components/Footer.css";
import GoogleMapEmbed from "../shared/components/GoogleMapEmbed";

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

  // User state
  const [username, setUsername] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    // Obtener el nombre del usuario del token o localStorage
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
  }, []);

  const handleUserMenu = () => setMenuOpen((open) => !open);
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.status === 200 || response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (error) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

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

  // Cambio automático de imagen cada 20 segundos
  useEffect(() => {
    if (!field) return;
    const imgs = field.images && field.images.length > 0 ? field.images : ["/logo.webp"];
    if (imgs.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % imgs.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [field]);

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
    <div className="dashboard-layout">
      <Header
        username={username}
        onUserMenu={handleUserMenu}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <main className="dashboard-main">
        <div className="field-detail-grid">
          {/* Columna Izquierda: Imágenes */}
          <aside className="field-detail-gallery">
            <div className="gallery-main-image">
              <img src={images[carouselIndex]} alt="Campo" className="gallery-image" />
            </div>
            <div className="gallery-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb${i === carouselIndex ? ' active' : ''}`}
                  onClick={() => setCarouselIndex(i)}
                  aria-label={`Imagen ${i + 1}`}
                >
                  <img src={img} alt={`Miniatura ${i + 1}`} />
                </button>
              ))}
            </div>
            {/* Mapa de Google Maps */}
            {field.name && field.location && (
              <GoogleMapEmbed
                query={`${field.name}, ${field.location}`}
                className="field-detail-map"
                height={220}
                borderRadius={14}
              />
            )}
          </aside>

          {/* Columna Central: Info */}
          <section className="field-detail-maininfo">
            <h1 className="field-detail-title">{fieldName}</h1>
            {clubName && <div className="field-detail-club">{clubName}</div>}
            <div className="field-detail-location">{field.location}</div>
            {field.address && <div className="field-detail-address">{field.address}</div>}
            <div className="field-detail-description">{field.description}</div>
            <div className="field-detail-type">Tipo: <b>{field.type === 'futbol7' ? 'Fútbol 7' : 'Fútbol 11'}</b></div>
            <div className="field-detail-spots">Plazas disponibles: <b>{field.available_spots}</b> / {field.max_reservations}</div>
          </section>

          {/* Columna Derecha: Reserva */}
          <aside className="field-detail-reservebox">
            <div className="field-detail-pricebox">
              <span className="field-detail-price">{field.price_per_hour} €/h</span>
            </div>
            <form onSubmit={handleSubmit} className="reserva-form" aria-label="Formulario de reserva">
              <div className="form-group">
                <label htmlFor="userIds">Cantidad de usuarios</label>
                <input
                  id="userIds"
                  type="number"
                  min={1}
                  max={field.max_reservations}
                  value={userIds}
                  onChange={e => setUserIds(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={`Máximo ${field.max_reservations}`}
                  required
                  aria-describedby="userIdsHelp"
                />
                <small id="userIdsHelp">Máximo {field.max_reservations} usuarios</small>
              </div>
              <div className="form-group">
                <label htmlFor="startTime">Fecha y hora de inicio</label>
                <input id="startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="endTime">Fecha y hora de fin</label>
                <input id="endTime" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
              {formError && <div className="reserva-error">{formError}</div>}
              {success && <div className="reserva-success">{success}</div>}
              <button type="submit" className="reserva-btn" disabled={formLoading}>{formLoading ? "Reservando..." : "Confirmar Reserva"}</button>
              <button type="button" className="reserva-cancel" onClick={() => navigate(-1)}>Cancelar</button>
            </form>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FieldDetail;
