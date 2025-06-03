import React, { useEffect, useState } from "react";
import "./userDashboardStyles.css";
import Header from "../shared/components/Header";
import "../shared/components/Header.css";

interface Field {
  id: number;
  name: string;
  location: string;
  price: number;
  image: string;
  description: string;
}

const UserDashboard: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // TODO: Replace with real API call
    fetch("/api/fields")
      .then((res) => res.json())
      .then((data) => {
        setFields(data);
        setFilteredFields(data);
        setLoading(true);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = fields;
    if (search) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (location) {
      filtered = filtered.filter((f) =>
        f.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (price) {
      filtered = filtered.filter((f) => f.price <= Number(price));
    }
    setFilteredFields(filtered);
  }, [search, location, price, fields]);

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
      <div className="dashboard-filters">
        <input
          type="text"
          placeholder="Buscar campo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio máximo (€)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
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
                <img
                  src={field.image}
                  alt={field.name}
                  className="field-image"
                />
                <div className="field-info">
                  <h3>{field.name}</h3>
                  <p className="field-location">{field.location}</p>
                  <p className="field-description">{field.description}</p>
                  <div className="field-bottom">
                    <span className="field-price">{field.price} €/h</span>
                    <button className="reserve-btn">Reservar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
