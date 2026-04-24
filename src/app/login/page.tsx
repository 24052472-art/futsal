"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Globe, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,212,255,0.15) 0%, transparent 70%)" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 28 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "contain" }} />
            <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 900, fontSize: 26, color: "white", letterSpacing: "-0.5px" }}>GH<span style={{ color: "#00ff88" }}>os</span></span>
          </Link>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-1px", marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Sign in to your arena dashboard</p>
        </div>

        <div className="glass" style={{ borderRadius: 28, padding: "clamp(24px, 5vw, 48px) clamp(20px, 4vw, 40px)", border: "1px solid var(--border)", boxShadow: "0 20px 50px -12px rgba(0,0,0,0.5)" }}>
          
          <button type="button" onClick={handleGoogleLogin} className="btn-primary" style={{ 
            width: "100%", padding: "16px", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617", border: "none",
            boxShadow: "0 10px 30px -10px rgba(0,255,136,0.5)"
          }} disabled={loading}>
            {loading ? (
              <span style={{ opacity: 0.8 }}>Signing in...</span>
            ) : (
              <>
                <Globe size={20} /> Continue with Google
              </>
            )}
          </button>

          <div style={{ textAlign: "center", marginTop: 32, color: "var(--text-muted)", fontSize: 14 }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>Create one free</Link>
          </div>

          <div style={{ textAlign: "center", marginTop: 40, color: "var(--text-muted)", fontSize: 11, opacity: 0.7 }}>
            🔒 Secured with 256-bit SSL encryption
          </div>
        </div>
      </div>
    </div>
  );
}
