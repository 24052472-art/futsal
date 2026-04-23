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

  if (!user || (role !== "admin" && role !== "owner")) return null;

  // Block Owners with unpaid or pending status
  if (role === "owner" && paymentStatus !== "verified") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", padding: 24, textAlign: "center" }}>
        <div className="glass" style={{ maxWidth: 480, padding: 48, borderRadius: 32, border: "1px solid var(--border)" }}>
           <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
             <ShieldAlert size={36} color="#f59e0b" />
           </div>
           
           {paymentStatus === "pending_approval" ? (
             <>
               <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Payment Under Review</h1>
               <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 32 }}>
                 We've received your payment proof! Our Super Admin is currently verifying the transaction. This usually takes 1-2 hours.
               </p>
               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                 <div style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", fontSize: 13, color: "var(--text-secondary)" }}>
                   Status: <span style={{ color: "#f59e0b", fontWeight: 700 }}>Pending Approval</span>
                 </div>
                 <button onClick={() => window.location.reload()} style={{ padding: "14px", borderRadius: 12, background: "var(--border)", border: "none", color: "white", cursor: "pointer", fontWeight: 600 }}>
                   Refresh Status
                 </button>
               </div>
             </>
           ) : (
             <>
               <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Activation Required</h1>
               <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 32 }}>
                 Your arena dashboard is ready, but you need to activate your <strong>{plan?.toUpperCase()}</strong> plan to continue.
               </p>
               <Link href={`/checkout?plan=${plan}`} style={{ 
                 display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                 padding: "16px", borderRadius: 14, background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617", textDecoration: "none", fontWeight: 800,
                 boxShadow: "0 10px 20px -5px rgba(0,255,136,0.4)"
               }}>
                 Go to Checkout <ArrowRight size={18} />
               </Link>
             </>
           )}

           <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
              <a href="https://wa.me/9779829098384" target="_blank" style={{ color: "#00ff88", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Contact Support on WhatsApp</a>
              <button onClick={() => logout()} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                Sign out and use another account
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
