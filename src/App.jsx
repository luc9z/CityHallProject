// App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext'; 
import RoutesApp from '../src/routes/index';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
      <Router>
        <AuthProvider>
          <RoutesApp />
          <ToastContainer />
        </AuthProvider>
      </Router>
  );
};

export default App;
