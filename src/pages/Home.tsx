import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a Dreamer Fields</h1>
      </header>
      <div className="home-actions">
        <div className="home-action" onClick={() => navigate('/login')}>
          <FaSignInAlt size={50} />
          <p>Iniciar Sesión</p>
        </div>
        <div className="home-action" onClick={() => navigate('/register')}>
          <FaUserPlus size={50} />
          <p>Registrarse</p>
        </div>
      </div>
    </div>
  );
}

export default Home;