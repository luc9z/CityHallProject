import { useState, createContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConnection";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

export const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Inicie com true para evitar flashes de conteúdo não autenticado
  const navigate = useNavigate(); // Certifique-se de que useNavigate está sendo usado corretamente

  useEffect(() => {
    const loadUser = async () => {
      const storageUser = localStorage.getItem("cityhallproject-98bd9");
      if (storageUser) {
        setUser(JSON.parse(storageUser));
        setLoadingAuth(false);
      } else {
        // Se não houver usuário armazenado, redirecionar para /login
        navigate("/login");
        setLoadingAuth(false);
      }
    };

    loadUser();
  }, [navigate]);

  const signIn = async (email, password) => {
    setLoadingAuth(true);
    try {
      const { user: authUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = authUser.uid;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      const data = {
        uid,
        firstName: docSnap.data().firstName,
        lastName: docSnap.data().lastName,
        email: authUser.email,
        profilePhoto: docSnap.data().profilePhoto,
        phone: docSnap.data().phoneNumber,
        birthDate: docSnap.data().birthDate,
      };

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success("Bem-vindo de volta!");
      navigate("/");
    } catch (error) {
      console.error(error);
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
      const { user: authUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = authUser.uid;
      await setDoc(doc(db, "users", uid), {
        firstName,
        lastName,
        phoneNumber,
        profilePhoto,
        email: authUser.email,
        birthDate: "",
      });

      const data = {
        uid,
        firstName,
        lastName,
        email: authUser.email,
        profilePhoto,
        phoneNumber,
        birthDate: "",
      };

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success("Usuário registrado!");
      navigate("/");
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("E-mail já em uso");
          break;
        case "auth/invalid-email":
          toast.error("E-mail inválido");
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
    navigate("/login"); // Redireciona para o login ao fazer logout
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        signIn,
        logout,
        signUp,
        loadingAuth,
        storageUser,
        setUser,
      }}
    >
      {!loadingAuth && children}{" "}
      {/* Renderiza children somente quando a autenticação não estiver carregando */}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
