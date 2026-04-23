"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

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

const SUPER_ADMIN_EMAILS = ["abhi.kush047@gmail.com"];

const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent) || window.innerWidth < 800;
};

const setupUserDoc = async (
  user: User, 
  requestedPlan: string | undefined,
  setRole: (r: any) => void,
  setPlan: (p: any) => void,
  setPaymentStatus: (s: any) => void,
  setProofUrl: (u: string | null) => void
) => {
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
      setPlan(newPlan);
      setPaymentStatus("unpaid");
    } else {
      const existingData = userDoc.data();
      if (requestedPlan && existingData.plan !== requestedPlan) {
        await updateDoc(userDocRef, {
          plan: requestedPlan,
          updatedAt: serverTimestamp()
        });
        setPlan(requestedPlan);
      } else {
        setRole(existingData.role);
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
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "owner" | "customer" | null>(null);
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise" | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"verified" | "pending_approval" | "unpaid" | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const pendingPlan = sessionStorage.getItem("gh_pending_plan") || undefined;
        sessionStorage.removeItem("gh_pending_plan");
        
        await setupUserDoc(result.user, pendingPlan, setRole, setPlan, setPaymentStatus, setProofUrl);
        
        // Priority 1: Check if there's a specific redirect (like /checkout)
        const redirectPath = sessionStorage.getItem("gh_redirect_after_login");
        if (redirectPath) {
          sessionStorage.removeItem("gh_redirect_after_login");
          window.location.href = redirectPath;
          return;
        }

        // Priority 2: If we're on login/register pages, go to dashboard
        const path = window.location.pathname;
        if (path === "/login" || path === "/register") {
          window.location.href = "/dashboard";
        }
      }
    }).catch((err) => {
      console.error("Redirect login error:", err);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fallback for mobile: If getRedirectResult failed but user is logged in
        // and we are stuck on a login/register page, move forward.
        const path = window.location.pathname;
        if (path === "/login" || path === "/register") {
          const redirectPath = sessionStorage.getItem("gh_redirect_after_login") || "/dashboard";
          window.location.href = redirectPath;
        }

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
    const triggerRedirect = async () => {
      if (requestedPlan) {
        sessionStorage.setItem("gh_pending_plan", requestedPlan);
        sessionStorage.setItem("gh_redirect_after_login", `/checkout?plan=${requestedPlan}`);
      }
      await signInWithRedirect(auth, googleProvider);
    };

    try {
      if (isMobileDevice()) {
        return await triggerRedirect();
      }

      try {
        const result = await signInWithPopup(auth, googleProvider);
        await setupUserDoc(result.user, requestedPlan, setRole, setPlan, setPaymentStatus, setProofUrl);
      } catch (popupError: any) {
        if (
          popupError.code === "auth/popup-blocked" || 
          popupError.code === "auth/cancelled-popup-request" ||
          popupError.code === "auth/internal-error" ||
          popupError.code === "auth/network-request-failed"
        ) {
          console.warn("Popup blocked or failed, using redirect...");
          return await triggerRedirect();
        }
        throw popupError;
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") return;
      console.error("Google Login Error:", error);
      alert("Login attempt failed. Please try again or check your internet connection.");
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
