import { initializeApp } from 'firebase/app';

import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA5hWcoSC3x8g5UqTp3xim_Mwjt9frXmt0",
    authDomain: "get-in-line-1cf94.firebaseapp.com",
    projectId: "get-in-line-1cf94",
    storageBucket: "get-in-line-1cf94.appspot.com",
    messagingSenderId: "1066319320699",
    appId: "1:1066319320699:web:38f3e2fd4ca83e944874de",
    measurementId: "G-EF4ZXWEFHH"
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const getUserProfile = async (uid) => {
  if (!uid) return null;

  const q = query(collection(db, "users"), where("uid", "==", uid));
  const docs = await getDocs(q);

  if (docs.docs.length === 0) return null;

  return {
    id: docs.docs[0].id,
    ...docs.docs[0].data(),
  };
};

const isCurrentUserAdmin = async () => {
  const profile = await getUserProfile(auth.currentUser?.uid);
  return Boolean(profile?.admin);
};

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, googleProvider);
  const user = res.user;
  const existingProfile = await getUserProfile(user.uid);

  if (!existingProfile) {
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name: user.displayName,
      authProvider: "google",
      email: user.email,
      admin: false,
    });
  }

  return user;
};

const logInWithEmailAndPassword = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};

const registerWithEmailAndPassword = async (name, email, password, adminStatus = false) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;

  await addDoc(collection(db, "users"), {
    uid: user.uid,
    name,
    authProvider: "local",
    email,
    admin: Boolean(adminStatus),
  });

  return user;
};

const sendPasswordReset = async (email) => {
  await sendPasswordResetEmail(auth, email);
  alert("Password reset link sent!");
};

const logout = () => {
  return signOut(auth);
};

export {
  auth,
  db,
  getUserProfile,
  isCurrentUserAdmin,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout
};
