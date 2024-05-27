// PilaAzulContext.js

import React, { createContext, useState } from 'react';

const PilaAzulContext = createContext();

export const PilaAzulProvider = ({ children }) => {
  const [pilaAzul, setPilaAzul] = useState(0);

  const addPilaAzul = (amount) => {
    setPilaAzul(prevPilaAzul => prevPilaAzul + amount);
  };

  const consumePilaAzul = (amount) => {
    if (pilaAzul >= amount) {
      setPilaAzul(prevPilaAzul => prevPilaAzul - amount);
      return true; // Indica que o saldo foi consumido com sucesso
    } else {
      return false; // Indica que não há saldo suficiente
    }
  };

  return (
    <PilaAzulContext.Provider value={{ pilaAzul, addPilaAzul, consumePilaAzul }}>
      {children}
    </PilaAzulContext.Provider>
  );
};

export const usePilaAzul = () => {
  return React.useContext(PilaAzulContext);
};
