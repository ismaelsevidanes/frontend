import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import Account from './pages/Account';
import Contacto from './pages/Contacto';
import FAQ from './pages/FAQ';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/account" element={<Account />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  );
}

export default App;
