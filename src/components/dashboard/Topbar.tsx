"use client";
import { Bell, Search, ExternalLink, Calendar, ShieldCheck, Crown, Menu, Share2, Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, role, plan, paymentStatus } = useAuth();
  const [showPlan, setShowPlan] = useState(false);
  const [copied, setCopied] = useState(false);
  const [arenaSlug, setArenaSlug] = useState("");

  const copyShareLink = () => {
    const url = `${window.location.origin}/arena/${arenaSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!user) return;
    const fetchSlug = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setArenaSlug(snap.data().arenaSlug || user.uid);
        } else {
          setArenaSlug(user.uid);
        }
      } catch { setArenaSlug(user.uid); }
    };
    fetchSlug();
  }, [user]);

  // Map the plan ID to a display name
  const planDisplay = {
    starter: "Starter Plan",
    pro: "Pro Plan",
    enterprise: "Enterprise Plan"
  };

  const currentPlanName = plan ? planDisplay[plan as keyof typeof planDisplay] : "Starter Plan";

  return (
    <header style={{ height: 64, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px, 4vw, 32px)", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button 
          onClick={onMenuClick}
          style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "none" }} 
          className="show-mobile"
        >
          <Menu size={24} />
        </button>
        <div style={{ position: "relative", width: "clamp(120px, 25vw, 280px)" }} className="hide-mobile">
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input className="input-field" placeholder="Search..." style={{ padding: "8px 14px 8px 34px", fontSize: 13 }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="hide-mobile">
           <Link href={`/arena/${arenaSlug}`} target="_blank" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text-secondary)", textDecoration: "none", fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#00d4ff"; (e.currentTarget as HTMLElement).style.color = "#00d4ff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
            <ExternalLink size={13} /> <span className="hide-tablet">View Public Page</span>
          </Link>
          
          <button onClick={copyShareLink} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: copied ? "1px solid #10b981" : "1px solid var(--border)", color: copied ? "#10b981" : "var(--text-secondary)", background: "transparent", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? <Check size={13} /> : <Share2 size={13} />} 
            <span className="hide-tablet">{copied ? "Copied!" : "Share Link"}</span>
          </button>
        </div>

        <button style={{ position: "relative", width: 38, height: 38, borderRadius: 10, border: "1px solid var(--border)", background: "rgba(30,41,59,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
          <Bell size={17} />
          <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "1.5px solid var(--surface)" }} />
        </button>

        <div style={{ position: "relative" }}>
          <div onClick={() => setShowPlan(!showPlan)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", borderRadius: 10, background: "rgba(30,41,59,0.6)", border: "1px solid var(--border)", cursor: role === "admin" ? "default" : "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => role !== "admin" && (e.currentTarget.style.borderColor = "var(--border-hover)")}
            onMouseLeave={e => role !== "admin" && (e.currentTarget.style.borderColor = "var(--border)")}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: "#020617" }}>
              {user?.displayName ? user.displayName.charAt(0) : "U"}
            </div>
            <div className="hide-mobile">
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1, color: "white" }}>{user?.displayName || "Arena Owner"}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{role === "admin" ? "Super Admin" : currentPlanName}</div>
            </div>
          </div>

          {showPlan && role !== "admin" && (
            <div className="glass animate-scale-in" style={{ 
              position: "absolute", top: "calc(100% + 12px)", right: 0, width: 260, 
              borderRadius: 16, padding: 24, zIndex: 1000, 
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", 
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(15,23,42,0.98)", 
              backdropFilter: "blur(20px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Crown size={16} color="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Subscription Details</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>Current Plan</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#00d4ff" }}>{currentPlanName}</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>Expires On</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>May 24, 2026</div>
                </div>
                <div style={{ background: paymentStatus === "verified" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", padding: "10px", borderRadius: 10, border: paymentStatus === "verified" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(245,158,11,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: paymentStatus === "verified" ? "#10b981" : "#f59e0b" }}>Status</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: paymentStatus === "verified" ? "#10b981" : "#f59e0b" }}>
                      {paymentStatus === "verified" ? "Active" : paymentStatus === "pending_approval" ? "Reviewing" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>
              <button style={{ width: "100%", marginTop: 16, padding: "8px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }} onClick={() => setShowPlan(false)}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .hide-tablet { display: none !important; }
        }
      `}</style>
    </header>
  );
}
