// AdicionarSaldo.js

import React, { useState } from "react";
import { usePilaAzul } from "../contexts/PilaAzulContext";

const AdicionarSaldo = () => {
  const [amount, setAmount] = useState(0);
  const { addPilaAzul } = usePilaAzul();

  const handleSubmit = (e) => {
    e.preventDefault();
    addPilaAzul(amount);
    setAmount(0);
  };

  return (
    <div>
      <h2>Adicionar Saldo à Pila Azul</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Valor:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
            />
          </label>
          <button type="submit">Adicionar Saldo</button>
        </form>
    </div>
  );
};

export default AdicionarSaldo;
