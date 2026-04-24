"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { Save, AlertTriangle, CheckCircle2, IndianRupee } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export default function AdminPricingPage() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchPricing() {
      try {
        const docRef = doc(db, "settings", "pricing");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPlans(docSnap.data().plans);
        } else {
          // Default plans if none exist in DB
          const defaultPlans = [
            { id: "starter", name: "Starter Plan", price: 599, features: ["Max 2 Sports Categories", "Manage 50 Bookings/mo", "Basic Analytics", "Customer Database"] },
            { id: "pro", name: "Pro Plan", price: 1499, features: ["Unlimited Sports", "Unlimited Bookings", "Advanced Analytics", "Custom Domain Support", "Marketing Tools"] },
            { id: "enterprise", name: "Enterprise", price: 4999, features: ["Multi-arena Management", "API Access", "Priority Support", "White-label Solution", "Custom Integrations"] }
          ];
          setPlans(defaultPlans);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "pricing"), { plans });
      setMessage("Pricing updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save pricing.");
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = (id: string, price: number) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, price } : p));
  };

  if (role !== "admin") return <div style={{ padding: 40, textAlign: "center" }}>Access Denied</div>;
  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>SaaS Pricing Manager</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Update the plans and pricing shown on the landing page.</p>
        </div>
        <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px" }}>
          {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: message.includes("success") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${message.includes("success") ? "#00ff88" : "#ef4444"}`, color: message.includes("success") ? "#00ff88" : "#ef4444", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          {message.includes("success") ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {message}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {plans.map(plan => (
          <div key={plan.id} className="glass" style={{ padding: 28, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4ff" }}>
                <IndianRupee size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{plan.features.slice(0, 3).join(" • ")}...</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>₹</span>
              <input type="number" className="input-field" style={{ width: 120, fontSize: 20, fontWeight: 800, textAlign: "center" }}
                value={plan.price} onChange={e => updatePrice(plan.id, parseInt(e.target.value) || 0)} />
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>/month</span>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: 40, padding: 24, borderRadius: 16, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", gap: 16 }}>
        <AlertTriangle color="#f59e0b" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <strong>Note:</strong> Changes to pricing will take effect immediately for new subscribers. Existing subscribers will keep their current rates until their next billing cycle or manual intervention.
        </p>
      </div>
    </div>
  );
}

