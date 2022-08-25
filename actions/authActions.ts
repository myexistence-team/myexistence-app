import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, UserCredential } from "firebase/auth"
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore"
import { auth, firestore } from "../utils/firebaseGetters"

export const signIn = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
}

export const signOut = async (): Promise<void> => {
  return fbSignOut(auth);
}

export const signUp = async (
  newUser: {
    email: string, 
    password: string, 
    role: "TEACHER" | "STUDENT",
    schoolId: string,
  }
): Promise<void> => {
  const usersRef = collection(firestore, 'users');
  const existingUserQuery = query(
    usersRef, 
    where('email', "==", newUser.email), 
    where('role', "==", newUser.role), 
    where('schoolId', "==", newUser.schoolId), 
  );
  const existingUsers = await getDocs(existingUserQuery);

  if (existingUsers.empty) {
    throw new FirebaseError('not-exists', 'Anda belum terdaftar di sekolah yang anda pilih');
  }

  await deleteDoc(doc(firestore, 'users', existingUsers.docs[0].id));

  const newAuth = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);

  await setDoc(doc(firestore, 'users', newAuth.user.uid), {
    ...existingUsers.docs[0].data(),
    hasRegistered: true
  });

  return;
}