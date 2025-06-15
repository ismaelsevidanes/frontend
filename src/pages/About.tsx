import React, { useState } from "react";
import Header from "../shared/components/Header";
import Footer from "../shared/components/Footer";
import "./About.css";

const About: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  return (
    <div className="about-layout">
      <Header
        onUserMenu={() => setMenuOpen((open) => !open)}
        menuOpen={menuOpen}
        handleLogout={handleLogout}
      />
      <main className="about-main">
        <div className="about-card">
          <div className="about-photo-section">
            <img
              src="/logo.webp"
              alt="Foto del equipo"
              className="about-photo"
            />
          </div>
          <div className="about-info-section">
            <h1 className="about-title">
              <span className="about-title-hello">Hola, somos</span>{" "}
              <span className="about-title-name">Pitch Dreamers</span>
            </h1>
            <h2 className="about-role">Equipo de desarrollo y diseño</h2>
            <p className="about-desc">
              Pitch Dreamers es una plataforma creada para facilitar la reserva de
              campos de fútbol y la gestión de partidos entre amigos o para
              conocer nuevas personas. Nuestro objetivo es digitalizar y
              modernizar la experiencia deportiva local, haciendo que reservar y
              organizar partidos sea tan fácil como un click.
            </p>
            <p className="about-desc">
              Nos apasiona el deporte, la tecnología y el diseño. Trabajamos para
              que cada usuario disfrute de una experiencia sencilla, rápida y
              segura.
            </p>
            <button
              className="about-contact-btn"
              onClick={() => (window.location.href = "/contacto")}
            >
              ¡Contáctanos!
            </button>
            <div className="about-contact-info">
              <span>contacto@pitchdreamers.com</span>
              <div className="about-socials">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="#003366"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="mailto:contacto@pitchdreamers.com"
                  aria-label="Email"
                >
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    stroke="#003366"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
