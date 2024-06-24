import { createContext, useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConnection";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useContext } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const navigate = useNavigate(); // Certifique-se de que useNavigate está sendo usado corretamente

  useEffect(() => {
    async function loadUser() {
      const storageUser = localStorage.getItem('cityhallproject-98bd9');
      if (storageUser) {
        const loggedUser = JSON.parse(storageUser);
        setUser(loggedUser);
      }
    }

    loadUser();
  }, [navigate]);

  const signIn = async (email, password) => {
    setLoadingAuth(true);
    try {
      const value = await signInWithEmailAndPassword(auth, email, password);
      const uid = value.user.uid;
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

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
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error("User not found!");
        setLoadingAuth(false);
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Incorrect fields");
      setLoadingAuth(false);
    }
  };

  const signUp = async (firstName, lastName, phoneNumber, profilePhoto, email, password) => {
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
        saldo: 0
      });

      let data = {
        uid: uid,
        firstName: firstName,
        lastName: lastName,
        email: value.user.email,
        profilePhoto: profilePhoto,
        phoneNumber: phoneNumber,
        birthDate: "",
        saldo: 0
      };
      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success("User registered!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("Email already in use");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email");
          break;
        case "auth/weak-password":
          toast.error("Weak password");
          break;
        default:
          toast.error("Error registering user");
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
    localStorage.removeItem('cityhallproject-98bd9');
    setUser(null);
    toast.warn("You are no longer authenticated!");
  };

  const updateBalance = async (newBalance) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        saldo: newBalance
      });
  
      const updatedUser = { ...user, saldo: newBalance };
      setUser(updatedUser);
      storageUser(updatedUser);
    } catch (error) {
      console.error("Error updating balance:", error);    }
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user: user || {}, // Adicionei essa linha para garantir que user não seja indefinido
        signIn,
        logout,
        signUp,
        loadingAuth,
        updateBalance,
        storageUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acessar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};
}