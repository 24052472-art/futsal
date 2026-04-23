"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: "admin" | "owner" | "customer" | null;
  plan: "starter" | "pro" | "enterprise" | null;
  paymentStatus: "verified" | "pending_approval" | "unpaid" | null;
  proofUrl: string | null;
  loginWithGoogle: (plan?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Super Admin Emails - Hardcoded for MVP, can be moved to env or DB later
const SUPER_ADMIN_EMAILS = ["abhi.kush047@gmail.com"];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "owner" | "customer" | null>(null);
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise" | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"verified" | "pending_approval" | "unpaid" | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        if (SUPER_ADMIN_EMAILS.includes(user.email || "")) {
          setRole("admin");
          setPlan("enterprise"); 
          setPaymentStatus("verified");
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setRole(data.role as any);
              setPlan(data.plan || "starter");
              setPaymentStatus(data.paymentStatus || "unpaid");
              setProofUrl(data.proofUrl || null);
            } else {
              setRole("owner");
              setPlan("starter");
              setPaymentStatus("unpaid");
            }
          } catch (err) {
            console.error("Firestore Error:", err);
            setRole("owner");
            setPlan("starter");
            setPaymentStatus("unpaid");
          }
        }
      } else {
        setRole(null);
        setPlan(null);
        setPaymentStatus(null);
        setProofUrl(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (requestedPlan?: string) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email || "");
          const newRole = isSuperAdmin ? "admin" : "owner";
          const newPlan = isSuperAdmin ? "enterprise" : (requestedPlan || "starter");
          
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: newRole,
            plan: newPlan,
            paymentStatus: "unpaid",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          setRole(newRole);
          setPlan(newPlan as any);
          setPaymentStatus("unpaid");
        } else {
          const existingData = userDoc.data();
          if (requestedPlan && existingData.plan !== requestedPlan) {
            await updateDoc(userDocRef, { 
              plan: requestedPlan,
              updatedAt: serverTimestamp()
            });
            setPlan(requestedPlan as any);
          } else {
            setRole(existingData.role as any);
            setPlan(existingData.plan || "starter");
            setPaymentStatus(existingData.paymentStatus || "unpaid");
            setProofUrl(existingData.proofUrl || null);
          }
        }
      } catch (err) {
        console.error("Firestore Setup Error:", err);
        setRole("owner");
        setPlan("starter");
        setPaymentStatus("unpaid");
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
        console.warn("User closed or cancelled the login popup.");
        return; 
      }
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, plan, paymentStatus, proofUrl, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
