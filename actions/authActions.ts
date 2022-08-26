import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, UserCredential } from "firebase/auth"
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore"
import { Profile } from "../types"
import { auth, firestore } from "../firebase"

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
    hasRegistered: true,
    createdBy: newAuth.user.uid,
    updatedBy: newAuth.user.uid,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return;
}

export const signUpFromGoogle = async (user: any, schoolId: string): Promise<any> => {
  const usersRef = collection(firestore, 'users');
  const existingUserQuery = query(
    usersRef, 
    where('email', "==", user.email), 
    where('role', "in", ["TEACHER", "STUDENT"]), 
    where('schoolId', "==", schoolId), 
  );
  const existingUsers = await getDocs(existingUserQuery);

  if (existingUsers.empty) {
    throw new FirebaseError('not-exists', 'Anda belum terdaftar di sekolah yang anda pilih');
  }

  await deleteDoc(doc(firestore, 'users', existingUsers.docs[0].id));
  await setDoc(doc(firestore, 'users', user.uid), {
    ...existingUsers.docs[0].data(),
    displayName: user.displayName,
    photoUrl: user?.photoURL,
    hasRegistered: true,
    createdBy: user.uid,
    updatedBy: user.uid,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const newProfileSnapshot = await getDoc(doc(firestore, 'users', user.uid));
  return newProfileSnapshot.data();
}