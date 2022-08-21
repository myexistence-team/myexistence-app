import { FirebaseError } from "firebase/app"
import { Auth, getAuth, signInWithEmailAndPassword, signOut as fbSignOut, User, UserCredential } from "firebase/auth"
import { app } from "../firebase"

const auth: Auth = getAuth(app)

export const signIn = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
}

export const signOut = async (): Promise<void> => {
  return fbSignOut(auth);
}