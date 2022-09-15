import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from "firebase/storage";
import { firestore } from "../firebase";
import { getBlob } from "../utils/utilFunctions";

export async function updateProfile(
  uid: string,
  profile: any, 
  photoUri: string
) {
  const storage = getStorage();
  const storageRef = ref(storage, `profilePhotos/${profile.role}-${uid}`); 

  var photoUrl = profile.photoUrl;
  if (photoUri) {
    const blob: any = await getBlob(photoUri)
    const uploadSnap = await uploadBytes(storageRef, blob);
    photoUrl = await getDownloadURL(uploadSnap.ref);
  }

  await updateDoc(doc(
    firestore,
    'users',
    uid
  ), { ...profile, photoUrl })
}