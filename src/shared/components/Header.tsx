import React, { useEffect, useState } from "react";
import "./Header.css";
import { useUserMenu } from "./UserMenuProvider";

interface HeaderProps {
  onUserMenu: () => void;
  menuOpen: boolean;
  handleLogout: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ onUserMenu, menuOpen, handleLogout, children }) => {
  const { username } = useUserMenu();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        JSON.parse(atob(token.split(".")[1]));
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <header className="user-dashboard-header sticky-header">
      <div
        className="user-dashboard-header-left"
        style={{ cursor: 'pointer' }}
        onClick={() => window.location.href = '/'}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            window.location.href = '/';
          }
        }}
        aria-label="Ir a inicio"
        role="button"
      >
        <img src="/logo.webp" alt="Logo" className="user-dashboard-logo" />
        <span className="user-dashboard-title">PITCH DREAMERS</span>
      </div>
      {children && (
        <div className="header-stepper-wrapper">
          {children}
        </div>
      )}
      <div className="user-dashboard-header-right">
        <span
          className="header-link"
          style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginRight: '18px' }}
          onClick={() => window.location.href = '/about'}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.location.href = '/about';
            }
          }}
          aria-label="Sobre Nosotros"
          role="button"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="8" />
          </svg>
          <span className="header-link-label">Sobre Nosotros</span>
        </span>
        <span
          className="header-link"
          style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginRight: '18px' }}
          onClick={() => window.location.href = '/contacto'}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.location.href = '/contacto';
            }
          }}
          aria-label="Contacto"
          role="button"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
            <path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.5" />
            <polyline points="17 8 12 13 7 8" />
          </svg>
          <span className="header-link-label">Contacto</span>
        </span>
        {isAuthenticated ? (
          <>
            <span
              className="header-history-link"
              style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginRight: '18px' }}
              onClick={() => window.location.href = '/reservations-history'}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  window.location.href = '/reservations-history';
                }
              }}
              aria-label="Ir al historial de reservas"
              role="button"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <span className="header-history-label">Historial de reservas</span>
            </span>
            <span
              className="user-dashboard-user-icon-name-wrapper"
              style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={onUserMenu}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onUserMenu();
                }
              }}
              aria-label="Abrir menú de usuario"
              role="button"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#232323" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <circle cx="12" cy="8" r="4" />
                <path d="M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
              </svg>
              <span className="user-dashboard-username">{username}</span>
            </span>
            {menuOpen && (
              <div
                className="user-dashboard-menu"
                onMouseLeave={window.innerWidth > 700 ? onUserMenu : undefined}
                tabIndex={0}
                onBlur={onUserMenu}
              >
                <div className="user-dashboard-menu-arrow" />
                <button className="user-dashboard-menu-item" onClick={() => { onUserMenu(); window.location.href = '/account'; }}>Mi Cuenta</button>
                <button className="user-dashboard-menu-item" onClick={() => { onUserMenu(); handleLogout(); }}>Cerrar Sesión</button>
              </div>
            )}
          </>
        ) : (
          <>
            <button className="header-login-btn" onClick={() => window.location.href = '/login'}>Iniciar sesión</button>
            <button className="header-register-btn" onClick={() => window.location.href = '/register'}>Registrarse</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
