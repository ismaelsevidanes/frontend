import React from "react";
import { useAdmin } from "./AdminContext";
import { FaUsers, FaCalendarAlt, FaFutbol, FaMoneyCheckAlt, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./adminSidebar.css";

const items = [
  { key: "users", label: "Usuarios", icon: <FaUsers /> },
  { key: "fields", label: "Campos De Futbol", icon: <FaFutbol /> },
  { key: "reservations", label: "Reservas", icon: <FaCalendarAlt /> },
  { key: "payments", label: "Metodos de Pagos", icon: <FaMoneyCheckAlt /> },
];

const AdminSidebar: React.FC = () => {
  const { selectedModel, setSelectedModel } = useAdmin();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="admin-sidebar" aria-label="Menú de administración">
      <ul style={{ marginBottom: 32 }}>
        <li>
          <button onClick={handleGoHome} style={{ fontWeight: 600 }}>
            <FaHome /> <span>Ir a Inicio</span>
          </button>
        </li>
        <li>
          <button onClick={handleLogout} style={{ fontWeight: 600 }}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </li>
      </ul>
      <ul>
        {items.map(item => (
          <li key={item.key}>
            <button
              className={selectedModel === item.key ? "active" : ""}
              onClick={() => setSelectedModel(item.key)}
              aria-current={selectedModel === item.key ? "page" : undefined}
            >
              {item.icon} <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminSidebar;
