// Importações necessárias (mantenha as que já estão presentes)
import React, { useState, useEffect, useContext, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-calendar/dist/Calendar.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import styles from "./style.module.scss";
import { db } from "../../services/firebaseConnection";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { AuthContext, useAuth } from "../../contexts/AuthContext";
import Calendar from "react-calendar";

// Quadras images (exemplo de imagens)
import ginasio1Image from "../../assets/pics/quadra1.jpg";
import ginasio2Image from "../../assets/pics/quadra1.jpg";
import heronImage from "../../assets/pics/quadra1.jpg";
import emasaImage from "../../assets/pics/quadra1.jpg";
import riachueloImage from "../../assets/pics/quadra1.jpg";
import vistaAlegreImage from "../../assets/pics/quadra1.jpg";
import belizarioImage from "../../assets/pics/quadra1.jpg";
import voleiAreiaImage from "../../assets/pics/quadra1.jpg";

const quadras = [
  { name: "Ginásio Quadra 1", image: ginasio1Image },
  { name: "Ginásio Quadra 2", image: ginasio2Image },
  { name: "Heron", image: heronImage },
  { name: "Emasa", image: emasaImage },
  { name: "Riachuelo", image: riachueloImage },
  { name: "Vista Alegre", image: vistaAlegreImage },
  { name: "Belizario", image: belizarioImage },
  { name: "Quadra de Vôlei de Areia Ginásio", image: voleiAreiaImage },
];

const horariosDisponiveisPorQuadra = {
  "Ginásio Quadra 1": ["18:00", "19:00", "20:00", "21:00"],
  "Ginásio Quadra 2": ["18:00", "19:00", "20:00", "21:00"],
  Heron: ["18:00", "19:00", "20:00", "21:00"],
  Emasa: ["18:00", "19:00", "20:00", "21:00"],
  Riachuelo: ["18:00", "19:00", "20:00", "21:00"],
  "Vista Alegre": ["18:00", "19:00", "20:00", "21:00"],
  Belizario: ["18:00", "19:00", "20:00", "21:00"],
  "Quadra de Vôlei de Areia Ginásio": ["18:00", "19:00", "20:00", "21:00"],
};

const amountNeeded = 5; // Defina aqui o valor necessário para agendar

const Agendamento = () => {
  const { updateBalance } = useAuth(); // Utilize useAuth para acessar updateBalance
  const { user, setUser } = useContext(AuthContext);
  const [selectedQuadra, setSelectedQuadra] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const sliderRef = useRef(null);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "50px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          centerMode: true,
          centerPadding: "50px",
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
          centerPadding: "50px",
        },
      },
    ],
  };

  useEffect(() => {
    const fetchAgendamentos = async () => {
      if (user && user.uid) {
        try {
          const q = query(collection(db, "agendamentos"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const agendamentosList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAgendamentos(agendamentosList);
        } catch (error) {
          console.error("Erro ao buscar agendamentos:", error);
          toast.error("Erro ao buscar agendamentos. Tente novamente.");
        }
      }
    };

    fetchAgendamentos();
  }, [user]);

  useEffect(() => {
    const fetchHorariosDisponiveis = async () => {
      if (!selectedDate || !selectedQuadra) {
        return;
      }

      try {
        const today = new Date();
        const selectedDay = selectedDate.getDay();

        const q = query(
          collection(db, "agendamentos"),
          where("data", "==", selectedDate.toISOString().split("T")[0]),
          where("quadra", "==", selectedQuadra)
        );
        const querySnapshot = await getDocs(q);
        const agendamentosExistentes = querySnapshot.docs.map((doc) => doc.data().hora);

        const horariosFiltrados =
          horariosDisponiveisPorQuadra[selectedQuadra]?.filter(
            (horario) =>
              !agendamentosExistentes.includes(horario) &&
              new Date(`${selectedDate.toISOString().split("T")[0]}T${horario}`) > today
          ) || [];

        setAvailableTimes(horariosFiltrados);
      } catch (error) {
        console.error("Erro ao buscar horários disponíveis:", error);
        toast.error("Erro ao buscar horários disponíveis. Tente novamente.");
      }
    };

    fetchHorariosDisponiveis();
  }, [selectedDate, selectedQuadra]);

  const handleDateChange = (date) => {
    if (date.getDay() === 0 || date.getDay() === 6) {
      toast.error("Não é possível agendar para finais de semana.");
      return;
    }
    setSelectedDate(date);
    setSelectedTime(""); // Limpa o horário selecionado ao alterar a data
  };

  const handleQuadraClick = (quadraName, index) => {
    setSelectedQuadra(quadraName);
    setSelectedTime(""); // Limpa o horário selecionado ao alterar a quadra
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user || !user.saldo || user.saldo < amountNeeded) {
      toast.error("Saldo insuficiente para agendar!");
      return;
    }
  
    if (!selectedQuadra || !selectedDate || !selectedTime) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
  
    try {
      await addDoc(collection(db, "agendamentos"), {
        userId: user.uid,
        quadra: selectedQuadra,
        data: selectedDate.toISOString().split("T")[0],
        hora: selectedTime,
      });
  
      // Atualiza o saldo do usuário no Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        saldo: user.saldo - amountNeeded,
      });
  
      // Atualiza o saldo do usuário no contexto
      const updatedUser = { ...user, saldo: user.saldo - amountNeeded };
      setUser(updatedUser);
      updateBalance(updatedUser.saldo); // Chama a função updateBalance do contexto
  
      // Atualiza localmente os agendamentos
      const updatedAgendamentos = [
        ...agendamentos,
        {
          userId: user.uid,
          quadra: selectedQuadra,
          data: selectedDate.toISOString().split("T")[0],
          hora: selectedTime,
        },
      ];
      setAgendamentos(updatedAgendamentos);
  
      toast.success("Agendamento realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error("Erro ao agendar. Tente novamente.");
    }
  };
  
  const cancelarAgendamento = async (id, quadra, data, hora) => {
    try {
      await deleteDoc(doc(db, "agendamentos", id));
  
      // Atualiza localmente os agendamentos após o cancelamento
      const updatedAgendamentos = agendamentos.filter(
        (agendamento) => agendamento.id !== id
      );
      setAgendamentos(updatedAgendamentos);
  
      // Devolver o saldo ao usuário ao cancelar
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        saldo: user.saldo + amountNeeded,
      });
  
      // Atualiza o saldo do usuário no contexto
      const updatedUser = { ...user, saldo: user.saldo + amountNeeded };
      setUser(updatedUser);
      updateBalance(updatedUser.saldo); // Chama a função updateBalance do contexto
  
      toast.success("Agendamento cancelado com sucesso!");
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar agendamento. Tente novamente.");
    }
  };
  
  // Função para desabilitar sábados e domingos no calendário
  const tileDisabled = ({ date }) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Desabilita sábados (day === 6) e domingos (day === 0)
  };
  
  return (
    <div className={styles.agendamento}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          <span>Selecione a Quadra:</span>
          <div className={styles.quadras}>
            <Slider ref={sliderRef} {...sliderSettings}>
              {quadras.map((quadra, index) => (
                <div
                  key={quadra.name}
                  className={`${styles.quadra} ${
                    selectedQuadra === quadra.name ? styles.selected : ""
                  }`}
                  onClick={() => handleQuadraClick(quadra.name, index)}
                >
                  <img src={quadra.image} alt={quadra.name} />
                  <p className={styles.quadraName}>{quadra.name}</p>
                </div>
              ))}
            </Slider>
          </div>
        </label>
        <label className={styles.label}>
         <span>Selecione a Data:</span>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={new Date()}
            className={styles.customCalendar}
            tileDisabled={tileDisabled} // Aplica a função de desabilitar dias
          />
        </label>
        <label className={styles.label}>
          <span>Selecione o Horário:</span>
          <div className={styles.horarios}>
            {availableTimes.map((time, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.horario} ${
                  selectedTime === time ? styles.selected : ""
                }`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </label>
        <button type="submit" className={styles.button} style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", border: "none", cursor: "pointer" }}>
          Agendar
        </button>
        {user && user.saldo !== undefined && (
          <span>Saldo Pila Azul: {user.saldo}</span>
        )}
      </form>
      <div className={styles.meusAgendamentos}>
        <h2>Meus Agendamentos</h2>
        {agendamentos.length === 0 ? (
          <p>Você não tem nenhum agendamento.</p>
        ) : (
          agendamentos.map((agendamento) => (
            <div key={agendamento.id} className={styles.agendamentoItem}>
              <div className={styles.agendamentoInfo}>
                <img src={quadras.find(q => q.name === agendamento.quadra)?.image} alt={agendamento.quadra} className={styles.agendamentoImage} />
                <div className={styles.agendamentoDetails}>
                  <p>
                    Quadra: {agendamento.quadra},
                  
                  </p>
                  <p>
                    Data: {agendamento.data}
                    </p>
                  <p>
                    Hora: {agendamento.hora}
                    </p>
                  <button
                    onClick={() => cancelarAgendamento(agendamento.id, agendamento.quadra, agendamento.data, agendamento.hora)}
                    className={styles.cancelButton}
                    style={{ backgroundColor: "#f44336", color: "white", padding: "5px 10px", border: "none", cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Agendamento;
