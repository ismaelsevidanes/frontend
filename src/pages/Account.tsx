import React, { useEffect, useState } from "react";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import { authFetch } from "../shared/utils/authFetch";
import { UserMenuProvider, useUserMenu } from "../shared/components/UserMenuProvider";
import "../shared/components/Header.css";
import "../shared/components/Footer.css";
import "./account.css";
import Breadcrumbs from "../shared/components/Breadcrumbs";

interface User {
  id: number;
  name: string;
  email: string;
}

const AccountContent: React.FC = () => {
  const { menuOpen, setMenuOpen, handleLogout, updateUsername } = useUserMenu();
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    authFetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setForm({ name: data.name, email: data.email, password: "" });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        window.location.href = "/login";
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    // Validaciones frontend igual que backend
    if (!form.name.trim()) {
      setMessage("El nombre es obligatorio");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setMessage("Debe ser un email válido");
      return;
    }
    if (form.password && form.password.length > 0) {
      if (form.password.length < 8) {
        setMessage("La contraseña debe tener al menos 8 caracteres");
        return;
      }
      if (!/[A-Z]/.test(form.password)) {
        setMessage("La contraseña debe tener al menos una mayúscula");
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        setMessage("La contraseña debe tener al menos un símbolo");
        return;
      }
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await authFetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(form.name && { name: form.name }),
        ...(form.email && { email: form.email }),
        ...(form.password && form.password.length > 0 ? { password: form.password } : {}),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessage("Datos actualizados correctamente");
      setEditMode(false);
      setForm({ ...form, password: "" });
      // Actualiza el estado user y el contexto username inmediatamente
      const newName = form.name;
      setUser((u) => u ? { ...u, name: newName, email: form.email } : null);
      if (data.token) {
        localStorage.setItem("token", data.token);
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        updateUsername(payload.name || payload.email || "Usuario");
      } else {
        updateUsername(newName);
      }
      // Fuerza un rerender del Header (opcional: puedes usar un estado global o contexto para esto si lo necesitas en más sitios)
    } else {
      setMessage("Error al actualizar los datos");
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <>
      <Header
        onUserMenu={() => setMenuOpen((open) => !open)}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <Breadcrumbs />
      <main className="account-main">
        <div className="account-card">
          <h2 className="account-title">Mi Cuenta</h2>
          {editMode ? (
            <form className="account-form" onSubmit={handleSave}>
              <label>
                Nombre:
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Nueva contraseña:
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Dejar en blanco para no cambiar"
                    style={{ paddingRight: 40 }}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={0}
                    role="button"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C2.73 7.61 7.11 4.5 12 4.5C16.89 4.5 21.27 7.61 23 12C21.27 16.39 16.89 19.5 12 19.5C7.11 19.5 2.73 16.39 1 12Z" stroke="#888" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3.5" stroke="#888" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C2.73 7.61 7.11 4.5 12 4.5C16.89 4.5 21.27 7.61 23 12C21.27 16.39 16.89 19.5 12 19.5C7.11 19.5 2.73 16.39 1 12Z" stroke="#888" strokeWidth="2"/>
                        <line x1="4" y1="4" x2="20" y2="20" stroke="#888" strokeWidth="2"/>
                      </svg>
                    )}
                  </span>
                </div>
              </label>
              <div className="account-form-actions">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setEditMode(false)}>Cancelar</button>
              </div>
              {message && <div className="account-message">{message}</div>}
            </form>
          ) : (
            <div className="account-info">
              <div><b>Nombre:</b> {user?.name}</div>
              <div><b>Email:</b> {user?.email}</div>
              <div><b>Contraseña:</b> ********</div>
              <button className="account-edit-btn" onClick={() => setEditMode(true)}>Editar datos</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

const Account: React.FC = () => (
  <UserMenuProvider>
    <AccountContent />
  </UserMenuProvider>
);

export default Account;
