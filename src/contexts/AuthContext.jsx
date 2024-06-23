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
  const [loadingAuth, setLoadingAuth] = useState(false);
  const navigate = useNavigate(); // Certifique-se de que useNavigate está sendo usado corretamente

  useEffect(() => {
    async function loadUser() {
      const storageUser = localStorage.getItem('cityhallproject-98bd9');
      if (storageUser) {
        setUser(JSON.parse(storageUser));
      } else {
        // Se não houver usuário armazenado, redirecionar para /login
        navigate("/login");
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

      const data = {
        uid,
        firstName: docSnap.data().firstName,
        lastName: docSnap.data().lastName,
        email: value.user.email,
        profilePhoto: docSnap.data().profilePhoto,
        phone: docSnap.data().phoneNumber,
        birthDate: docSnap.data().birthDate,
      };

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Incorrect fields');
      setLoadingAuth(false);
    }
    await signInWithEmailAndPassword(auth, email, password)
      .then(async (value) => {
        let uid = value.user.uid;

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        let data = {
          uid: uid,
          firstName: docSnap.data().firstName,
          lastName: docSnap.data().lastName,
          email: value.user.email,
          profilePhoto: docSnap.data().profilePhoto,
          phone: docSnap.data().phoneNumber,
          birthDate: docSnap.data().birthDate,
        };

        setUser(data);
        storageUser(data);
        setLoadingAuth(false);
        toast.success("Welcome back!");
        navigate("/dashboard");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Incorrect fields");
        setLoadingAuth(false);
      });
  }

  async function signUp(
    firstName,
    lastName,
    phoneNumber,
    profilePhoto,
    email,
    password
  ) {
    setLoadingAuth(true);
    await createUserWithEmailAndPassword(auth, email, password)
      .then(async (value) => {
        let uid = value.user.uid;
        await setDoc(doc(db, "users", uid), {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          profilePhoto: profilePhoto,
          email: email,
          birthDate: "",
        }).then(() => {
          let data = {
            uid: uid,
            firstName: firstName,
            lastName: lastName,
            email: value.user.email,
            profilePhoto: profilePhoto,
            phoneNumber: phoneNumber,
            birthDate: "",
          };
          setUser(data);
          storageUser(data);
          setLoadingAuth(false);
          toast.success("User registrated!");
          navigate("/dashboard");
        });
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/email-already-in-use":
            toast.error("Email already in use");
            break;
          case "auth/invalid-email":
            toast.error("Invalid e-mail");
            break;
          default:
            toast.error("Erro ao registrar usuário");
            break;
        }
        setLoadingAuth(false);
      });

      const data = {
        uid,
        firstName,
        lastName,
        email: value.user.email,
        profilePhoto,
        phoneNumber,
        birthDate: '',
      };

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success('User registered!');
      navigate('/dashboard');
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('Email already in use');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid e-mail');
          break;
        default:
          toast.error('Erro ao registrar usuário');
          break;
      }
      setLoadingAuth(false);
    }
  };

  const storageUser = (data) => {
    localStorage.setItem('cityhallproject-98bd9', JSON.stringify(data));
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('cityhallproject-98bd9');
    setUser(null);
    toast.warn('You are no longer authenticated!');
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
      {children}
    </AuthContext.Provider>
  );
};
