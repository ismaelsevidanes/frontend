import React, { useEffect, useState } from "react";
import Header from "../shared/components/Header";
import "../shared/components/Header.css";
import "./account.css";

interface User {
  id: number;
  name: string;
  email: string;
}

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
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
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...(form.name && { name: form.name }),
        ...(form.email && { email: form.email }),
        ...(form.password && form.password.length > 0 ? { password: form.password } : {}),
      }),
    });
    if (res.ok) {
      setMessage("Datos actualizados correctamente");
      setEditMode(false);
      setForm({ ...form, password: "" });
      // Actualizar datos en pantalla
      setUser((u) => u ? { ...u, name: form.name, email: form.email } : null);
    } else {
      setMessage("Error al actualizar los datos");
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="account-container">
      <Header
        username={user?.name || user?.email || "Usuario"}
        onUserMenu={() => setMenuOpen((open) => !open)}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <main className="account-main">
        <div className="account-card">
          <div className="account-title">Mi Cuenta</div>
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
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para no cambiar"
                />
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
              <button className="account-edit-btn" onClick={() => setEditMode(true)}>Editar datos</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Account;
