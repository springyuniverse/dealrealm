import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { firebaseConfig } from "./config";

console.log("Initializing Firebase...");

let app;
try {
  if (!getApps().length) {
    console.log("No Firebase app found, initializing...");
    app = initializeApp(firebaseConfig);
  } else {
    console.log("Firebase app already exists");
    app = getApp();
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

const auth = getAuth(app);
const db = getFirestore(app);


console.log("Firebase initialization complete");
console.log("Auth initialized:", !!auth);
console.log("Firestore initialized:", !!db);

export { auth, db };
