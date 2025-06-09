import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FieldDetail.css";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import "../shared/components/Header.css";
import "../shared/components/Footer.css";
import GoogleMapEmbed from "../shared/components/GoogleMapEmbed";
import ReservaForm from "../shared/components/ReservaForm";

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

  // Carrusel local (no globalizado)
  const [carouselIndex, setCarouselIndex] = useState(0);
  let images: string[] = ["/logo.webp"];
  if (field && Array.isArray(field.images) && field.images.length > 0) {
    images = field.images;
  }

  useEffect(() => {
    if (!field || !Array.isArray(field.images) || field.images.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % field.images.length);
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

  // Calcular el próximo sábado y domingo
  function getNextWeekendDates() {
    const today = new Date();
    const saturday = new Date(today);
    const sunday = new Date(today);
    saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
    sunday.setDate(today.getDate() + ((7 - today.getDay()) % 7));
    return [saturday, sunday];
  }

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
          <aside className="field-detail-reservebox" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
            {/* Elimina el precio de aquí, solo va dentro del formulario */}
            <ReservaForm
              field={field}
              nextWeekendDates={getNextWeekendDates()}
              onSuccess={() => navigate("/dashboard")}
            />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FieldDetail;
