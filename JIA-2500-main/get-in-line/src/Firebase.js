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
  getDoc,
  doc,
  setDoc,
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

  const profile = await getDoc(doc(db, "users", uid));
  if (!profile.exists()) return null;

  return {
    id: profile.id,
    ...profile.data(),
  };
};

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, googleProvider);
  const user = res.user;
  const existingProfile = await getUserProfile(user.uid);

  if (!existingProfile) {
    await setDoc(doc(db, "users", user.uid), {
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

  await setDoc(doc(db, "users", user.uid), {
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
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout
};
