// src/contexts/AuthContext.js

import React, { useState, createContext, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConnection';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Certifique-se de que está importando useNavigate corretamente

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loadingAuth, setLoadingAuth] = useState(false);
  const navigate = useNavigate(); // Certifique-se de que useNavigate está sendo usado corretamente

  useEffect(() => {
    async function loadUser() {
      const storageUser = localStorage.getItem('cityhallproject-98bd9');
      if (storageUser) {
        setUser(JSON.parse(storageUser));
      }
    }

    loadUser();
  }, []);

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
  };

  const signUp = async (firstName, lastName, phoneNumber, profilePhoto, email, password) => {
    setLoadingAuth(true);
    try {
      const value = await createUserWithEmailAndPassword(auth, email, password);
      const uid = value.user.uid;

      await setDoc(doc(db, 'users', uid), {
        firstName,
        lastName,
        phoneNumber,
        profilePhoto,
        email,
        birthDate: '',
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
    <AuthContext.Provider value={{ signed: !!user, user, signIn, logout, signUp, loadingAuth, storageUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
