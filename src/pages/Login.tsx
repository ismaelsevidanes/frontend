import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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
      const response = await fetch('http://localhost:3000/auth/login', {
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
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '48px' }}>
        <img
          src="/logo.webp"
          alt="Pitch Dreamers"
          className="register-img"
          style={{ width: 180, height: 180, marginBottom: 32, display: 'block', cursor: 'pointer' }}
          onClick={() => navigate('/')} // Redirige a la raíz al hacer clic
        />
        <div className="register-right" style={{ minWidth: 480, padding: '56px 48px 48px 48px', margin: '0 auto' }}>
          <form className="register-form" onSubmit={handleSubmit}>
            <h1 className="register-title">Iniciar Sesión</h1>
            <label>Email o usuario
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ background: '#fff', color: '#111', border: '1px solid #e0e0e0', borderRadius: 8, marginTop: 6, marginBottom: 12, fontSize: '1.08rem', padding: '14px 16px' }} />
            </label>
            <label>Contraseña
              <div className="register-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ background: '#fff', color: '#111', border: '1px solid #e0e0e0', borderRadius: 8, marginTop: 6, marginBottom: 12, fontSize: '1.08rem', padding: '14px 16px', width: '100%' }}
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;