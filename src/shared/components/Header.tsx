import React from "react";
import "./Header.css";

interface HeaderProps {
  username: string;
  onUserMenu: () => void;
  menuOpen: boolean;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onUserMenu, menuOpen, handleLogout }) => (
  <header className="user-dashboard-header">
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
    <div className="user-dashboard-header-right">
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
        <div className="user-dashboard-menu" onMouseLeave={onUserMenu}>
          <div className="user-dashboard-menu-arrow" />
          <button className="user-dashboard-menu-item" onClick={() => window.location.href = '/perfil'}>Mi Cuenta</button>
          <button className="user-dashboard-menu-item" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      )}
    </div>
  </header>
);

export default Header;
