import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from "../contexts/AuthContext"; // Importe seu provedor de autenticação
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/notFound";
import Login from "../pages/Login";
import PontosTroca from "../pages/PontosTroca";
import Agendamento from "../pages/Agendamento";
import Inscricao from "../pages/Inscricao";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pontostroca" element={<PontosTroca />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/inscricao" element={<Inscricao />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
