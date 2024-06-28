import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./style.module.scss"; // Importa os estilos CSS Modules

const Admin = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [saldo, setSaldo] = useState(0);
  const [newSaldo, setNewSaldo] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingSaldo, setUpdatingSaldo] = useState(false);

  useEffect(() => {
    async function loadSaldo() {
      console.log("Carregando saldo do usuário...");
      try {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            console.log("Saldo do usuário encontrado:", docSnap.data().saldo);
            setSaldo(docSnap.data().saldo);
          } else {
            console.log("Usuário não encontrado");
            toast.error("Usuário não encontrado");
            navigate("/login");
          }
        } else {
          console.log("Nenhum usuário encontrado no contexto");
        }
      } catch (error) {
        console.error("Erro ao obter saldo:", error);
        toast.error("Erro ao obter saldo");
      }
    }

    loadSaldo();
  }, [user, navigate]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoadingUsers(true);
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList.filter((user) => user.id)); // Filtra para remover usuários sem id válido
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao buscar usuários");
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, []);

  const handleAddSaldo = async () => {
    if (!selectedUserId || selectedUserId === "-") {
      toast.error(
        "Por favor, selecione um usuário válido para adicionar saldo."
      );
      return;
    }

    if (isNaN(parseFloat(newSaldo)) || newSaldo <= 0) {
      toast.error("Por favor, insira um valor válido para adicionar saldo.");
      return;
    }

    try {
      setUpdatingSaldo(true);

      const userRef = doc(db, "users", selectedUserId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        toast.error("Usuário selecionado não encontrado.");
        return;
      }

      const updatedSaldo = userDoc.data().saldo + parseFloat(newSaldo);
      await updateDoc(userRef, { saldo: updatedSaldo });
      toast.success("Saldo atualizado com sucesso");

      // Atualiza o saldo localmente no contexto do usuário
      const updatedUser = { ...user, saldo: updatedSaldo };
      setUser(updatedUser);

      setNewSaldo(0);
      setSaldo(updatedSaldo);
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error);
      toast.error("Erro ao atualizar saldo");
    } finally {
      setUpdatingSaldo(false);
    }
  };

  if (!user) {
    return <div className={styles.loadingMessage}>Carregando...</div>;
  }

  return (
    <div className={styles.adminContainer}>
      <h2>Painel de Administração</h2>
      <p className={styles.welcomeMessage}>
        Bem-vindo, {user.firstName}!{" "}
        <p className={styles.saldoLabel}>Saldo Atual: {saldo}</p>
      </p>
      <div className={styles.saldoInfo}>
        <label className={styles.saldoLabel}>Adicionar Saldo Pila Azul:</label>
        <input
          type="number"
          value={newSaldo}
          onChange={(e) => setNewSaldo(e.target.value)}
          className={styles.saldoInput}
        />
      </div>
      <div className={styles.selectContainer}>
        <label className={styles.selectLabel}>Selecionar Usuário:</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className={styles.userSelect}
        >
          <option value="">Selecionar usuário...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {`${user.firstName || ""} ${user.lastName || ""}`} (
              {user.email || ""})
            </option>
          ))}
        </select>
      </div>
      <div className={styles.buttonContainer}>
        <button
          onClick={handleAddSaldo}
          disabled={updatingSaldo}
          className={styles.button}
        >
          {updatingSaldo ? "Atualizando Saldo..." : "Adicionar Saldo"}
        </button>
        <button
          onClick={logout}
          className={`${styles.button} ${styles.logoutButton}`}
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default Admin;
