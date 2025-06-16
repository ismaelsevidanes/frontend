import React, { useEffect } from "react";
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import '../shared/components/Header.css';
import '../shared/components/Footer.css';
import { UserMenuProvider, useUserMenu } from "../shared/components/UserMenuProvider";
import Breadcrumbs from "../shared/components/Breadcrumbs";

const FAQContent = () => {
  const { menuOpen, setMenuOpen, handleLogout } = useUserMenu();

  useEffect(() => {
    // Lógica de efecto, si es necesaria en el futuro
  }, []);

  const handleUserMenu = () => setMenuOpen((open) => !open);

  return (
    <>
      <Header
        onUserMenu={handleUserMenu}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <Breadcrumbs />
      <div className="faq-container" style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", padding: 32 }}>
        <h2 style={{ color: "#003366", marginBottom: 24 }}>Preguntas Frecuentes (FAQ)</h2>
        <div style={{ marginBottom: 18 }}>
          <b>¿Qué es Pitch Dreamers?</b>
          <div>Pitch Dreamers es una plataforma para compartir y descubrir ideas innovadoras y proyectos.</div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <b>¿Cómo puedo registrarme?</b>
          <div>Puedes registrarte haciendo clic en "Registrarse" y completando el formulario con tus datos.</div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <b>¿Es gratis usar Pitch Dreamers?</b>
          <div>Sí, la plataforma es completamente gratuita para todos los usuarios.</div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <b>¿Cómo contacto con soporte?</b>
          <div>Puedes usar el formulario de la sección Contacto para enviarnos tus dudas o sugerencias.</div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const FAQ: React.FC = () => (
  <UserMenuProvider>
    <FAQContent />
  </UserMenuProvider>
);

export default FAQ;
