import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import styles from "./style.module.scss";
import { AuthContext } from "../../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [salary, setSalary] = useState("");
  const [expenses, setExpenses] = useState("");
  const [income, setIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const data = [
    { name: "Income", value: income },
    { name: "Expenses", value: totalExpenses }
  ];

  const handleApplySalary = () => {
    const newIncome = parseFloat(salary) + income;
    setIncome(newIncome);
    setSalary("");
  };

  const handleAddExpense = () => {
    const newTotalExpenses = parseFloat(expenses) + totalExpenses;
    setTotalExpenses(newTotalExpenses);
    setExpenses("");
  };

  const handleResetSalary = () => {
    setSalary("");
    setIncome(0);
  };

  const handleResetExpenses = () => {
    setExpenses("");
    setTotalExpenses(0);
  };

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
      <div className={styles.userBox}>
          <div className={styles.userBox}>
            <img src={user.profilePhoto} className={styles.profilePhoto} style={{width:"150px"}} alt="#"></img> <p className={styles.nameWelcome}>Olá {user.firstName}!</p>
          </div>
          </div>
        <h1 className={styles.title}>Financial Dashboard</h1>
        <p className={styles.subtitle}>Manage your finances easily.</p>
        <div className={styles.inputBox}>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Enter your salary"
          />
          <button onClick={handleResetSalary}>Reset</button>
          <button onClick={handleApplySalary}>Apply Salary</button>
        </div>
        <div className={styles.inputBox}>
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            placeholder="Enter expense amount"
          />
          <button onClick={handleResetExpenses}>Reset</button>
          <button onClick={handleAddExpense}>Add Expense</button>
        </div>
        </div>
    </div>
  );
};

export default Dashboard;
