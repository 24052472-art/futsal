"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Check, CreditCard, Landmark, ArrowRight, MessageCircle, Mail, ShieldCheck, Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { doc, updateDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

const plans = {
  starter: { name: "Starter", price: 599 },
  pro: { name: "Pro", price: 1499 },
  enterprise: { name: "Enterprise", price: 4999 },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, plan, plan: authPlan } = useAuth();
  const selectedPlanId = searchParams.get("plan") || authPlan || "starter";
  const currentPlan = plans[selectedPlanId as keyof typeof plans] || plans.starter;

  const [method, setMethod] = useState<"esewa" | "khalti" | "bank">("esewa");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [superAdmin, setSuperAdmin] = useState<any>(null);

  useEffect(() => {
    const fetchSuperAdmin = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "admin"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setSuperAdmin(snap.docs[0].data());
        }
      } catch (err) {
        console.error("Error fetching super admin:", err);
      }
    };
    fetchSuperAdmin();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleManualSubmit = async () => {
    if (!file) {
      alert("Please upload your payment screenshot first.");
      return;
    }
    setLoading(true);
    try {
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          paymentStatus: "pending_approval",
          paymentMethod: method,
          plan: selectedPlanId,
          proofUrl: preview, 
          submittedAt: serverTimestamp()
        });
      }
      alert("Payment screenshot submitted! Your dashboard will be activated once the Super Admin verifies the transaction.");
      router.push("/dashboard"); 
    } catch (err) {
      console.error(err);
      alert("Error submitting payment proof.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Check size={40} color="#10b981" />
        </div>
        <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Activation Successful!</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Your arena is now live. Redirecting...</p>
        <Loader2 className="animate-spin" size={24} color="#00d4ff" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "40px 24px", position: "relative" }}>
       <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,212,255,0.1) 0%, transparent 70%)" }} />
      
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 900, fontSize: 18, fontFamily: "sans-serif", letterSpacing: "-1px" }}>
              GH
            </div>
            <span style={{ fontSize: 20, fontWeight: 900 }}>Game<span style={{ color: "#00ff88" }}>Haru</span> Activation</span>
          </div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1px" }}>
            Secure your <span className="gradient-text">{currentPlan.name}</span> access
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          <div className="glass" style={{ padding: 32, borderRadius: 24, height: "fit-content" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Order Summary</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "var(--text-secondary)" }}>{currentPlan.name} Plan</span>
              <span style={{ fontWeight: 700 }}>₹{currentPlan.price}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-secondary)" }}>Tax & Fees</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>₹0.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
              <span style={{ fontSize: 20, fontWeight: 800 }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: "white" }}>₹{currentPlan.price}</span>
            </div>
            <div style={{ background: "rgba(16,185,129,0.06)", borderRadius: 16, padding: 20, border: "1px solid rgba(16,185,129,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <ShieldCheck size={18} color="#10b981" />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#10b981" }}>Money Back Guarantee</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>Secure and encrypted transaction. 7-day refund policy applied.</p>
            </div>
          </div>

          <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Choose Payment Channel</h2>
            
            <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 12 }}>
              {[
                { id: "esewa", label: "eSewa" },
                { id: "khalti", label: "Khalti" },
                { id: "bank", label: "Bank" }
              ].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id as any)} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", background: method === m.id ? "linear-gradient(135deg, #00d4ff, #00ff88)" : "transparent", color: method === m.id ? "#020617" : "var(--text-secondary)", transition: "0.2s" }}>
                   {m.label}
                </button>
              ))}
            </div>

            <div style={{ animation: "fadeIn 0.3s ease" }}>
              {method === "bank" ? (
                <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, padding: 20, border: "1px solid var(--border)", marginBottom: 24 }}>
                   <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 8 }}>Bank Account Details:</div>
                   <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "white", letterSpacing: "1px" }}>55509121620</div>
                   <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>A/C Holder: Abhishek Kushwaha</div>
                   <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Bank: Siddharth Bank</div>
                   <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Branch: Murli Chowk</div>
                </div>
              ) : (
                <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, padding: 20, border: "1px solid var(--border)", marginBottom: 24, textAlign: "center" }}>
                   <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 12 }}>Scan to Pay via {method === "esewa" ? "eSewa" : "Khalti"}:</div>
                   <div style={{ width: 160, height: 160, background: "white", margin: "0 auto", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", border: "1px solid var(--border)", overflow: "hidden" }}>
                      {(method === "esewa" && superAdmin?.qrEsewa) || (method === "khalti" && superAdmin?.qrKhalti) ? (
                        <img src={method === "esewa" ? superAdmin.qrEsewa : superAdmin.qrKhalti} alt={`${method} QR`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600 }}>Super Admin<br/>{method.toUpperCase()} QR</span>
                      )}
                   </div>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Upload Payment Screenshot</label>
                {!preview ? (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 120, border: "2px dashed var(--border)", borderRadius: 16, cursor: "pointer", gap: 10, transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#00d4ff"}>
                    <Upload size={24} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Click to upload screenshot</span>
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 160, border: "1px solid var(--border)" }}>
                     <img src={preview} alt="Proof" style={{ width: "100%", height: "100%", objectFit: "contain", background: "black" }} />
                     <button onClick={() => {setPreview(null); setFile(null);}} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", border: "none", color: "white", padding: 5, borderRadius: "50%", cursor: "pointer" }}>
                       <X size={14} />
                     </button>
                  </div>
                )}
              </div>

              <button onClick={handleManualSubmit} disabled={loading || !file} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                 {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit Proof for Approval"}
              </button>
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Need assistance?</div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
                <a href="https://wa.me/9779829098384" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, color: "#00ff88", textDecoration: "none", fontSize: 13, fontWeight: 600 }}><MessageCircle size={16} /> WhatsApp</a>
                <a href="mailto:abhi.kush047@gmail.com" style={{ display: "flex", alignItems: "center", gap: 8, color: "#00d4ff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}><Mail size={16} /> Email</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <Loader2 className="animate-spin" size={32} color="#00d4ff" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
