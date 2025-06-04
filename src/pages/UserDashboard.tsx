import React, { useEffect, useState, useRef } from "react";
import "./userDashboardStyles.css";
import Header from "../shared/components/Header";
import "../shared/components/Header.css";
import Footer from "../shared/components/Footer";
import "../shared/components/Footer.css";
import { FaFilter } from "react-icons/fa";

// Carrusel simple para imágenes
const FieldImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
  const [index, setIndex] = useState(0);

  // Cambio automático cada 20 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [images.length]);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  // Cambiar imagen solo con dots
  if (images.length === 0) return null;
  return (
    <div className="field-carousel">
      <img src={images[index]} alt="Campo" className="field-image" />
      <button className="carousel-btn left" onClick={prev} aria-label="Anterior">&#8592;</button>
      <button className="carousel-btn right" onClick={next} aria-label="Siguiente">&#8594;</button>
      <div className="carousel-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={i === index ? "dot active" : "dot"}
            onClick={() => setIndex(i)}
            style={{ cursor: 'pointer' }}
          ></span>
        ))}
      </div>
    </div>
  );
};

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
}

const UserDashboard: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<string>("");
  const [leastReserved, setLeastReserved] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Nueva función para construir la query de filtros y pedir al backend
  const fetchFields = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (location) params.append("location", location);
    if (price) params.append("max_price", price);
    if (type) params.append("type", type);
    if (leastReserved) params.append("least_reserved", "true");
    const res = await fetch(`/api/fields?${params.toString()}`);
    const data = await res.json();
    setFields(data.data || []);
    setFilteredFields(data.data || []);
    if (showLoading) setLoading(false);
  };

  // Solo mostrar loading en la primera carga
  useEffect(() => {
    fetchFields(true);
    // eslint-disable-next-line
  }, []);

  // Para los filtros, no mostrar loading, así no hay parpadeo
  function useDebouncedEffect(effect: () => void, deps: any[], delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(effect, delay);
      return () => timeoutRef.current && clearTimeout(timeoutRef.current);
      // eslint-disable-next-line
    }, deps);
  }

  // Sustituye useEffect por useDebouncedEffect para filtros automáticos
  useDebouncedEffect(() => {
    fetchFields();
  }, [search, location, price], 300);

  useEffect(() => {
    fetchFields();
    // eslint-disable-next-line
  }, [type, leastReserved]);

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
      // Si el logout es exitoso o el token ya está invalidado, borra el token y redirige
      if (response.status === 200 || response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        // Si hay otro error, puedes mostrar un mensaje o forzar logout
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (error) {
      // En caso de error de red, borra el token y redirige
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <div className="user-dashboard-container">
      <Header
        username={username}
        onUserMenu={() => setMenuOpen((open) => !open)}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <div className="dashboard-filters-wrapper">
        <button className="dashboard-filters-toggle" onClick={() => setFiltersOpen((open) => !open)} aria-label="Mostrar/ocultar filtros">
          <FaFilter style={{ marginRight: 8, fontSize: 20 }} />
          <span>Filtros</span>
        </button>
        {filtersOpen && (
          <div className="dashboard-filters">
            <div className="dashboard-filters-row">
              <input
                type="text"
                placeholder="Buscar campo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar campo por nombre"
              />
              <input
                type="text"
                placeholder="Ubicación"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Filtrar por ubicación"
              />
              <input
                type="number"
                placeholder="Precio máximo (€)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                aria-label="Filtrar por precio máximo"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Filtrar por tipo de campo"
              >
                <option value="">Tipo de campo</option>
                <option value="futbol7">Fútbol 7</option>
                <option value="futbol11">Fútbol 11</option>
              </select>
            </div>
            <div className="dashboard-checkbox-row">
              <label className="least-reserved-label">
                <input
                  type="checkbox"
                  checked={leastReserved}
                  onChange={(e) => setLeastReserved(e.target.checked)}
                  style={{ accentColor: '#003366', marginRight: 8 }}
                />
                Ordenar por menos reservas disponibles
              </label>
            </div>
          </div>
        )}
      </div>
      <main className="dashboard-main">
        {loading ? (
          <div className="dashboard-loading">Cargando campos...</div>
        ) : filteredFields.length === 0 ? (
          <div className="dashboard-empty">No se encontraron campos.</div>
        ) : (
          <div className="fields-grid">
            {filteredFields.map((field) => (
              <div className="field-card" key={field.id}>
                <FieldImageCarousel images={["/logo.webp", "/logo.webp", "/logo.webp", "/logo.webp"]} />
                <div className="field-info">
                  <h3>{field.name}</h3>
                  <p className="field-location">{field.location}</p>
                  <p className="field-description">{field.description}</p>
                  <div className="field-type">Tipo: <b>{field.type === 'futbol7' ? 'Fútbol 7' : 'Fútbol 11'}</b></div>
                  <div className="field-spots">
                    Plazas disponibles: <b>{typeof field.available_spots === 'number' ? field.available_spots : field.max_reservations}</b> / {field.max_reservations}
                  </div>
                  <div className="field-bottom">
                    <span className="field-price">{field.price_per_hour} €/h</span>
                    <button className="reserve-btn">Reservar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
