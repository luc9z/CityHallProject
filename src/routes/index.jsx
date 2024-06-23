// src/routes/RoutesApp.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PilaAzulProvider } from '../contexts/PilaAzulContext';
import { AuthProvider } from '../contexts/AuthContext';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/notFound'; // Corrija a importação aqui
import Login from '../pages/Login';
import PontosTroca from '../pages/PontosTroca';
import Agendamento from '../pages/Agendamento';
import Inscricao from '../pages/Inscricao';

const RoutesApp = () => {
  return (
    <Router>
      <AuthProvider>
        <PilaAzulProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pontostroca" element={<PontosTroca />} />
            <Route path="/agendamento" element={<Agendamento />} />
            <Route path="/inscricao" element={<Inscricao />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PilaAzulProvider>
      </AuthProvider>
    </Router>
  );
};

export default RoutesApp;
