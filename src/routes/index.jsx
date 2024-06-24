// RoutesApp.js
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext'; // Importe o AuthProvider
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/notFound';
import Login from '../pages/Login';
import PontosTroca from '../pages/PontosTroca';
import Agendamento from '../pages/Agendamento';
import Inscricao from '../pages/Inscricao';
import Admin from '../pages/Admin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RoutesApp = () => {
  return (
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pontostroca" element={<PontosTroca />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/inscricao" element={<Inscricao />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
  );
};

export default RoutesApp;
