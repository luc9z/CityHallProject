// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABGaj5K982JRiK5xr88d024XzxAq9OJFY",
  authDomain: "cityhallproject-98bd9.firebaseapp.com",
  projectId: "cityhallproject-98bd9",
  storageBucket: "cityhallproject-98bd9.appspot.com",
  messagingSenderId: "178644410785",
  appId: "1:178644410785:web:ee026409b97cd1602cabe0",
  measurementId: "G-J4K8NFZHRW"
};

const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

export { db, auth, storage }