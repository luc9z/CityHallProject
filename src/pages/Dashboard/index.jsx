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
    <div className={styles.dashboard} style={{backgroundImage: `url(${backgroundImage})`}}>
      <div className={styles.container}>
        <div className={styles.userBox}>
          <img src={user.profilePhoto} className={styles.profilePhoto} alt="" />
          <p className={styles.nameWelcome}>Hello {user.firstName}!</p>
        </div>
        <h1 className={styles.title}>Schedule Dashboard</h1>
        <p className={styles.subtitle}>Select an option below:</p>
        <div className={styles.buttonContainers}>
          <div className={styles.buttonContainer}>
            <button className={styles.fullButton} onClick={() => handleNavigate("/agendamento")}>
            Scheduling
            </button>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.fullButton} onClick={() => handleNavigate("/pontos-troca")}>
              Exchange points
            </button>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.fullButton} onClick={() => handleNavigate("/inscricao")}>
            Championship registration
           </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
