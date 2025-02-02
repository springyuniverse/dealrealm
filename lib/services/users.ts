import { db } from "@/lib/firebase/init";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc,
  query,
  where,
  Timestamp 
} from "firebase/firestore";

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: "admin" | "user";
  createdAt: Date;
  lastActive: Date;
}

export async function getUsers() {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    lastActive: doc.data().lastActive?.toDate(),
  })) as User[];
}

export async function getUserById(id: string) {
  const userRef = doc(db, "users", id);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error("User not found");
  }
  
  const data = userSnap.data();
  return {
    id: userSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    lastActive: data.lastActive?.toDate(),
  } as User;
}

export async function updateUserRole(id: string, role: "admin" | "user") {
  const userRef = doc(db, "users", id);
  
  await updateDoc(userRef, {
    role,
    updatedAt: Timestamp.now(),
  });
}

export async function getAdmins() {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "admin"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    lastActive: doc.data().lastActive?.toDate(),
  })) as User[];
}
