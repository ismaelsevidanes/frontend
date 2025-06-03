import React, { useState } from "react";

const Contacto: React.FC = () => {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="contacto-container" style={{ maxWidth: 500, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", padding: 32 }}>
      <h2 style={{ color: "#003366", marginBottom: 24 }}>Contacto</h2>
      {enviado ? (
        <div style={{ color: "#5C9563", fontWeight: 500, fontSize: 18 }}>¡Gracias por tu mensaje! Te responderemos pronto.</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <label>Nombre
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required style={{ padding: 10, borderRadius: 6, border: "1.5px solid #d0d0d0", marginTop: 4 }} />
          </label>
          <label>Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ padding: 10, borderRadius: 6, border: "1.5px solid #d0d0d0", marginTop: 4 }} />
          </label>
          <label>Mensaje
            <textarea name="mensaje" value={form.mensaje} onChange={handleChange} required rows={4} style={{ padding: 10, borderRadius: 6, border: "1.5px solid #d0d0d0", marginTop: 4 }} />
          </label>
          <button type="submit" style={{ background: "#003366", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 600, fontSize: 16, marginTop: 8, cursor: "pointer" }}>Enviar</button>
        </form>
      )}
    </div>
  );
};

export default Contacto;
