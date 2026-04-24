"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe, Shield, UserCircle, Crown, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

const plans = [
  { id: "starter", name: "Starter", price: 599, badge: null, desc: "Basic features for small arenas" },
  { id: "pro", name: "Pro", price: 1499, badge: "Popular", desc: "Advanced tools for growing sports hubs" },
  { id: "enterprise", name: "Enterprise", price: 4999, badge: null, desc: "Unlimited power for multiple locations" },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle, user } = useAuth();
  const [role, setRole] = useState<"owner" | "customer">("owner");
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const getPrice = (basePrice: number) => {
    if (billingCycle === "monthly") return basePrice;
    return Math.floor(basePrice * 12 * 0.8); // 20% discount for yearly
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const planString = `${selectedPlan}_${billingCycle}`;
      await loginWithGoogle(planString);
      router.push(`/checkout?plan=${selectedPlan}&cycle=${billingCycle}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 900, fontSize: 20, fontFamily: "sans-serif", letterSpacing: "-1px" }}>
              GH
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-1px" }}>Game<span style={{ color: "#00ff88" }}>Haru</span></span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Get Started</h1>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>Create your account in seconds with Google.</p>
        </div>

        <div className="glass" style={{ padding: 32, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: 4, borderRadius: 12, marginBottom: 24 }}>
            <button onClick={() => setRole("owner")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: role === "owner" ? "#00d4ff" : "transparent", color: role === "owner" ? "#020617" : "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "0.2s" }}>
              <Shield size={16} /> Arena Owner
            </button>
            <button onClick={() => setRole("customer")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: role === "customer" ? "#00d4ff" : "transparent", color: role === "customer" ? "#020617" : "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "0.2s" }}>
              <UserCircle size={16} /> Customer
            </button>
          </div>

          {role === "owner" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: billingCycle === "monthly" ? "white" : "#64748b" }}>Monthly</span>
                <button 
                  onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
                  style={{ width: 44, height: 22, borderRadius: 100, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", padding: 2 }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#00ff88", position: "absolute", top: 2, left: billingCycle === "monthly" ? 2 : 24, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: billingCycle === "yearly" ? "white" : "#64748b" }}>Yearly</span>
                  <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(0,255,136,0.1)", color: "#00ff88", padding: "2px 8px", borderRadius: 100, border: "1px solid rgba(0,255,136,0.2)" }}>Save 20%</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {plans.map(p => (
                  <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ padding: "16px 20px", borderRadius: 16, border: `2px solid ${selectedPlan === p.id ? "#00d4ff" : "rgba(255,255,255,0.05)"}`, background: selectedPlan === p.id ? "rgba(0,212,255,0.08)" : "rgba(15,23,42,0.4)", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{p.name} {p.badge && <span style={{ fontSize: 9, background: "#00ff88", color: "#020617", padding: "2px 6px", borderRadius: 100, marginLeft: 6, verticalAlign: "middle" }}>{p.badge}</span>}</div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, color: "white", fontSize: 18 }}>₹{getPrice(p.price).toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>per {billingCycle === "monthly" ? "month" : "year"}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.desc}</div>
                    {selectedPlan === p.id && <div style={{ fontSize: 11, color: "#00d4ff", marginTop: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Selected</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleGoogleRegister} disabled={loading} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "white", color: "#0f172a", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 10px 20px -5px rgba(255,255,255,0.1)" }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Globe size={20} /> Continue with Google</>}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 32, color: "#94a3b8", fontSize: 14 }}>
          Already have an account? <Link href="/login" style={{ color: "#00d4ff", fontWeight: 700, textDecoration: "none" }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <Loader2 className="animate-spin" size={32} color="#00d4ff" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
