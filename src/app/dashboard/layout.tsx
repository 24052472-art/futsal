"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardTopbar from "@/components/dashboard/Topbar";
import { ShieldAlert, Zap, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role, paymentStatus, plan, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && user && role === "customer") {
      router.push("/");
    }
  }, [user, loading, role, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface)", gap: 20 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#00d4ff", animation: `bounce 0.8s ${i * 0.15}s ease-in-out infinite` }} />
          ))}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Initializing GameHaru...</p>
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
      </div>
    );
  }

  // Let users in if they are authenticated, regardless of role loading status
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface)", gap: 20 }}>
        <Loader2 className="animate-spin" size={32} color="#00d4ff" />
        <p style={{ color: "var(--text-muted)" }}>Redirecting to login...</p>
      </div>
    );
  }

  // Block Owners with unpaid or pending status
  if (role === "owner" && paymentStatus !== "verified") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a, #1e293b)", padding: 24, textAlign: "center" }}>
        <div className="glass" style={{ maxWidth: 480, padding: 48, borderRadius: 32, border: "1px solid rgba(0,212,255,0.2)", background: "rgba(30,41,59,0.7)", backdropFilter: "blur(20px)" }}>
           <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "0 0 40px rgba(0,212,255,0.1)" }}>
             <ShieldAlert size={40} color="#00d4ff" />
           </div>
           
           {paymentStatus === "pending_approval" ? (
             <>
               <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, color: "white" }}>Verification in Progress</h1>
               <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 32, fontSize: 15 }}>
                 Great news! We've received your proof. Our team is currently reviewing your payment. You'll have full access to your <strong>{plan?.toUpperCase()}</strong> dashboard within a few minutes.
               </p>
               <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                 <div style={{ padding: "16px", borderRadius: 16, background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)", fontSize: 14, color: "#00d4ff", fontWeight: 600 }}>
                   Status: <span style={{ color: "#00ff88" }}>Pending Approval</span>
                 </div>
                 <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: "16px", borderRadius: 16, fontWeight: 800 }}>
                   Check Status Now
                 </button>
               </div>
             </>
           ) : (
             <>
               <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, color: "white" }}>Dashboard Locked</h1>
               <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: 32, fontSize: 15 }}>
                 Your arena profile is created, but you need an active subscription to access the management tools.
               </p>
               <Link href={`/checkout?plan=${plan}`} style={{ 
                 display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                 padding: "18px", borderRadius: 16, background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617", textDecoration: "none", fontWeight: 900,
                 boxShadow: "0 10px 30px -10px rgba(0,255,136,0.5)"
               }}>
                 Activate {plan?.toUpperCase()} Plan <ArrowRight size={20} />
               </Link>
             </>
           )}

           <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 20 }}>
              <a href="https://wa.me/9779829098384" target="_blank" style={{ color: "#00ff88", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Need Help? Chat on WhatsApp
              </a>
              <button onClick={() => logout()} style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Switch Account
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)", position: "relative" }}>
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 90, display: "none" }} 
          className="show-mobile"
        />
      )}

      <div style={{ zIndex: 100 }} className={mobileMenuOpen ? "" : "hide-mobile-sidebar"}>
        <DashboardSidebar />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main style={{ flex: 1, padding: "clamp(16px, 4vw, 32px)", overflowY: "auto" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hide-mobile-sidebar { display: none !important; }
          .show-mobile { display: block !important; }
          aside { position: fixed !important; top: 0; left: 0; bottom: 0; }
        }
      `}</style>
    </div>
  );
}
