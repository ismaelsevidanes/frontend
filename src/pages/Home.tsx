import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const goToRegister = () => navigate('/register');

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a Pitch Dreamers</h1>
      </header>
      <div className="home-actions">
        <div className="home-action" onClick={() => navigate('/login')}>
          <p>Iniciar Sesión</p>
        </div>
        <div className="home-action" onClick={goToRegister}>
          <p>Registrarse</p>
        </div>
      </div>
    </div>
  );
}

export default Home;