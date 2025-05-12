import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Modal from '../shared/components/Modal';
import './Home.css';

function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const openRegister = () => setIsRegisterOpen(true);
  const closeRegister = () => setIsRegisterOpen(false);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a Pitch Dreamers</h1>
      </header>
      <div className="home-actions">
        <div className="home-action" onClick={openLogin}>
          <p>Iniciar Sesión</p>
        </div>
        <div className="home-action" onClick={openRegister}>
          <p>Registrarse</p>
        </div>
      </div>

      <Modal isOpen={isLoginOpen} onClose={closeLogin}>
        <Login />
      </Modal>

      <Modal isOpen={isRegisterOpen} onClose={closeRegister}>
        <Register />
      </Modal>
    </div>
  );
}

export default Home;