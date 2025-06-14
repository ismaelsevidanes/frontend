import React, { useEffect, useState } from "react";
import "./Header.css";

interface HeaderProps {
  onUserMenu: () => void;
  menuOpen: boolean;
  handleLogout: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ onUserMenu, menuOpen, handleLogout, children }) => {
  const [username, setUsername] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.name || payload.email || "Usuario");
        setIsAuthenticated(true);
      } catch {
        setUsername("");
        setIsAuthenticated(false);
      }
    } else {
      setUsername("");
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
        {isAuthenticated ? (
          <>
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
