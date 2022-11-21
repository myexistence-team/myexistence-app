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
  newCred: {
    displayName: string,
    email: string, 
    password: string, 
    role: "TEACHER" | "STUDENT",
    schoolId: string,
  }
): Promise<void> => {
  const usersRef = collection(firestore, 'users');
  const existingUserQuery = query(
    usersRef, 
    where('email', "==", newCred.email), 
    where('role', "==", newCred.role), 
    where('schoolId', "==", newCred.schoolId), 
  );
  const existingUsers = await getDocs(existingUserQuery);

  var newUser = { ...newCred };
  if (!existingUsers.empty) {
    newUser = { ...existingUsers.docs[0].data(), ...newUser };
    await deleteDoc(doc(firestore, 'users', existingUsers.docs[0].id));
  }

  const newAuth = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);

  const newUserPayload = {
    ...newUser,
    isVerified: newUser.isVerified || false,
    createdBy: newAuth.user.uid,
    updatedBy: newAuth.user.uid,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  await setDoc(doc(firestore, 'users', newAuth.user.uid), newUserPayload);

  return;
}

export const signUpFromGoogle = async (user: any, data: {
  schoolId: string,
  role: string
}): Promise<any> => {
  const usersRef = collection(firestore, 'users');
  const existingUserQuery = query(
    usersRef, 
    where('email', "==", user.email), 
    where('role', "in", ["TEACHER", "STUDENT"]), 
    where('schoolId', "==", data.schoolId), 
  );
  const existingUsers = await getDocs(existingUserQuery);

  var newUser = { ...data };
  if (!existingUsers.empty) {
    newUser = { ...existingUsers.docs[0].data() };
    await deleteDoc(doc(firestore, 'users', existingUsers.docs[0].id));
  }

  await setDoc(doc(firestore, 'users', user.uid), {
    ...newUser,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user?.photoURL,
    isVerified: newUser.isVerified || false,
    hasRegistered: true,
    createdBy: user.uid,
    updatedBy: user.uid,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const newProfileSnapshot = await getDoc(doc(firestore, 'users', user.uid));
  return newProfileSnapshot.data();
}