import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { app } from "../firebase";

export const auth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);