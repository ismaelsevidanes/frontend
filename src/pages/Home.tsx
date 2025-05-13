import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Modal from '../shared/components/Modal';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const goToRegister = () => navigate('/register');

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a Pitch Dreamers</h1>
      </header>
      <div className="home-actions">
        <div className="home-action" onClick={openLogin}>
          <p>Iniciar Sesión</p>
        </div>
        <div className="home-action" onClick={goToRegister}>
          <p>Registrarse</p>
        </div>
      </div>

      <Modal isOpen={isLoginOpen} onClose={closeLogin}>
        <Login />
      </Modal>
    </div>
  );
}

export default Home;