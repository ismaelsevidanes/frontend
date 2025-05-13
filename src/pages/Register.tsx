import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [receiveComms, setReceiveComms] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    // Validaciones frontend igual que backend
    if (!username.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Debe ser un email válido');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Error al registrar el usuario');
        return;
      }
      setSuccess(true);
      // Redirigir según el rol
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="register-root">
      <div className="register-grid">
        <div className="register-left">
          <img
            src="/logo.webp"
            alt="Pitch Dreamers"
            className="register-img"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')} // Redirige a la raíz al hacer clic
          />
          <div className="register-benefits">
            <h4>Ventajas al Registrarte</h4>
            <ul>
              <li>Lorem ipsum dolor sit amet consectetur</li>
              <li>Lorem ipsum dolor sit amet consectetur</li>
              <li>Puedes Crear un Perfil completamente Único</li>
              <li>¡Es Completamente gratis!</li>
            </ul>
          </div>
        </div>
        <div className="register-right">
          <form className="register-form" onSubmit={handleSubmit}>
            <h1 className="register-title">Registrarse</h1>
            <label>Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ background: '#fff' }} />
            </label>
            <label>Usuario
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ background: '#fff' }} />
            </label>
            <label>Contraseña
              <div className="register-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ background: '#fff' }}
                />
                <span
                  className="register-password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={0}
                  role="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C2.73 7.61 7.11 4.5 12 4.5C16.89 4.5 21.27 7.61 23 12C21.27 16.39 16.89 19.5 12 19.5C7.11 19.5 2.73 16.39 1 12Z" stroke="#888" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3.5" stroke="#888" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C2.73 7.61 7.11 4.5 12 4.5C16.89 4.5 21.27 7.61 23 12C21.27 16.39 16.89 19.5 12 19.5C7.11 19.5 2.73 16.39 1 12Z" stroke="#888" strokeWidth="2"/>
                      <line x1="4" y1="4" x2="20" y2="20" stroke="#888" strokeWidth="2"/>
                    </svg>
                  )}
                </span>
              </div>
            </label>
            <label>Confirmar Contraseña
              <div className="register-password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{ background: '#fff' }}
                />
                <span
                  className="register-password-toggle"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  tabIndex={0}
                  role="button"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C2.73 7.61 7.11 4.5 12 4.5C16.89 4.5 21.27 7.61 23 12C21.27 16.39 16.89 19.5 12 19.5C7.11 19.5 2.73 16.39 1 12Z" stroke="#888" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3.5" stroke="#888" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C2.73 7.61 7.11 4.5 12 4.5C16.89 4.5 21.27 7.61 23 12C21.27 16.39 16.89 19.5 12 19.5C7.11 19.5 2.73 16.39 1 12Z" stroke="#888" strokeWidth="2"/>
                      <line x1="4" y1="4" x2="20" y2="20" stroke="#888" strokeWidth="2"/>
                    </svg>
                  )}
                </span>
              </div>
            </label>
            <div className="register-checkbox-row">
              <label className="register-checkbox">
                <input type="checkbox" checked={receiveComms} onChange={e => setReceiveComms(e.target.checked)} />
                <span>Recibir novedades por correo</span>
              </label>
            </div>
            <div className="register-checkbox-row">
              <label className="register-checkbox">
                <input type="checkbox" checked={staySignedIn} onChange={e => setStaySignedIn(e.target.checked)} />
                <span>Seguir Conectado</span>
              </label>
            </div>
            {success && (
              <div className="register-success">
                <span className="register-success-icon">✔️</span> ¡Registro exitoso!
              </div>
            )}
            {error && <div className="register-error">{error}</div>}
            <div className="register-legal">
              Al crear una cuenta, aceptas nuestros <a href="#">términos</a> y <a href="#">política de privacidad</a>.
            </div>
            <button type="submit" className="register-btn">Crear Cuenta Grátis</button>
            <div className="register-divider">or</div>
            <button type="button" className="register-social google">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="register-social-icon" />
              Registrarse con Google
            </button>
            <button type="button" className="register-social instagram">
              <img src="https://www.svgrepo.com/show/452229/instagram-1.svg" alt="Instagram" className="register-social-icon" />
              Registrarse con Instagram
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;