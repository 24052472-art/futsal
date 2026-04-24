"use client";
import { useState, useEffect } from "react";
import { Search, Filter, CheckCircle2, XCircle, AlertCircle, Plus, Mail, Phone, Clock, IndianRupee, Loader2, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";

export default function BookingsPage() {
  const { user: currentUser } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Manual Booking Form State
  const [manualForm, setManualForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    sportName: "Futsal",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    time: "07:00-08:00"
  });

  const fetchBookings = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, "bookings"), 
        where("ownerId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    } catch (err) {
      console.error("Fetch Bookings Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "bookings", id), { 
        status: newStatus, 
        updatedAt: serverTimestamp() 
      });
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error("Update Status Error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this booking?")) {
      setProcessingId(id);
      try {
        await deleteDoc(doc(db, "bookings", id));
        setBookings(bookings.filter(b => b.id !== id));
        if (selected === id) setSelected(null);
      } catch (err) {
        console.error("Delete Booking Error:", err);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProcessingId("manual");
    try {
      await addDoc(collection(db, "bookings"), {
        ...manualForm,
        ownerId: currentUser.uid,
        status: "confirmed",
        paymentMethod: "manual_cash",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowManualModal(false);
      fetchBookings();
    } catch (err) {
      console.error("Manual Booking Error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = bookings.filter(b => {
    const name = (b.customerName || b.customer || "").toLowerCase();
    const id = b.id.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedBooking = bookings.find(b => b.id === selected);

  if (loading) return <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" color="#00d4ff" /></div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "-1px", marginBottom: 6 }}>Booking Registry</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Manage public reservations and manual walk-ins.</p>
        </div>
        <button onClick={() => setShowManualModal(true)} className="btn-primary" style={{ padding: "12px 24px", fontSize: 14, fontWeight: 800, borderRadius: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <Plus size={18} /> Manual Entry
        </button>
      </div>

      <div className="responsive-flex" style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Controls */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
             <div style={{ position: "relative", flex: 1, minWidth: 300 }}>
                <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input className="input-field" placeholder="Search by customer name or booking ID..." style={{ padding: "14px 14px 14px 48px", borderRadius: 16 }}
                  value={search} onChange={e => setSearch(e.target.value)} />
             </div>
             <div style={{ display: "flex", gap: 4, background: "rgba(30,41,59,0.5)", border: "1px solid var(--border)", borderRadius: 14, padding: 4 }}>
                {["all", "pending_verification", "confirmed", "rejected"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: statusFilter === s ? "#00d4ff" : "transparent", color: statusFilter === s ? "white" : "var(--text-muted)", transition: "0.2s", textTransform: "capitalize" }}>
                    {s.replace("_", " ")}
                  </button>
                ))}
             </div>
          </div>

          {/* Records Table */}
          <div className="glass" style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--border)" }}>
             <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                   <thead>
                      <tr style={{ background: "rgba(15,23,42,0.6)" }}>
                         {["Customer Details", "Sport", "Schedule", "Payment", "Status", "Actions"].map(h => (
                           <th key={h} style={{ textAlign: "left", padding: "18px 20px", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>
                         ))}
                      </tr>
                   </thead>
                   <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: 64, color: "var(--text-muted)" }}>No booking records found.</td></tr>
                      ) : filtered.map(b => (
                        <tr key={b.id} onClick={() => setSelected(selected === b.id ? null : b.id)} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", background: selected === b.id ? "rgba(0,212,255,0.08)" : "transparent", transition: "0.2s" }}>
                           <td style={{ padding: "20px" }}>
                              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{b.customerName || b.customer || "Anonymous"}</div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}><Mail size={10} /> {b.customerEmail || b.email || "N/A"}</div>
                           </td>
                           <td style={{ padding: "20px" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{b.sportEmoji || "⚽"} {b.sportName || b.sport || "General"}</span>
                           </td>
                           <td style={{ padding: "20px" }}>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{b.date ? new Date(b.date).toLocaleDateString() : "N/A"}</div>
                              <div style={{ fontSize: 11, color: "#00d4ff", fontWeight: 700, marginTop: 2 }}>{b.time}</div>
                           </td>
                           <td style={{ padding: "20px" }}>
                              <div style={{ fontSize: 15, fontWeight: 900, color: "#00ff88" }}>₹{b.amount}</div>
                              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{b.paymentMethod || "Online"}</div>
                           </td>
                           <td style={{ padding: "20px" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 100, fontSize: 11, fontWeight: 800, background: b.status === "confirmed" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: b.status === "confirmed" ? "#00ff88" : "#f59e0b" }}>
                                 {b.status === "confirmed" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                 {b.status?.replace("_", " ").toUpperCase()}
                              </div>
                           </td>
                           <td style={{ padding: "20px" }} onClick={e => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: 8 }}>
                                 {b.status === "pending_verification" && (
                                   <button onClick={() => handleStatusChange(b.id, "confirmed")} style={{ background: "#00ff88", color: "#020617", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Verify</button>
                                 )}
                                 <button onClick={() => handleStatusChange(b.id, "rejected")} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                                 <button onClick={() => handleDeleteBooking(b.id)} disabled={processingId === b.id} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center" }}>
                                   <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Info Panel */}
        {selectedBooking && (
          <div className="glass" style={{ borderRadius: 28, padding: 32, position: "sticky", top: 24 }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>Detailed Dossier</h3>
                <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", padding: 8, color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>
             </div>
             
             <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {selectedBooking.receiptUrl && (
                  <div style={{ marginBottom: 12 }}>
                     <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 12 }}>PAYMENT PROOF</label>
                     <img src={selectedBooking.receiptUrl} alt="Receipt" style={{ width: "100%", borderRadius: 20, border: "1px solid var(--border)" }} />
                  </div>
                )}
                {[
                  { icon: <UserIcon size={16} />, label: "Customer", value: selectedBooking.customerName || selectedBooking.customer },
                  { icon: <Mail size={16} />, label: "Email", value: selectedBooking.customerEmail || selectedBooking.email },
                  { icon: <Phone size={16} />, label: "Phone", value: selectedBooking.customerPhone || selectedBooking.phone },
                  { icon: <ImageIcon size={16} />, label: "Sport", value: selectedBooking.sportName || selectedBooking.sport },
                  { icon: <Clock size={16} />, label: "Timing", value: `${selectedBooking.time} on ${new Date(selectedBooking.date).toLocaleDateString()}` },
                  { icon: <IndianRupee size={16} />, label: "Revenue", value: `₹${selectedBooking.amount}` },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 16 }}>
                     <div style={{ color: "#00d4ff", marginTop: 2 }}>{item.icon}</div>
                     <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{item.value || "N/A"}</div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Manual Booking Modal */}
      {showManualModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.8)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
           <div className="glass" style={{ width: "100%", maxWidth: 540, borderRadius: 32, padding: 40, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                 <h2 style={{ fontSize: 24, fontWeight: 900 }}>Create Manual Booking</h2>
                 <button onClick={() => setShowManualModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={24} /></button>
              </div>
              
              <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                 <div className="input-group"><label>Customer Name</label><input required value={manualForm.customerName} onChange={e => setManualForm({...manualForm, customerName: e.target.value})} className="input-field" /></div>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="input-group"><label>Phone</label><input required value={manualForm.customerPhone} onChange={e => setManualForm({...manualForm, customerPhone: e.target.value})} className="input-field" /></div>
                    <div className="input-group"><label>Email</label><input required value={manualForm.customerEmail} onChange={e => setManualForm({...manualForm, customerEmail: e.target.value})} className="input-field" /></div>
                 </div>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="input-group"><label>Sport</label><input required value={manualForm.sportName} onChange={e => setManualForm({...manualForm, sportName: e.target.value})} className="input-field" /></div>
                    <div className="input-group"><label>Amount (₹)</label><input required type="number" value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} className="input-field" /></div>
                 </div>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="input-group"><label>Date</label><input type="date" required value={manualForm.date} onChange={e => setManualForm({...manualForm, date: e.target.value})} className="input-field" /></div>
                    <div className="input-group"><label>Time Window</label><input required value={manualForm.time} onChange={e => setManualForm({...manualForm, time: e.target.value})} className="input-field" /></div>
                 </div>
                 <button type="submit" className="btn-primary" disabled={processingId === "manual"} style={{ padding: 18, fontSize: 16, fontWeight: 800, borderRadius: 16, marginTop: 12 }}>
                    {processingId === "manual" ? <Loader2 className="animate-spin" /> : "Confirm Manual Booking"}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

// Minimal placeholder component since UserIcon wasn't imported
function UserIcon({ size }: { size: number }) {
  return <User size={size} />;
}
import { User } from "lucide-react";

