"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Check, CreditCard, Landmark, ArrowRight, MessageCircle, Mail, ShieldCheck, Loader2, Upload, X, Globe } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { doc, setDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
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
  const { user, plan: authPlan, loading: authLoading } = useAuth();
  
  // Hydration safety: use local state for plan to avoid mismatch
  const [selectedPlanId, setSelectedPlanId] = useState<string>("pro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = searchParams.get("plan");
    if (p && plans[p as keyof typeof plans]) {
      setSelectedPlanId(p);
    } else if (authPlan && plans[authPlan as keyof typeof plans]) {
      setSelectedPlanId(authPlan);
    }
  }, [searchParams, authPlan]);

  const currentPlan = plans[selectedPlanId as keyof typeof plans] || plans.pro;

  const [method, setMethod] = useState<"esewa" | "khalti" | "bank">("esewa");
  const [submitting, setSubmitting] = useState(false);
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
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Compress image to fit Firestore limits
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max = 800; // Max dimension
          
          if (width > height && width > max) {
            height *= max / width;
            width = max;
          } else if (height > max) {
            width *= max / height;
            height = max;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setPreview(compressed);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(f);
    }
  };

  const handleManualSubmit = async () => {
    if (!file) {
      alert("Please upload your payment screenshot first.");
      return;
    }
    setSubmitting(true);
    try {
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          paymentStatus: "pending_approval",
          paymentMethod: method,
          plan: selectedPlanId,
          proofUrl: preview,
          submittedAt: serverTimestamp()
        }, { merge: true });
        alert("Payment screenshot submitted! Your dashboard will be activated once verified.");
        router.push("/dashboard"); 
      } else {
        alert("Session expired. Please log in again.");
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting payment proof.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", padding: "clamp(20px, 5vw, 60px) 20px", position: "relative", overflowX: "hidden" }}>
       <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,212,255,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
      
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20, textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 900, fontSize: 18 }}>
              GH
            </div>
            <span style={{ fontSize: 20, fontWeight: 900 }}>Game<span style={{ color: "#00ff88" }}>Haru</span></span>
          </Link>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 800, letterSpacing: "-1px" }}>
            Secure your <span className="gradient-text">{currentPlan.name}</span> access
          </h1>
        </div>

        <div className="grid-mobile-1" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(20px, 4vw, 40px)" }}>
          {/* Summary */}
          <div className="glass" style={{ padding: "clamp(20px, 4vw, 32px)", borderRadius: 24, height: "fit-content" }}>
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

          {/* Payment */}
          <div className="glass" style={{ padding: "clamp(20px, 4vw, 32px)", borderRadius: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Choose Payment Channel</h2>
            
            <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 12 }}>
              {["esewa", "khalti", "bank"].map(m => (
                <button key={m} onClick={() => setMethod(m as any)} style={{ flex: 1, padding: "12px 8px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", background: method === m ? "linear-gradient(135deg, #00d4ff, #00ff88)" : "transparent", color: method === m ? "#020617" : "var(--text-secondary)", transition: "0.2s" }}>
                   {m.charAt(0).toUpperCase() + m.slice(1)}
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
                   <div style={{ width: 140, height: 140, background: "white", margin: "0 auto", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", overflow: "hidden" }}>
                      {(method === "esewa" && superAdmin?.qrEsewa) || (method === "khalti" && superAdmin?.qrKhalti) ? (
                        <img src={method === "esewa" ? superAdmin.qrEsewa : superAdmin.qrKhalti} alt="QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>QR Code<br/>Coming Soon</span>
                      )}
                   </div>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Upload Payment Screenshot</label>
                {!preview ? (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 120, border: "2px dashed var(--border)", borderRadius: 16, cursor: "pointer", gap: 10 }}>
                    <Upload size={24} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Tap to upload screenshot</span>
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 160, border: "1px solid var(--border)" }}>
                     <img src={preview} alt="Proof" style={{ width: "100%", height: "100%", objectFit: "contain", background: "black" }} />
                     <button onClick={() => {setPreview(null); setFile(null);}} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", border: "none", color: "white", padding: 5, borderRadius: "50%" }}>
                       <X size={14} />
                     </button>
                  </div>
                )}
              </div>

              <button onClick={handleManualSubmit} disabled={submitting || !file} className="btn-primary" style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: submitting || !file ? 0.6 : 1 }}>
                 {submitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Proof for Approval"}
              </button>
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Need assistance?</div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
                <a href="https://wa.me/9779829098384" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "#00ff88", textDecoration: "none", fontSize: 13, fontWeight: 600 }}><MessageCircle size={16} /> WhatsApp</a>
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617" }}>
        <Loader2 className="animate-spin" size={32} color="#00d4ff" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
