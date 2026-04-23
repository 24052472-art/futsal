"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const defaultPlans = [
  {
    name: "Starter",
    monthlyPrice: 599,
    yearlyPrice: 479,
    badge: null,
    color: "#6366f1",
    features: [
      "Up to 2 game categories",
      "100 bookings/month",
      "Basic booking system",
      "Shareable booking link",
      "Email notifications",
      "Manual booking entry",
      "Basic dashboard",
    ],
    notIncluded: ["Online payments", "Advanced analytics", "Coupons", "Staff accounts"],
  },
  {
    name: "Pro",
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    badge: "Most Popular",
    color: "#10b981",
    features: [
      "Up to 5 game categories",
      "500 bookings/month",
      "Online payments (Razorpay/Khalti)",
      "Advanced analytics dashboard",
      "Coupon & discount system",
      "Invoice generation",
      "2 staff accounts",
      "Email notifications",
    ],
    notIncluded: ["WhatsApp notifications", "Custom domain", "Priority support"],
  },
  {
    name: "Enterprise",
    monthlyPrice: 4999,
    yearlyPrice: 3999,
    badge: "Best Value",
    color: "#f59e0b",
    features: [
      "Unlimited game categories",
      "Unlimited bookings",
      "Everything in Pro",
      "WhatsApp notifications",
      "Custom domain support",
      "Unlimited staff accounts",
      "Multi-location arenas",
      "Priority support",
      "API access",
    ],
    notIncluded: [],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [plans, setPlans] = useState(defaultPlans);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const docRef = doc(db, "settings", "pricing");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dbPlans = docSnap.data().plans;
          // Map DB prices back to our detailed plan structure
          setPlans(defaultPlans.map(p => {
            const dbPlan = dbPlans.find((dp: any) => dp.id === p.name.toLowerCase());
            if (dbPlan) {
              return { 
                ...p, 
                monthlyPrice: dbPlan.price,
                yearlyPrice: Math.floor(dbPlan.price * 0.8) // Apply 20% discount for yearly
              };
            }
            return p;
          }));
        }
      } catch (err) {
        console.error("Pricing Fetch Error:", err);
      }
    }
    fetchPricing();
  }, []);

  return (
    <section id="pricing" className="section-pad" style={{ position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />
      <div className="container-pad" style={{ position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ color: "#818cf8", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Pricing</span>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
            Simple, transparent pricing.<br />
            <span className="gradient-text">No hidden fees.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginTop: 12 }}>Start with a 7-day free trial. No credit card required.</p>

          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, marginTop: 28, background: "rgba(30,41,59,0.7)", border: "1px solid var(--border)", borderRadius: 100, padding: "6px 8px" }}>
            <button onClick={() => setYearly(false)} style={{ padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: !yearly ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "transparent", color: !yearly ? "white" : "var(--text-secondary)", transition: "all 0.3s" }}>Monthly</button>
            <button onClick={() => setYearly(true)} style={{ padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: yearly ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "transparent", color: yearly ? "white" : "var(--text-secondary)", transition: "all 0.3s", display: "flex", alignItems: "center", gap: 8 }}>
              Yearly <span style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>Save 20%</span>
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24, alignItems: "start" }}>
          {plans.map((plan, i) => (
            <div key={plan.name} className={i === 1 ? "animate-pulse-glow" : ""} style={{
              borderRadius: 20,
              padding: 32,
              background: i === 1 ? "linear-gradient(145deg,rgba(16,185,129,0.12),rgba(6,78,59,0.08))" : "rgba(30,41,59,0.6)",
              border: `1px solid ${i === 1 ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
              backdropFilter: "blur(16px)",
              position: "relative",
              transform: i === 1 ? "scale(1.03)" : "none",
            }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${plan.color},${plan.color}cc)`, color: "white", padding: "5px 18px", borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                  ⭐ {plan.badge}
                </div>
              )}

              <div style={{ color: plan.color, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{plan.name}</div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 48, fontWeight: 900 }}>
                  ₹{yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: 14 }}>/month</span>
              </div>
              {yearly && <div style={{ color: "#10b981", fontSize: 12, marginBottom: 16, fontWeight: 600 }}>Billed ₹{plan.yearlyPrice * 12}/year</div>}

              <Link href={`/register?plan=${plan.name.toLowerCase()}`} style={{
                display: "block", textAlign: "center", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none", marginTop: 24, marginBottom: 28,
                background: i === 1 ? `linear-gradient(135deg,${plan.color},${plan.color}cc)` : "transparent",
                border: `1.5px solid ${i === 1 ? plan.color : "var(--border-hover)"}`,
                color: i === 1 ? "white" : "var(--text-primary)",
                transition: "all 0.3s",
              }}>
                {i === 1 ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Zap size={16} fill="currentColor" /> Get Started</span> : "Start Free Trial"}
              </Link>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Check size={15} color={plan.color} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.4 }}>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", border: "1px solid var(--text-muted)", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "line-through" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, marginTop: 40 }}>
          All plans include 7-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
