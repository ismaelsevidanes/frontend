import React, { useState } from "react";
import { UserMenuProvider, useUserMenu } from "../shared/components/UserMenuProvider";
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import '../shared/components/Header.css';
import '../shared/components/Footer.css';
import './contacto.css';

const ContactoContent = () => {
  const { menuOpen, setMenuOpen, handleLogout } = useUserMenu();
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  const handleUserMenu = () => setMenuOpen((open) => !open);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <>
      <Header
        onUserMenu={handleUserMenu}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <div className="contacto-container">
        <h2 className="contacto-title">Contactar</h2>
        {enviado ? (
          <div className="contacto-success">¡Gracias por tu mensaje! Te responderemos pronto a tu correo.</div>
        ) : (
          <form onSubmit={handleSubmit} className="contacto-form">
            <label>Nombre
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
            </label>
            <label>Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>Mensaje
              <textarea name="mensaje" value={form.mensaje} onChange={handleChange} required rows={4} />
            </label>
            <button type="submit">Enviar</button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
};

const Contacto: React.FC = () => (
  <UserMenuProvider>
    <ContactoContent />
  </UserMenuProvider>
);

export default Contacto;
