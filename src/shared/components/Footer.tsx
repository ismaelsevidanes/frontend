import React from "react";
import "./Footer.css";

const Footer: React.FC = () => (
  <footer className="global-footer">
    <div className="footer-top">
      <div className="footer-brand-section">
        <button
          className="footer-logo-btn"
          tabIndex={0}
          aria-label="Ir a inicio"
          style={{ background: 'none', border: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => window.location.href = '/'}
        >
          <img src="/logo.webp" alt="Pitch Dreamers Logo" className="footer-logo" />
          <span className="footer-brand">PITCH DREAMERS</span>
        </button>
      </div>
      <div className="footer-links-section">
        <a href="/terminos-condiciones.pdf" className="footer-link" target="_blank" rel="noopener noreferrer">Términos y condiciones <span className="footer-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#003366" strokeWidth="2"/><path d="M7 8h10M7 12h10M7 16h6" stroke="#003366" strokeWidth="2"/></svg></span></a>
        <a href="/politica-privacidad.pdf" className="footer-link" target="_blank" rel="noopener noreferrer">Política de privacidad <span className="footer-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7v5c0 5.25 4.5 9.75 8 11 3.5-1.25 8-5.75 8-11V7l-8-4z" stroke="#003366" strokeWidth="2"/></svg></span></a>
        <a href="/contacto" className="footer-link">Contacto <span className="footer-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.05a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.98.35 2 .59 3.05.72A2 2 0 0 1 22 16.92z" stroke="#003366" strokeWidth="2"/></svg></span></a>
        <a href="/faq" className="footer-link faq-link">FAQ <span className="footer-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#003366" strokeWidth="2"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" stroke="#003366" strokeWidth="2"/><circle cx="12" cy="17" r="1" fill="#003366"/></svg></span></a>
      </div>
      <div className="footer-social-section footer-social-right">
        <a href="https://twitter.com/" className="footer-social" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
          <svg width="38" height="38" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 7L25 25M25 7L7 25" stroke="#003366" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </a>
        <a href="https://instagram.com/" className="footer-social" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
          <svg width="38" height="38" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="7" width="18" height="18" rx="5" stroke="#003366" strokeWidth="2.5"/>
            <circle cx="16" cy="16" r="5" stroke="#003366" strokeWidth="2.5"/>
            <circle cx="22.2" cy="9.8" r="1.2" fill="#003366"/>
          </svg>
        </a>
      </div>
    </div>
    <hr className="footer-divider" />
    <div className="footer-bottom">
      <span className="footer-copyright">Copyright © {new Date().getFullYear()} PITCH DREAMERS - All rights reserved</span>
    </div>
  </footer>
);

export default Footer;
