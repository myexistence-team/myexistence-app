// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getReactNativePersistence, initializeAuth} from 'firebase/auth/react-native';
import { Firestore, getFirestore, initializeFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCvh8vdcmswRQEDSWTdPWwhx_AexJfMDsg",
  authDomain: "myexistance-c4881.firebaseapp.com",
  projectId: "myexistance-c4881",
  storageBucket: "myexistance-c4881.appspot.com",
  messagingSenderId: "279276711391",
  appId: "1:279276711391:web:bae479b5385af0538f686a",
  measurementId: "G-1VNQ8RGEJZ"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const firestore: Firestore = getFirestore(app);
// if (getApps().length === 0) {
// } else {
//   app = getApp();
// }

export { app, auth, firestore };