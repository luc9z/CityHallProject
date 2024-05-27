import React, { useState, useEffect, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./style.module.scss";
import { usePilaAzul } from "../../contexts/PilaAzulContext";
import AdicionarSaldo from "../../components/AdicionarSaldo";
import { db } from "../../services/firebaseConnection";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";

const quadras = ["Quadra 1", "Quadra 2", "Quadra 3"];

const horariosDisponiveisPorQuadra = {
  "Quadra 1": ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
  "Quadra 2": ["08:00", "11:00", "13:00", "15:00", "17:00"],
  "Quadra 3": ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
};

const Agendamento = () => {
  const { pilaAzul, addPilaAzul } = usePilaAzul();
  const { user } = useContext(AuthContext);
  const [selectedQuadra, setSelectedQuadra] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      if (user && user.uid) {
        const q = query(
          collection(db, "agendamentos"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const agendamentosList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAgendamentos(agendamentosList);
      }
    };

    fetchAgendamentos();
  }, [user]);

  useEffect(() => {
    const fetchHorariosDisponiveis = async () => {
      if (selectedDate && selectedQuadra) {
        const q = query(
          collection(db, "agendamentos"),
          where("data", "==", selectedDate),
          where("quadra", "==", selectedQuadra)
        );
        const querySnapshot = await getDocs(q);
        const agendamentosExistentes = querySnapshot.docs.map((doc) => doc.data().hora);

        const horariosFiltrados = horariosDisponiveisPorQuadra[selectedQuadra]?.filter(
          (horario) => !agendamentosExistentes.includes(horario)
        ) || [];

        setAvailableTimes(horariosFiltrados);
      } else {
        setAvailableTimes([]);
      }
    };

    fetchHorariosDisponiveis();
  }, [selectedDate, selectedQuadra]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amountNeeded = 10;
    if (pilaAzul < amountNeeded) {
      setIsModalOpen(true);
      return;
    }

    await realizarAgendamento();
  };

  const realizarAgendamento = async () => {
    const agendamento = {
      quadra: selectedQuadra,
      data: selectedDate,
      hora: selectedTime,
      userId: user.uid,
    };

    try {
      await addDoc(collection(db, "agendamentos"), agendamento);
      toast.success("Agendamento realizado com sucesso!");
      addPilaAzul(-10);
      setSelectedQuadra("");
      setSelectedDate("");
      setSelectedTime("");
      setAgendamentos([...agendamentos, agendamento]);
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error("Erro ao realizar o agendamento. Tente novamente.");
    }
  };

  const cancelarAgendamento = async (id) => {
    try {
      await deleteDoc(doc(db, "agendamentos", id));
      setAgendamentos(agendamentos.filter((agendamento) => agendamento.id !== id));
      toast.success("Agendamento cancelado com sucesso!");
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar o agendamento. Tente novamente.");
    }
  };

  return (
    <div className={styles.agendamento}>
      <h1 className={styles.title}>Agendamento</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Selecione a Quadra:
          <select
            value={selectedQuadra}
            onChange={(e) => setSelectedQuadra(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Selecione uma quadra</option>
            {quadras.map((quadra, index) => (
              <option key={index} value={quadra}>
                {quadra}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Selecione a Data:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Selecione a Hora:
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className={styles.select}
            required
            disabled={!selectedDate || !selectedQuadra}
          >
            <option value="">Selecione uma hora</option>
            {availableTimes.map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={styles.button}>
          Agendar
        </button>
        <p>Saldo Pila Azul: {pilaAzul}</p>
      </form>
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setIsModalOpen(false)}
            >
              Fechar
            </button>
            <AdicionarSaldo />
          </div>
        </div>
      )}
      <div className={styles.meusAgendamentos}>
        <h2>Meus Agendamentos</h2>
        {agendamentos.length === 0 ? (
          <p>Você não tem nenhum agendamento.</p>
        ) : (
          <ul>
            {agendamentos.map((agendamento) => (
              <li key={agendamento.id}>
                <p>Quadra: {agendamento.quadra}</p>
                <p>Data: {agendamento.data}</p>
                <p>Hora: {agendamento.hora}</p>
                <button
                  className={styles.cancelButton}
                  onClick={() => cancelarAgendamento(agendamento.id)}
                >
                  Cancelar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Agendamento;
