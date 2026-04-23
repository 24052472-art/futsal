"use client";
import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Crown, X, Clock, Check, Save } from "lucide-react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import Link from "next/link";

export default function SlotsPage() {
  const { plan, user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<any>(null);
  const [newSlot, setNewSlot] = useState({ time: "", price: "" });

  const planLimits = { starter: 2, pro: 5, enterprise: 999 };
  const limit = planLimits[plan as keyof typeof planLimits] || 2;
  const isOverLimit = categories.length >= limit;

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const cats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
      if (cats.length > 0 && !selectedCat) setSelectedCat(cats[0]);
      else if (selectedCat) {
        const updated = cats.find(c => c.id === selectedCat.id);
        if (updated) setSelectedCat(updated);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedCat]);

  const addCategory = async () => {
    if (isOverLimit || !user) return;
    try {
      await addDoc(collection(db, "categories"), {
        name: "New Category",
        emoji: "ðŸŽ®",
        slots: [],
        maxPlayers: 10,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (err) { console.error(err); }
  };

  const updateCategory = async () => {
    try {
      await updateDoc(doc(db, "categories", editModal.id), {
        name: editModal.name,
        emoji: editModal.emoji,
        maxPlayers: Number(editModal.maxPlayers),
        updatedAt: serverTimestamp()
      });
      setEditModal(null);
    } catch (err) { console.error(err); }
  };

  const removeCategory = async (id: string) => {
    if (confirm("Delete this category and all its slots?")) {
      await deleteDoc(doc(db, "categories", id));
      if (selectedCat?.id === id) setSelectedCat(null);
    }
  };

  const addSlot = async () => {
    if (!newSlot.time || !newSlot.price || !selectedCat) return;
    try {
      await updateDoc(doc(db, "categories", selectedCat.id), {
        slots: arrayUnion({ ...newSlot, id: Date.now().toString() }),
        updatedAt: serverTimestamp()
      });
      setNewSlot({ time: "", price: "" });
    } catch (err) { console.error(err); }
  };

  const removeSlot = async (slot: any) => {
    try {
      await updateDoc(doc(db, "categories", selectedCat.id), {
        slots: arrayRemove(slot),
        updatedAt: serverTimestamp()
      });
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading slot engine...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Slot Manager</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Customize games and configure availability.</p>
        </div>
      </div>

      <h2 style={{ fontFamily: "Outfit,sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Game Categories</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16, marginBottom: 40 }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setSelectedCat(cat)} className="glass glass-hover" style={{ borderRadius: 18, padding: 20, border: selectedCat?.id === cat.id ? "2px solid #00d4ff" : "1px solid var(--border)", cursor: "pointer", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{cat.emoji}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={(e) => { e.stopPropagation(); setEditModal(cat); }} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "white" }}><Edit3 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); }} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#ef4444" }}><Trash2 size={14} /></button>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{cat.name}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{cat.slots?.length || 0} slots Â· {cat.maxPlayers || 0} players</div>
          </div>
        ))}
        
        {!isOverLimit && (
          <button onClick={addCategory} className="glass" style={{ borderRadius: 18, padding: 20, border: "1.5px dashed var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", background: "transparent", color: "var(--text-muted)", minHeight: 120 }}>
            <Plus size={24} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>New Category</span>
          </button>
        )}
      </div>

      {selectedCat ? (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "Outfit,sans-serif", fontSize: 18, fontWeight: 700 }}>Time Slots: {selectedCat.name}</h2>
            <div style={{ display: "flex", gap: 12 }}>
               <input type="text" placeholder="e.g. 6:00 AM - 7:00 AM" className="input-field" style={{ width: 220, padding: "8px 12px", fontSize: 13 }} value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} />
               <input type="number" placeholder="Price (â‚¹)" className="input-field" style={{ width: 100, padding: "8px 12px", fontSize: 13 }} value={newSlot.price} onChange={e => setNewSlot({...newSlot, price: e.target.value})} />
               <button onClick={addSlot} className="btn-primary" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                 <Plus size={14} /> Add Slot
               </button>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 20, overflow: "hidden" }}>
             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
                 <tr>
                   <th style={{ textAlign: "left", padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Time Range</th>
                   <th style={{ textAlign: "left", padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Price</th>
                   <th style={{ textAlign: "left", padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                   <th style={{ textAlign: "right", padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {(selectedCat.slots || []).length === 0 ? (
                   <tr>
                     <td colSpan={4} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No slots added yet for this category.</td>
                   </tr>
                 ) : (
                   selectedCat.slots.map((slot: any) => (
                     <tr key={slot.id} style={{ borderBottom: "1px solid var(--border)" }}>
                       <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 600 }}>{slot.time}</td>
                       <td style={{ padding: "16px 24px", fontSize: 14, color: "#00ff88", fontWeight: 700 }}>â‚¹{slot.price}</td>
                       <td style={{ padding: "16px 24px" }}><span style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(16,185,129,0.1)", color: "#00ff88", fontSize: 11, fontWeight: 700 }}>Available</span></td>
                       <td style={{ padding: "16px 24px", textAlign: "right" }}>
                         <button onClick={() => removeSlot(slot)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}><Trash2 size={16} /></button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 20, padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <Clock size={32} style={{ marginBottom: 16, opacity: 0.5 }} />
          <div>Create or select a category to manage its time slots.</div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div className="glass" style={{ width: "100%", maxWidth: 400, padding: 32, borderRadius: 24, border: "1px solid var(--border)" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <h3 style={{ fontSize: 20, fontWeight: 800 }}>Edit Category</h3>
               <button onClick={() => setEditModal(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>
             </div>
             
             <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>Category Name (e.g. Futsal)</label>
                <input className="input-field" value={editModal.name} onChange={e => setEditModal({...editModal, name: e.target.value})} />
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
               <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>Icon/Emoji</label>
                  <input className="input-field" value={editModal.emoji} onChange={e => setEditModal({...editModal, emoji: e.target.value})} />
               </div>
               <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>Max Players</label>
                  <input type="number" className="input-field" value={editModal.maxPlayers} onChange={e => setEditModal({...editModal, maxPlayers: e.target.value})} />
               </div>
             </div>

             <button onClick={updateCategory} className="btn-primary" style={{ width: "100%", padding: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
               <Save size={18} /> Save Changes
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

