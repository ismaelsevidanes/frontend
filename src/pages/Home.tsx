import { useNavigate } from 'react-router-dom';
import './Home.css';

// Página principal de bienvenida. Permite navegar a login o registro.
function Home() {
  const navigate = useNavigate();

  // Navega a la página de registro
  const goToRegister = () => navigate('/register');

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a Pitch Dreamers</h1>
      </header>
      <div className="home-actions">
        {/* Botón para ir a login */}
        <div className="home-action" onClick={() => navigate('/login')}>
          <p>Iniciar Sesión</p>
        </div>
        {/* Botón para ir a registro */}
        <div className="home-action" onClick={goToRegister}>
          <p>Registrarse</p>
        </div>
      </div>
    </div>
  );
}

export default Home;