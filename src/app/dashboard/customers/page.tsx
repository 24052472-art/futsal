"use client";
import { Search, Mail, Phone, Calendar, User as UserIcon, Trash2, ShieldAlert, Bell, Crown, CheckCircle2, XCircle, ExternalLink, Image as ImageIcon, IndianRupee, Clock, Zap, Wallet, Landmark, Loader2, ShieldCheck, User } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";

export default function CustomersPage() {
  const { role, user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewProof, setViewProof] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      if (role === "admin") {
        // Fetch all users to ensure we don't miss anyone with missing timestamps
        const q = query(collection(db, "users"));
        const snap = await getDocs(q);
        const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort: Pending Approval first, then newest by submittedAt or createdAt
        users.sort((a: any, b: any) => {
          // Rule 1: Pending Approval always comes first
          const aPending = a.paymentStatus === "pending_approval";
          const bPending = b.paymentStatus === "pending_approval";
          if (aPending && !bPending) return -1;
          if (!aPending && bPending) return 1;

          // Rule 2: Newer submissions first
          const aTime = a.submittedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
          const bTime = b.submittedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        setDataList(users);
      } else {
        const q = query(collection(db, "bookings"), where("ownerId", "==", currentUser?.uid || ""), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setDataList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => {
    if (!currentUser || !role) return;
    fetchData();
  }, [role, currentUser]);

  const handleAdminAction = async (userId: string, action: "approve" | "decline" | "delete") => {
    if (userId === currentUser?.uid) {
      alert("You cannot perform actions on your own super-admin account.");
      return;
    }
    
    // OPTIMISTIC UPDATE: Change UI immediately
    const oldData = [...dataList];
    if (action === "approve" || action === "decline") {
      const newStatus = action === "approve" ? "verified" : "unpaid";
      setDataList(prev => prev.map(u => u.id === userId ? { ...u, paymentStatus: newStatus } : u));
    } else if (action === "delete") {
      if (!confirm("Permanently delete this arena owner?")) return;
      setDataList(prev => prev.filter(u => u.id !== userId));
    }

    setProcessingId(userId);
    try {
      if (action === "delete") {
        await deleteDoc(doc(db, "users", userId));
      } else if (action === "approve") {
        // Background DB update
        await updateDoc(doc(db, "users", userId), {
          paymentStatus: "verified",
          updatedAt: serverTimestamp()
        });

        // Background Email notification
        const approvedUser = oldData.find(u => u.id === userId);
        if (approvedUser?.email) {
          const planPriceMap: Record<string, number> = {
            starter: 599,
            pro: 1499,
            enterprise: 4999
          };
          const planAmount = planPriceMap[approvedUser.plan?.toLowerCase()] || 0;

          fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ownerEmail: approvedUser.email,
              customerName: approvedUser.displayName || "Partner",
              date: new Date().toISOString(),
              time: new Date().toLocaleTimeString(),
              amount: planAmount,
              sportName: "Partner Approval"
            })
          }).catch(e => console.error("Email fail:", e));
        }
      } else {
        await updateDoc(doc(db, "users", userId), {
          paymentStatus: "unpaid",
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Admin Action Error:", err);
      setDataList(oldData);
      alert("Action failed. Please check your connection.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleBookingStatus = async (id: string, status: string) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "bookings", id), { status, updatedAt: serverTimestamp() });
      setDataList(dataList.map(u => u.id === id ? { ...u, status } : u));
    } catch (err) { console.error(err); } finally { setProcessingId(null); }
  };

  const handleDeleteOwnerRecord = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this booking record?")) {
      setProcessingId(id);
      try {
        await deleteDoc(doc(db, "bookings", id));
        setDataList(dataList.filter(c => c.id !== id));
      } catch (err) {
        console.error("Delete Error:", err);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const filtered = dataList.filter(c => 
    (c.customerName || c.displayName || "").toLowerCase().includes(search.toLowerCase()) || 
    (c.customerEmail || c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
       <Loader2 className="animate-spin" size={32} color="#00d4ff" />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "-1px", marginBottom: 4 }}>
            {role === "admin" ? "Partner Directory" : "Booking Verification"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {role === "admin" ? "Global management of all registered arena owners." : "Review and verify customer payments for your arena."}
          </p>
        </div>
        <div style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", fontWeight: 800, fontSize: 14 }}>
           {dataList.length} Records
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 32, maxWidth: 450 }}>
        <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input className="input-field" placeholder="Search by name or email..." style={{ padding: "14px 14px 14px 48px", borderRadius: 16 }}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 24 }}>
        {filtered.map(c => (
          <div key={c.id} className="glass" style={{ borderRadius: 28, padding: 32, border: "1px solid var(--border)", position: "relative" }}>
             {/* Header */}
             <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#00d4ff,#00ff88)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, color: "white" }}>
                   {(c.customerName || c.displayName || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{c.customerName || c.displayName || "Anonymous"}</div>
                   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", borderRadius: 100, background: (c.status === "confirmed" || c.paymentStatus === "verified") ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: (c.status === "confirmed" || c.paymentStatus === "verified") ? "#00ff88" : "#f59e0b" }}>
                         {c.status || c.paymentStatus || "unpaid"}
                      </span>
                      {role === "admin" && <span style={{ fontSize: 10, color: "#00d4ff", fontWeight: 800 }}>{c.plan?.toUpperCase()} PLAN</span>}
                   </div>
                </div>
             </div>

             <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 14 }}>
                  <Mail size={16} color="#00d4ff" /> {c.customerEmail || c.email || "No Email Provided"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 14 }}>
                  <Phone size={16} color="#00d4ff" /> {c.customerPhone || c.phone || "No Phone"}
                </div>
                
                {c.paymentStatus === "verified" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#10b981", fontSize: 14, fontWeight: 700 }}>
                    <Calendar size={16} /> 
                    {(() => {
                      const start = c.updatedAt?.toMillis?.() || c.createdAt?.toMillis?.() || Date.now();
                      const expiry = start + (30 * 24 * 60 * 60 * 1000); 
                      const remaining = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
                      return remaining > 0 ? `${remaining} Days Remaining` : "Expired";
                    })()}
                  </div>
                )}
                
                {role === "owner" && (
                   <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 14 }}>
                     <Clock size={16} color="#00d4ff" /> {c.time} • {c.date ? new Date(c.date).toLocaleDateString() : ""}
                   </div>
                )}
             </div>

             {(c.receiptUrl || c.proofUrl) && (
                <div style={{ marginBottom: 28 }}>
                   <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase" }}>Payment Evidence</div>
                   <img onClick={() => setViewProof(c.receiptUrl || c.proofUrl)} src={c.receiptUrl || c.proofUrl} alt="Evidence" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 20, cursor: "pointer", border: "1px solid var(--border)" }} />
                </div>
             )}

             {/* Actions for Admin */}
             {role === "admin" && (
                <div style={{ display: "flex", gap: 10 }}>
                   {c.paymentStatus !== "verified" ? (
                      <button onClick={() => handleAdminAction(c.id, "approve")} disabled={processingId === c.id} style={{ flex: 2, padding: "12px", borderRadius: 12, background: "#00ff88", color: "white", border: "none", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                         {processingId === c.id ? "..." : "Approve Partner"}
                      </button>
                   ) : (
                      <button onClick={() => handleAdminAction(c.id, "decline")} disabled={processingId === c.id} style={{ flex: 2, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                         {processingId === c.id ? "..." : "Revoke Access"}
                      </button>
                   )}
                   <button onClick={() => handleAdminAction(c.id, "delete")} disabled={processingId === c.id} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 800, cursor: "pointer" }}>
                      <Trash2 size={18} />
                   </button>
                </div>
             )}

             {/* Actions for Owner */}
             {role === "owner" && (
                <div style={{ display: "flex", gap: 10 }}>
                   {c.status === "pending_verification" && (
                     <>
                       <button onClick={() => handleBookingStatus(c.id, "confirmed")} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#00ff88", color: "#020617", border: "none", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Verify</button>
                       <button onClick={() => handleBookingStatus(c.id, "rejected")} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Reject</button>
                     </>
                   )}
                   <button onClick={() => handleDeleteOwnerRecord(c.id)} disabled={processingId === c.id} style={{ flex: c.status !== "pending_verification" ? 1 : "initial", padding: "12px", borderRadius: 12, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                      <Trash2 size={18} /> {c.status !== "pending_verification" ? "Delete Record" : ""}
                   </button>
                </div>
             )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {viewProof && (
        <div onClick={() => setViewProof(null)} style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, cursor: "zoom-out", backdropFilter: "blur(12px)" }}>
           <img src={viewProof} alt="Evidence" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 24, boxShadow: "0 0 60px rgba(0,0,0,0.5)" }} />
           <button style={{ position: "absolute", top: 32, right: 32, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", padding: 12, color: "white", cursor: "pointer" }}><XCircle size={24} /></button>
        </div>
      )}
    </div>
  );
}

