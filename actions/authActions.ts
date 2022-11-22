import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, UserCredential } from "firebase/auth"
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore"
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
    password?: string, 
    repassword?: string,
    role: "TEACHER" | "STUDENT",
    schoolId: string,
  }
): Promise<void> => {
  const batch = writeBatch(firestore);
  const usersRef = collection(firestore, 'users');
  const existingUserQuery = query(
    usersRef, 
    where('email', "==", newCred.email), 
    where('role', "==", newCred.role), 
    where('schoolId', "==", newCred.schoolId), 
  );
  const existingUsers = await getDocs(existingUserQuery);

  var newUser = { ...newCred };
  const idsField = newCred.role === "STUDENT" ? 'studentIds' : 'teacherIds';
  if (!existingUsers.empty) {
    newUser = { ...existingUsers.docs[0].data(), ...newUser };
    await deleteDoc(doc(firestore, 'users', existingUsers.docs[0].id));
  }
  
  const newAuth = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
  
  if (!existingUsers.empty) {
    const classesRef = collection(firestore, "schools", newCred.schoolId, "classes");
    const classesSnaps = (await getDocs(query(classesRef, where(
      idsField, 
      "array-contains", 
      existingUsers.docs[0].id
    )))).docs;
    if (classesSnaps.length) {
      for (const classSnap of classesSnaps) {
        const classData = classSnap.data();
        const newClassData = {
          ...classData,
          [idsField]: classData[idsField].filter((id: string) => id !== existingUsers.docs[0].id).concat(newAuth.user.uid)
        }
        batch.set(classSnap.ref, newClassData)
      }
    }
  }

  delete newUser.password;
  delete newUser.repassword;

  const newUserPayload = {
    ...newUser,
    isVerified: newUser.isVerified || false,
    createdBy: newAuth.user.uid,
    updatedBy: newAuth.user.uid,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  await batch.commit();
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
  const batch = writeBatch(firestore);

  var newUser = { ...data };
  const idsField = data.role === "STUDENT" ? 'studentIds' : 'teacherIds';
  if (!existingUsers.empty) {
    newUser = { ...existingUsers.docs[0].data() };
    const classesRef = collection(firestore, "schools", data.schoolId, "classes");
    const classesSnaps = (await getDocs(query(classesRef, where(
      idsField, 
      "array-contains", 
      existingUsers.docs[0].id
    )))).docs;
    if (classesSnaps.length) {
      for (const classSnap of classesSnaps) {
        const classData = classSnap.data();
        const newClassData = {
          ...classData,
          [idsField]: classData[idsField].filter((id: string) => id !== existingUsers.docs[0].id).concat(user.uid)
        }
        batch.set(classSnap.ref, newClassData)
      }
    }
    await deleteDoc(doc(firestore, 'users', existingUsers.docs[0].id));
  }

  await batch.commit();
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