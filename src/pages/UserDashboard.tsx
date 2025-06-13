import React, { useEffect, useState, useRef } from "react";
import "./userDashboardStyles.css";
import Header from "../shared/components/Header";
import "../shared/components/Header.css";
import Footer from "../shared/components/Footer";
import "../shared/components/Footer.css";
import FieldCard from "../shared/components/FieldCard";
import FieldFilters from "../shared/components/FieldFilters";
import Pagination from "../shared/components/Pagination"; // Asegúrate de que la ruta sea correcta
import { useNavigate } from "react-router-dom";
import { authFetch } from "../shared/utils/authFetch";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  // Nueva función para construir la query de filtros y pedir al backend
  const fetchFields = async (showLoading = false, page = currentPage) => {
    if (showLoading) setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (location) params.append("location", location);
    if (price) params.append("max_price", price);
    if (type) params.append("type", type);
    if (leastReserved) params.append("least_reserved", "true");
    params.append("page", page.toString());
    const res = await authFetch(`/api/fields?${params.toString()}`);
    const data = await res.json();
    setFilteredFields(data.data || []);
    setTotalPages(data.totalPages || 1);
    if (showLoading) setLoading(false);
  };

  // Solo mostrar loading en la primera carga
  useEffect(() => {
    fetchFields(true, currentPage);
    // eslint-disable-next-line
  }, []);

  // Para los filtros, no mostrar loading, así no hay parpadeo
  function useDebouncedEffect(effect: () => void, deps: any[], delay: number) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(effect, delay);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
      // eslint-disable-next-line
    }, deps);
  }

  // Cambiar página: cargar los campos de la página seleccionada
  useEffect(() => {
    fetchFields(false, currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  // Resetear a página 1 al cambiar filtros
  useDebouncedEffect(() => {
    setCurrentPage(1);
    fetchFields(false, 1);
  }, [search, location, price], 300);

  useEffect(() => {
    setCurrentPage(1);
    fetchFields(false, 1);
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

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      const response = await authFetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Si el logout es exitoso o el token ya está invalidado, borra el token y redirige
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

  return (
    <div className="dashboard-layout">
      <Header
        username={username}
        onUserMenu={() => setMenuOpen((open) => !open)}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <main className="dashboard-main">
        <div className="user-dashboard-container">
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
          {loading ? (
            <div className="dashboard-loading">Cargando campos...</div>
          ) : filteredFields.length === 0 ? (
            <div className="dashboard-empty">No se encontraron campos.</div>
          ) : (
            <>
              <div className="fields-grid">
                {filteredFields.map((field) => (
                  <FieldCard
                    key={field.id}
                    {...field}
                    onReserve={() => navigate(`/reserva/${field.id}`)}
                  />
                ))}
              </div>
              <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
