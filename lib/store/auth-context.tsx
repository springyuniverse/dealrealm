"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/init";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, company: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Prefetch scenarios page
    router.prefetch('/scenarios');
    router.prefetch('/login');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Check user role in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data()?.role === "admin");
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    if (userDoc.exists()) {
      setIsAdmin(userDoc.data()?.role === "admin");
      // Update last active
      await setDoc(doc(db, "users", userCredential.user.uid), {
        lastActive: Timestamp.now(),
      }, { merge: true });
      
      // Set session and redirect
      const token = await userCredential.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      router.push('/scenarios');
    }
  };

  const signUp = async (email: string, password: string, name: string, company: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      name,
      company,
      role: "user", // Default role
      createdAt: Timestamp.now(),
      lastActive: Timestamp.now(),
    });
    setIsAdmin(false);

    // Set session and redirect
    const token = await user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    router.push('/scenarios');
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user exists
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      setIsAdmin(userDoc.data()?.role === "admin");
      // Update last active
      await setDoc(doc(db, "users", user.uid), {
        lastActive: Timestamp.now(),
      }, { merge: true });
    } else {
      // Create new user document
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
        company: "",
        role: "user", // Default role
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now(),
      });
      setIsAdmin(false);
    }

    // Set session and redirect
    const token = await user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    router.push('/scenarios');
  };

  const logout = async () => {
    if (user) {
      // Update last active before logout
      await setDoc(doc(db, "users", user.uid), {
        lastActive: Timestamp.now(),
      }, { merge: true });
      
      // Clear session and sign out
      await Promise.all([
        fetch('/api/auth/session', { method: 'DELETE' }),
        signOut(auth)
      ]);
      
      // Update state after everything is cleared
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, signIn, signUp, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
