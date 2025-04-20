"use client";

import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("[Firebase] Initializing with config:", {
  apiKey: firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("[Firebase] Persistence set to LOCAL"))
    .catch((error) => console.error("[Firebase] Persistence error:", error));
}

export { auth };