import React, { useEffect, useState, useRef } from "react";
import "./userDashboardStyles.css";
import Header from "../shared/components/Header";
import "../shared/components/Header.css";
import Footer from "../shared/components/Footer";
import "../shared/components/Footer.css";
import { FaFilter } from "react-icons/fa";
import FieldCard from "../shared/components/FieldCard";
import FieldFilters from "../shared/components/FieldFilters";

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
      <FieldFilters
        search={search}
        setSearch={setSearch}
        location={location}
        setLocation={setLocation}
        price={price}
        setPrice={setPrice}
        type={type}
        setType={setType}
        leastReserved={leastReserved}
        setLeastReserved={setLeastReserved}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />
      <main className="dashboard-main">
        {loading ? (
          <div className="dashboard-loading">Cargando campos...</div>
        ) : filteredFields.length === 0 ? (
          <div className="dashboard-empty">No se encontraron campos.</div>
        ) : (
          <div className="fields-grid">
            {filteredFields.map((field) => (
              <FieldCard
                key={field.id}
                {...field}
                onReserve={() => {/* lógica de reserva aquí*/}}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
