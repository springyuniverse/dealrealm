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
import { createTeam, getUserTeams } from "@/lib/services/teams";
import { Team } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  currentTeamId: string | null;
  teams: Team[];
  switchTeam: (teamId: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, teamName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  useEffect(() => {
    // Prefetch scenarios page
    router.prefetch('/scenarios');
    router.prefetch('/login');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userTeams = await getUserTeams(user.uid);
        setTeams(userTeams);
        setCurrentTeamId(userTeams[0]?.id || null);
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

  const signUp = async (email: string, password: string, name: string, teamName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create team first
    const team = await createTeam(teamName, user.uid);

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      name,
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
      // For Google sign-in, we'll need to prompt for team name after successful auth
      // This could be done through a modal or redirect to a setup page
      // For now, we'll create a default team name based on the user's name
      const teamName = `${user.displayName}'s Team`;
      const team = await createTeam(teamName, user.uid);

      // Create new user document
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
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


  const switchTeam = (teamId: string) => {
    setCurrentTeamId(teamId);
  };

  
  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, currentTeamId,teams,switchTeam, signIn, signUp, signInWithGoogle, logout }}
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
