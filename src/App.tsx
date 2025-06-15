import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import Account from './pages/Account';
import Contacto from './pages/Contacto';
import About from './pages/About';
import FAQ from './pages/FAQ';
import FieldDetail from './pages/FieldDetail';
import PaymentMethod from './pages/PaymentMethod';
import Summary from './pages/Summary';
import ReservationsHistory from './pages/ReservationsHistory';

function App() {
  // Ruta protegida: solo se puede acceder a /pago si hay datos de reserva temporal
  const ProtectedPaymentRoute = () => {
    const reservaTemp = sessionStorage.getItem('reservaTemp');
    if (!reservaTemp) {
      // Si no hay datos, redirige al home
      return <Navigate to="/dashboard" replace />;
    }
    return <PaymentMethod />;
  };

  return (
    <Routes>
      {/*Esta linea en el futuro sera para la vista inicio, falta implementarlo */}
      {/* <Route path="/" element={<Home />} /> */} 
      {/* Redirige a la vista de dashboard por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/account" element={<Account />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/reserva/:id" element={<FieldDetail />} />
      <Route path="/pago" element={<ProtectedPaymentRoute />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/reservations-history" element={<ReservationsHistory />} />
    </Routes>
  );
}

export default App;
