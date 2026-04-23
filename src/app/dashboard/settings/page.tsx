"use client";
import { useState, useEffect } from "react";
import { Save, MapPin, Upload, Copy, ExternalLink, Crown, QrCode, Landmark, Wallet, Loader2, CheckCircle2, Zap, User, Phone, AlignLeft, Hash, Globe } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SettingsPage() {
  const { user, plan } = useAuth();
  const [tab, setTab] = useState("arena");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    arenaName: "",
    arenaSlug: "",
    phone: "",
    address: "",
    description: "",
    customDomain: "",
  });

  const [qrs, setQrs] = useState({ esewa: "", khalti: "", bank: "" });

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            arenaName: data.arenaName || "",
            arenaSlug: data.arenaSlug || "",
            phone: data.phone || "",
            address: data.address || "",
            description: data.description || "",
            customDomain: data.customDomain || "",
          });
          setQrs({
            esewa: data.qrEsewa || "",
            khalti: data.qrKhalti || "",
            bank: data.qrBank || ""
          });
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchSettings();
  }, [user]);

  const handleQrUpload = (type: keyof typeof qrs, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setQrs(prev => ({ ...prev, [type]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...profile,
        qrEsewa: qrs.esewa,
        qrKhalti: qrs.khalti,
        qrBank: qrs.bank,
        updatedAt: serverTimestamp()
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  if (loading) return <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" color="#00d4ff" /></div>;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "-1px", marginBottom: 6 }}>Dashboard Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Global configuration for your arena and payments.</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 32, background: "rgba(30,41,59,0.5)", border: "1px solid var(--border)", borderRadius: 16, padding: 6, width: "fit-content" }}>
        {["arena", "payments", "subscription"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 28px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: tab === t ? "#00d4ff" : "transparent", color: tab === t ? "white" : "var(--text-muted)", textTransform: "capitalize", transition: "0.2s" }}>{t}</button>
        ))}
      </div>

      {tab === "arena" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>
          <div className="glass" style={{ borderRadius: 28, padding: 40 }}>
             <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}><User size={22} color="#00d4ff" /> Venue Identity</h2>
             
             <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                   <div className="input-group">
                      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase" }}>Arena Name</label>
                      <input value={profile.arenaName} onChange={e => setProfile({...profile, arenaName: e.target.value})} className="input-field" placeholder="e.g. Green Turf Arena" style={{ padding: 14, borderRadius: 14 }} />
                   </div>
                   <div className="input-group">
                      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase" }}>Custom URL Slug</label>
                      <div style={{ position: "relative" }}>
                         <Hash size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                         <input value={profile.arenaSlug} onChange={e => setProfile({...profile, arenaSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="input-field" placeholder="green-turf-kathmandu" style={{ padding: "14px 14px 14px 38px", borderRadius: 14 }} />
                      </div>
                   </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                   <div className="input-group">
                      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase" }}>Contact Phone</label>
                      <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="input-field" placeholder="+977 98..." style={{ padding: 14, borderRadius: 14 }} />
                   </div>
                   <div className="input-group">
                      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase" }}>Location Address</label>
                      <input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="input-field" placeholder="Thamel, Kathmandu" style={{ padding: 14, borderRadius: 14 }} />
                   </div>
                </div>

                <div className="input-group">
                   <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase" }}>Public Description</label>
                   <textarea value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} className="input-field" rows={4} style={{ padding: 14, borderRadius: 14, resize: "none" }} placeholder="Describe your world-class facilities..." />
                </div>

                <button onClick={handleSave} className="btn-primary" style={{ padding: 16, fontSize: 16, fontWeight: 800, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
                   {saving ? <Loader2 className="animate-spin" /> : saved ? <><CheckCircle2 size={20} /> Changes Saved!</> : <><Save size={20} /> Update Arena Profile</>}
                </button>
             </div>
          </div>

          <div className="glass" style={{ borderRadius: 28, padding: 32, textAlign: "center" }}>
             <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Live Preview</h3>
             <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>This is your public booking link. Share this with your customers.</p>
             
             <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#00d4ff", fontFamily: "monospace", wordBreak: "break-all" }}>
                   arenaos.com/arena/{profile.arenaSlug || "your-slug"}
                </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => window.open(`/arena/${profile.arenaSlug}`, "_blank")} className="btn-primary" style={{ padding: 12, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12 }}>
                   <ExternalLink size={14} /> Open Page
                </button>
                <button className="btn-outline" style={{ padding: 12, fontSize: 13, borderRadius: 12 }}>Copy Link</button>
             </div>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="glass" style={{ borderRadius: 28, padding: 40, maxWidth: 900 }}>
             <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Payment Gateway Setup</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Upload your official QR codes for instant customer payments.</p>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
                {/* eSewa */}
                <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", textAlign: "center" }}>
                   <div style={{ width: 48, height: 48, background: "rgba(16,185,129,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Wallet size={24} color="#00ff88" />
                   </div>
                   <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>eSewa</h4>
                   <label style={{ display: "block", cursor: "pointer" }}>
                      {qrs.esewa ? (
                        <div style={{ position: "relative" }}>
                           <img src={qrs.esewa} alt="eSewa QR" style={{ width: "100%", height: 160, objectFit: "contain", background: "white", borderRadius: 16, padding: 8 }} />
                           <div style={{ marginTop: 12, fontSize: 11, color: "#00d4ff", fontWeight: 800 }}>TAP TO CHANGE</div>
                        </div>
                      ) : (
                        <div style={{ height: 160, border: "2px dashed var(--border)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                           <Upload size={24} color="var(--text-muted)" />
                           <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>Upload QR</span>
                        </div>
                      )}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleQrUpload("esewa", e)} />
                   </label>
                </div>

                {/* Khalti */}
                <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", textAlign: "center" }}>
                   <div style={{ width: 48, height: 48, background: "rgba(0,212,255,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Zap size={24} color="#00d4ff" />
                   </div>
                   <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Khalti</h4>
                   <label style={{ display: "block", cursor: "pointer" }}>
                      {qrs.khalti ? (
                        <div style={{ position: "relative" }}>
                           <img src={qrs.khalti} alt="Khalti QR" style={{ width: "100%", height: 160, objectFit: "contain", background: "white", borderRadius: 16, padding: 8 }} />
                           <div style={{ marginTop: 12, fontSize: 11, color: "#00d4ff", fontWeight: 800 }}>TAP TO CHANGE</div>
                        </div>
                      ) : (
                        <div style={{ height: 160, border: "2px dashed var(--border)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                           <Upload size={24} color="var(--text-muted)" />
                           <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>Upload QR</span>
                        </div>
                      )}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleQrUpload("khalti", e)} />
                   </label>
                </div>

                {/* Bank */}
                <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", textAlign: "center" }}>
                   <div style={{ width: 48, height: 48, background: "rgba(245,158,11,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <Landmark size={24} color="#f59e0b" />
                   </div>
                   <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Bank/FonePay</h4>
                   <label style={{ display: "block", cursor: "pointer" }}>
                      {qrs.bank ? (
                        <div style={{ position: "relative" }}>
                           <img src={qrs.bank} alt="Bank QR" style={{ width: "100%", height: 160, objectFit: "contain", background: "white", borderRadius: 16, padding: 8 }} />
                           <div style={{ marginTop: 12, fontSize: 11, color: "#00d4ff", fontWeight: 800 }}>TAP TO CHANGE</div>
                        </div>
                      ) : (
                        <div style={{ height: 160, border: "2px dashed var(--border)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                           <Upload size={24} color="var(--text-muted)" />
                           <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>Upload QR</span>
                        </div>
                      )}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleQrUpload("bank", e)} />
                   </label>
                </div>
             </div>

             <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleSave} className="btn-primary" style={{ padding: "16px 48px", fontSize: 16, fontWeight: 800, borderRadius: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  {saving ? <Loader2 className="animate-spin" /> : saved ? <><CheckCircle2 size={20} /> All Set!</> : <><Save size={20} /> Save Configuration</>}
                </button>
             </div>
        </div>
      )}

      {tab === "subscription" && (
        <div className="glass" style={{ borderRadius: 28, padding: 40, maxWidth: 720 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, padding: 32, borderRadius: 24, background: "linear-gradient(135deg,rgba(0,212,255,0.1),rgba(79,70,229,0.05))", border: "1px solid rgba(0,212,255,0.2)" }}>
            <Crown size={40} color="#f59e0b" />
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, textTransform: "capitalize" }}>{plan || "Starter"} Arena Partner</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                {plan === "enterprise" ? "Unlimited Everything Â· Custom Domain Â· Priority Support" : 
                 plan === "pro" ? "Unlimited Bookings Â· Verified Gateway" : "Basic Features Â· Standard Gateway"}
              </div>
            </div>
          </div>
          
          {plan === "enterprise" && (
            <div style={{ marginBottom: 32, padding: 24, background: "rgba(15,23,42,0.4)", borderRadius: 20, border: "1px solid var(--border)" }}>
               <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Globe size={18} color="#00ff88" /> Custom Domain Configuration</h3>
               <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Connect your own domain to your booking page (e.g., bookings.yourdomain.com).</p>
               <div className="input-group">
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase" }}>Domain Name</label>
                  <input value={profile.customDomain} onChange={e => setProfile({...profile, customDomain: e.target.value})} className="input-field" placeholder="bookings.myarena.com" style={{ padding: 14, borderRadius: 14 }} />
               </div>
               <button onClick={handleSave} className="btn-primary" style={{ padding: "12px 24px", fontSize: 14, fontWeight: 800, borderRadius: 12, display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                 {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Domain
               </button>
            </div>
          )}

          <button className="btn-primary" style={{ padding: "14px 32px", fontSize: 14, borderRadius: 12 }}>Manage Subscription</button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .input-group label { transition: 0.2s; }
        .input-group:focus-within label { color: #00d4ff; }
      `}</style>
    </div>
  );
}

