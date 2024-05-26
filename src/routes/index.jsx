// routes/index.jsx
import {Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/notFound';
import Login from '../pages/Login';
import PontosTroca from '../pages/PontosTroca';
import Agendamento from '../pages/Agendamento';
import Inscricao from '../pages/Inscricao';

const RoutesApp = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pontostroca" element={<PontosTroca />} />
        <Route path="/agendamento" element={<Agendamento />} />
        <Route path="/inscricao" element={<Inscricao />} />
      </Routes>
  );
};

export default RoutesApp;
