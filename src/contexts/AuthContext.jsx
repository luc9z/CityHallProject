import { createContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConnection";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useContext } from "react";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const storageUser = localStorage.getItem("cityhallproject-98bd9");

      if (storageUser) {
        const loggedUser = JSON.parse(storageUser);
        setUser(loggedUser);
      }
    }

    loadUser();
  }, []);

  const signIn = async (email, password) => {
    setLoadingAuth(true);

    try {
      const value = await signInWithEmailAndPassword(auth, email, password);
      let uid = value.user.uid;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let data = {
          uid: uid,
          firstName: docSnap.data().firstName,
          lastName: docSnap.data().lastName,
          email: value.user.email,
          profilePhoto: docSnap.data().profilePhoto,
          phoneNumber: docSnap.data().phoneNumber,
          birthDate: docSnap.data().birthDate,
          saldo: docSnap.data().saldo,
        };

        setUser(data);
        storageUser(data);
        setLoadingAuth(false);
        toast.success("Bem-vindo de volta!");
        navigate("/");
      } else {
        toast.error("Usuário não encontrado!");
        setLoadingAuth(false);
      }
    } catch (error) {
      console.error("Erro ao entrar:", error);
      toast.error("Campos incorretos");
      setLoadingAuth(false);
    }
  };

  const signUp = async (
    firstName,
    lastName,
    phoneNumber,
    profilePhoto,
    email,
    password
  ) => {
    setLoadingAuth(true);

    try {
      const value = await createUserWithEmailAndPassword(auth, email, password);
      let uid = value.user.uid;

      await setDoc(doc(db, "users", uid), {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        profilePhoto: profilePhoto,
        email: email,
        birthDate: "",
        saldo: 0,
      });

      let data = {
        uid: uid,
        firstName: firstName,
        lastName: lastName,
        email: value.user.email,
        profilePhoto: profilePhoto,
        phoneNumber: phoneNumber,
        birthDate: "",
        saldo: 0,
      };
      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success("Usuário registrado!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao se registrar:", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("Email já está em uso");
          break;
        case "auth/invalid-email":
          toast.error("Email inválido");
          break;
        case "auth/weak-password":
          toast.error("Senha fraca");
          break;
        default:
          toast.error("Erro ao registrar usuário");
          break;
      }
      setLoadingAuth(false);
    }
  };

  const storageUser = (data) => {
    localStorage.setItem("cityhallproject-98bd9", JSON.stringify(data));
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("cityhallproject-98bd9");
    setUser(null);
    toast.warn("Você não está mais autenticado!");
    navigate("/login"); // Redirecionar para o login ao sair
  };

  const updateBalance = async (newBalance) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        saldo: newBalance,
      });

      const updatedUser = { ...user, saldo: newBalance };
      setUser(updatedUser);
      storageUser(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user: user || {},
        signIn,
        logout,
        signUp,
        loadingAuth,
        storageUser,
        updateBalance,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
