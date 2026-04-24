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

  // Mobile Redirect Watcher: Forces the page forward if we get stuck
  useEffect(() => {
    const checkSession = setInterval(() => {
      if (user && !loading) {
        const path = window.location.pathname;
        if (path === "/login" || path === "/register") {
          const isAdmin = SUPER_ADMIN_EMAILS.includes(user.email || "");
          const defaultPath = isAdmin ? "/dashboard/customers" : "/dashboard";
          const redirectPath = localStorage.getItem("gh_redirect_after_login") || defaultPath;
          console.log("Stuck session detected, forcing redirect to:", redirectPath);
          window.location.href = redirectPath;
        }
      }
    }, 1500); // Check even faster
    return () => clearInterval(checkSession);
  }, [user, loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // 1. INITIALIZE FROM CACHE (to prevent flashing)
        const cachedRole = localStorage.getItem(`gh_role_${user.uid}`) as any;
        const cachedPlan = localStorage.getItem(`gh_plan_${user.uid}`) as any;
        const cachedStatus = localStorage.getItem(`gh_status_${user.uid}`) as any;

        const isAdmin = SUPER_ADMIN_EMAILS.includes(user.email || "");
        setRole(cachedRole || (isAdmin ? "admin" : "owner"));
        setPlan(cachedPlan || (isAdmin ? "enterprise" : "starter"));
        setPaymentStatus(cachedStatus || (isAdmin ? "verified" : "unpaid"));
        
        setLoading(false);

        // 2. Handle post-login redirect
        const path = window.location.pathname;
        if (path === "/login" || path === "/register") {
          const defaultPath = isAdmin ? "/dashboard/customers" : "/dashboard";
          const redirectPath = localStorage.getItem("gh_redirect_after_login") || defaultPath;
          localStorage.removeItem("gh_redirect_after_login");
          localStorage.removeItem("gh_pending_plan");
          window.location.href = redirectPath;
        }

        // 3. Background Sync (Silent update + Cache update)
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role as any);
            setPlan(data.plan || "starter");
            setPaymentStatus(data.paymentStatus || "unpaid");
            setProofUrl(data.proofUrl || null);

            // Update cache
            localStorage.setItem(`gh_role_${user.uid}`, data.role);
            localStorage.setItem(`gh_plan_${user.uid}`, data.plan || "starter");
            localStorage.setItem(`gh_status_${user.uid}`, data.paymentStatus || "unpaid");
          }
        } catch (err) {
          console.warn("Background sync failed:", err);
        }
      } else {
        setUser(null);
        setRole(null);
        setPlan(null);
        setPaymentStatus(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (requestedPlan?: string) => {
    setLoading(true);
    
    // Store intentions before trying login
    if (requestedPlan) {
      localStorage.setItem("gh_pending_plan", requestedPlan);
      localStorage.setItem("gh_redirect_after_login", `/checkout?plan=${requestedPlan}`);
    }

    try {
      // Try Popup first (Safari/iOS works better with popups triggered by clicks)
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const pendingPlan = localStorage.getItem("gh_pending_plan") || undefined;
        localStorage.removeItem("gh_pending_plan");
        await setupUserDoc(result.user, pendingPlan, setRole, setPlan, setPaymentStatus, setProofUrl);
        
        const redirectPath = localStorage.getItem("gh_redirect_after_login") || "/dashboard";
        localStorage.removeItem("gh_redirect_after_login");
        window.location.href = redirectPath;
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      
      // If popup is blocked, use redirect as last resort
      if (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request") {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          alert("Login failed. Please disable popup blockers or try another browser.");
        }
      } else {
        alert(`Login failed: ${error.code}. Please check your internet.`);
      }
    } finally {
      setLoading(false);
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
