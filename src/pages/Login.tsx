import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Debe ser un email válido');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        return;
      }
      localStorage.setItem('token', data.token);
      setSuccess(true);
      // Redirección automática tras login
      const redirect = localStorage.getItem('redirectAfterLogin');
      if (redirect) {
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirect;
        return;
      }
      // Redirigir a la ruta previa si existe (por ejemplo, FieldDetail o PaymentMethod)
      const from = (location.state as any)?.from;
      if (from) {
        navigate(from);
      } else if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="register-root">
      <div className="register-container">
        <img
          src="/logo.webp"
          alt="Pitch Dreamers"
          className="register-img"
          onClick={() => navigate('/')}
        />
        <div className="register-right">
          <form className="register-form" onSubmit={handleSubmit}>
            <h1 className="register-title">Iniciar Sesión</h1>
            <label>Email o usuario
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required aria-required="true" aria-label="Correo electrónico o usuario" />
            </label>
            <label>Contraseña
              <div className="register-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  aria-required="true"
                  aria-label="Contraseña"
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
            <div className="register-checkbox-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
              <label className="register-checkbox" style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                <input type="checkbox" checked={staySignedIn} onChange={e => setStaySignedIn(e.target.checked)} />
                <span style={{ marginLeft: 6 }}>Mantener Conectado</span>
              </label>
              <a href="#" style={{ color: '#888', fontSize: '1rem', textDecoration: 'underline', marginLeft: 'auto' }}>Recordar contraseña</a>
            </div>
            {success && (
              <div className="register-success">
                <span className="register-success-icon">✔️</span> ¡Login exitoso!
              </div>
            )}
            {error && <div className="register-error">{error}</div>}
            <button type="submit" className="register-btn">Iniciar Sesión</button>
            <div className="register-divider">or</div>
            <button type="button" className="register-social google">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="register-social-icon" />
              Iniciar sesión con Google
            </button>
            <button type="button" className="register-social instagram">
              <img src="https://www.svgrepo.com/show/452229/instagram-1.svg" alt="Instagram" className="register-social-icon" />
              Iniciar sesión con Instagram
            </button>
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <a
                href="#"
                style={{ color: '#1976d2', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', fontSize: '1.08rem' }}
                onClick={e => {
                  e.preventDefault();
                  const from = (location.state as any)?.from;
                  if (from) {
                    navigate('/register', { state: { from } });
                  } else {
                    navigate('/register');
                  }
                }}
              >
                Crear Cuenta Gratis
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;