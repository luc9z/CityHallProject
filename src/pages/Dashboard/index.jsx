import React, { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./style.module.scss";
import { AuthContext } from "../../contexts/AuthContext";
import backgroundImage from "../../assets/pics/6202241.jpg";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/" />;
  }

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div
      className={styles.dashboard}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.container}>
        <div className={styles.userBox}>
          <img src={user.profilePhoto} className={styles.profilePhoto} alt="" />
          <p className={styles.nameWelcome}>Olá {user.firstName}!</p>
        </div>
        <h1 className={styles.title}>Painel Inicial</h1>
        <p className={styles.subtitle}>Selecione uma opção abaixo:</p>
        <div className={styles.buttonContainers}>
          <div className={styles.buttonContainer}>
            <button
              className={styles.fullButton}
              onClick={() => handleNavigate("/agendamento")}
            >
              Agendamento
            </button>
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={styles.fullButton}
              onClick={() => handleNavigate("/pontostroca")}
            >
              Pontos de Troca
            </button>
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={styles.fullButton}
              onClick={() => handleNavigate("/inscricao")}
            >
              Inscrição no Campeonato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
