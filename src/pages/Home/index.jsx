import React, { useContext } from "react";
import { Link } from "react-router-dom";
import styles from "./style.module.scss";
import { AuthContext } from "../../contexts/AuthContext";
import backgroundImage from "../../assets/pics/6202241.jpg";
export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className={styles.home} style={{backgroundImage: `url(${backgroundImage})`}}>
      <div className={styles.container}>
        {user ? (
          <>    
            <h1 className={styles.title}>Welcome {user.firstName}!</h1>
            <p className={styles.subtitle}>Go to the dashboard.</p>
            <Link to="/dashboard" className={styles.loginBtn}>Dashboard</Link>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Welcome to Our Sports Court Schedules.</h1>
            <p className={styles.subtitle}>Get started today.</p>
            <Link to="/login" className={styles.loginBtn}>Login</Link>
            <Link to="/login" className={styles.registerBtn}>Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
