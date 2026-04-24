"use client";
import { useState, useEffect, use } from "react";
import { MapPin, Phone, Star, Clock, ChevronRight, Check, ArrowLeft, Loader2, Calendar, Trophy, Users, ShieldCheck, Zap, ArrowRight, Share2, Globe, QrCode, Upload, X, Landmark, Wallet } from "lucide-react";
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ArenaPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const slug = params.slug;
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSport, setSelectedSport] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "khalti" | "bank">("esewa");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  const basePrice = selectedSlot?.price || 0;
  const discountAmount = appliedCoupon ? (appliedCoupon.type === "flat" ? appliedCoupon.value : (basePrice * appliedCoupon.value / 100)) : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponError("");
    
    // Check mock coupons first (to bypass potential Firestore permission rules for public guests)
    const mockCoupons = [{ code: "FIRST50", type: "flat", value: 50 }, { code: "WEEKEND20", type: "percent", value: 20 }];
    const mock = mockCoupons.find(m => m.code === couponCode.toUpperCase());
    if (mock) {
       setAppliedCoupon(mock);
       return;
    }

    try {
      const q = query(collection(db, "coupons"), where("code", "==", couponCode.toUpperCase()), where("ownerId", "==", ownerData?.uid || ""));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const c = snap.docs[0].data();
        if (!c.active) return setCouponError("Coupon is inactive.");
        setAppliedCoupon(c);
      } else {
        setCouponError("Invalid coupon code.");
      }
    } catch (err) { 
      console.error("Coupon DB Error:", err);
      setCouponError("Invalid coupon code."); 
    }
  };

  useEffect(() => {
    const fetchArenaAndOwner = async () => {
      try {
        // 1. Find the owner who has this slug (Search in 'users' collection)
        const ownerQuery = query(collection(db, "users"), where("arenaSlug", "==", slug));
        const ownerSnap = await getDocs(ownerQuery);
        
        let targetOwnerId = "";
        if (!ownerSnap.empty) {
          const oData = ownerSnap.docs[0].data();
          targetOwnerId = ownerSnap.docs[0].id;
          setOwnerData({ ...oData, uid: targetOwnerId });
        } else {
          // Fallback: slug might be a raw UID (for owners who haven't set a custom slug)
          try {
            const uidDoc = await getDoc(doc(db, "users", slug));
            if (uidDoc.exists()) {
              targetOwnerId = slug;
              setOwnerData({ ...uidDoc.data(), uid: slug });
            } else {
              console.warn("No owner found for slug:", slug);
            }
          } catch { console.warn("No owner found for slug:", slug); }
        }

        // 2. Fetch categories specifically for this owner
        const q = targetOwnerId 
          ? query(collection(db, "categories"), where("ownerId", "==", targetOwnerId))
          : query(collection(db, "categories")); // Fallback to all if owner not found (not ideal for prod)
          
        const catSnap = await getDocs(q);
        const cats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        if (cats.length > 0) setSelectedSport(cats[0]);

      } catch (err) { 
        console.error("Fetch Arena Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchArenaAndOwner();
  }, [slug]);

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedSport || !preview) {
      if (!preview) alert("Please upload your payment receipt first.");
      return;
    }
    
    setBookingLoading(true);
    try {
      await addDoc(collection(db, "bookings"), {
        arenaSlug: slug,
        ownerId: selectedSport.ownerId || ownerData?.uid || "",
        sportName: selectedSport.name,
        sportEmoji: selectedSport.emoji,
        date: dates[selectedDate].toISOString(),
        time: selectedSlot.time,
        amount: finalPrice,
        originalAmount: basePrice,
        couponUsed: appliedCoupon ? appliedCoupon.code : null,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        receiptUrl: preview,
        paymentMethod: paymentMethod,
        status: "pending_verification",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send email notification to owner
      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownerEmail: ownerData?.email || ownerData?.customerEmail || "owner@example.com",
            customerName: form.name,
            date: dates[selectedDate].toISOString(),
            time: selectedSlot.time,
            amount: finalPrice,
            sportName: selectedSport.name
          })
        });
      } catch (emailErr) {
        console.error("Failed to send email notification", emailErr);
      }

      setConfirmed(true);
    } catch (err) {
      console.error("Booking Error:", err);
      alert("Failed to secure slot. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const getActiveQR = () => {
    if (!ownerData) return null;
    if (paymentMethod === "esewa") return ownerData.qrEsewa;
    if (paymentMethod === "khalti") return ownerData.qrKhalti;
    if (paymentMethod === "bank") return ownerData.qrBank;
    return null;
  };

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Loader2 className="animate-spin" size={40} color="#00d4ff" />
        <div style={{ fontWeight: 800, letterSpacing: "2px", color: "#00d4ff", fontSize: 12 }}>IMMERSIVE LOADING...</div>
      </div>
    </div>
  );

  if (confirmed) return (
    <div style={{ height: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="glass" style={{ maxWidth: 500, width: "100%", padding: 40, borderRadius: 32, textAlign: "center", border: "1px solid rgba(0,255,136,0.2)" }}>
         <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,255,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "1px solid #00ff88" }}>
            <Check size={40} color="#00ff88" />
         </div>
         <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Reserved! 🎉</h2>
         <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>Your spot is reserved. Please wait for the arena owner to verify your payment. We've sent a ticket to your email.</p>
         <button onClick={() => window.location.reload()} className="btn-primary" style={{ width: "100%", padding: 16, borderRadius: 16, fontWeight: 800, background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617", border: "none" }}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="full-experience">
      <aside className="brand-side">
         <div className="brand-overlay" />
         <div className="brand-content">
            <div className="brand-logo">
               <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "contain" }} />
               <span>GameHaru</span>
            </div>
            <div className="venue-card">
               <div className="venue-header">
                  <span className="venue-badge">Premier Partner</span>
                  <div className="venue-rating"><Star size={12} fill="#f59e0b" color="#f59e0b" /> 4.9 (240 reviews)</div>
               </div>
               <h1 className="venue-name" style={{ overflowWrap: "break-word", wordBreak: "break-word", fontSize: (ownerData?.arenaName || ownerData?.displayName || slug).length > 20 ? 24 : 36 }}>
                  {ownerData?.arenaName || ownerData?.displayName || slug.replace(/-/g, " ").toUpperCase()}
               </h1>
               <p className="venue-desc">{ownerData?.description || "World-class facility with professional turf, night lighting, and premium amenities."}</p>
               <div className="venue-footer">
                  <div className="footer-item"><MapPin size={14} /> {ownerData?.address || "Location Specified"}</div>
                  <div className="footer-item"><Phone size={14} /> {ownerData?.phone || "+977 98..."}</div>
               </div>
            </div>
            <div className="social-links">
               <Share2 size={20} style={{ cursor: "pointer" }} />
               <Globe size={20} style={{ cursor: "pointer" }} />
            </div>
         </div>
      </aside>

      <main className="interaction-side">
         <div className="step-progress">
            {[ { n: 1, label: "Game & Date" }, { n: 2, label: "Choose Timing" }, { n: 3, label: "Pay & Confirm" } ].map((s, i) => (
              <div key={s.n} className={`step-item ${step >= s.n ? 'active' : ''}`}>
                 <div className="step-circle">{step > s.n ? <Check size={14} /> : s.n}</div>
                 <span className="step-label">{s.label}</span>
                 {i < 2 && <div className="step-line" />}
              </div>
            ))}
         </div>

         <div className="interaction-content">
            {step === 1 && (
              <section className="animate-in">
                 <h2 className="step-heading">What are we playing today?</h2>
                 {categories.length === 0 ? (
                   <div style={{ padding: 40, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px dashed rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize: 40, marginBottom: 16 }}>🏟️</div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Sports Listed</h3>
                      <p style={{ color: "#64748b", fontSize: 14 }}>The arena owner hasn't added any sports categories yet.</p>
                   </div>
                 ) : (
                   <div className="category-grid">
                      {categories.map(sport => (
                        <div key={sport.id} onClick={() => setSelectedSport(sport)} className={`category-card ${selectedSport?.id === sport.id ? 'active' : ''}`}>
                           <div className="category-emoji">{sport.emoji}</div>
                           <div className="category-info">
                              <div className="category-name">{sport.name}</div>
                              <div className="category-meta">{sport.maxPlayers} Players Max • Professional</div>
                           </div>
                           {selectedSport?.id === sport.id && <div className="check-mark"><Check size={12} strokeWidth={4} /></div>}
                        </div>
                      ))}
                   </div>
                 )}
                 <h2 className="step-heading" style={{ marginTop: categories.length > 0 ? 0 : 40 }}>Pick your date</h2>
                 <div className="calendar-grid">
                    {dates.map((d, i) => (
                      <div key={i} onClick={() => setSelectedDate(i)} className={`calendar-card ${selectedDate === i ? 'active' : ''}`}>
                         <div className="cal-day">{d.toLocaleDateString("en-IN", { weekday: "short" })}</div>
                         <div className="cal-num">{d.getDate()}</div>
                         <div className="cal-month">{d.toLocaleDateString("en-IN", { month: "short" })}</div>
                      </div>
                    ))}
                 </div>
              </section>
            )}

            {step === 2 && (
              <section className="animate-in">
                 <div className="back-link" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back to selection</div>
                 <h2 className="step-heading">Available Time Windows</h2>
                 <div className="slot-grid-large">
                    {(selectedSport?.slots || []).map((slot: any) => (
                      <div key={slot.id} onClick={() => setSelectedSlot(slot)} className={`slot-card-large ${selectedSlot?.id === slot.id ? 'active' : ''}`}>
                         <div className="slot-time-large">{slot.time}</div>
                         <div className="slot-price-large">₹{slot.price}</div>
                         <div className="slot-status">Available</div>
                      </div>
                    ))}
                 </div>
              </section>
            )}

            {step === 3 && (
              <section className="animate-in" style={{ paddingBottom: 100 }}>
                 <div className="back-link" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back to timings</div>
                 <h2 className="step-heading">Pay & Secure Slot</h2>
                 
                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, marginBottom: 40 }}>
                    <div className="glass" style={{ padding: 24, borderRadius: 24, border: "1px solid rgba(99,102,241,0.2)" }}>
                       <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 12 }}>
                          {[
                            { id: "esewa", icon: <Wallet size={14} />, label: "eSewa" },
                            { id: "khalti", icon: <Zap size={14} />, label: "Khalti" },
                            { id: "bank", icon: <Landmark size={14} />, label: "Bank" }
                          ].map(m => (
                            <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: paymentMethod === m.id ? "#6366f1" : "transparent", color: paymentMethod === m.id ? "white" : "#64748b", transition: "0.2s" }}>
                               {m.icon} {m.label}
                            </button>
                          ))}
                       </div>
                       <div style={{ textAlign: "center" }}>
                          {getActiveQR() ? (
                            <div style={{ width: 180, height: 180, background: "white", margin: "0 auto 16px", padding: 12, borderRadius: 16 }}>
                               <img src={getActiveQR()} alt="QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            </div>
                          ) : (
                            <div style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", gap: 12 }}>
                               <QrCode size={48} opacity={0.2} />
                               <div style={{ fontSize: 12, fontWeight: 600 }}>{paymentMethod.toUpperCase()} QR Not Added</div>
                            </div>
                          )}
                          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                             Scan and pay 
                             {appliedCoupon && <span style={{ textDecoration: "line-through", color: "#ef4444", fontSize: 11 }}>₹{basePrice}</span>}
                             <span style={{ color: appliedCoupon ? "#10b981" : "inherit", fontSize: appliedCoupon ? 14 : 12, fontWeight: appliedCoupon ? 800 : 600 }}>₹{finalPrice}</span>
                          </div>
                       </div>
                    </div>

                    <div className="glass" style={{ padding: 24, borderRadius: 24, border: preview ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.05)" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: preview ? "#10b981" : "#64748b" }}>
                          <Upload size={20} /> <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>Upload Receipt</span>
                       </div>
                       {preview ? (
                         <div style={{ position: "relative" }}>
                            <img src={preview} alt="Receipt" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 16 }} />
                            <button onClick={() => { setFile(null); setPreview(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(239,68,68,0.8)", border: "none", borderRadius: "50%", padding: 6, cursor: "pointer" }}>
                               <X size={14} color="white" />
                            </button>
                         </div>
                       ) : (
                         <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 180, border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 16, cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = "#6366f1"} onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>
                            <Upload size={32} color="#64748b" style={{ marginBottom: 12 }} />
                            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Attach Proof</span>
                            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                         </label>
                       )}
                    </div>
                 </div>

                 <form className="booking-form-premium" onSubmit={handleConfirm} style={{ paddingBottom: 100 }}>
                    <div className="input-group"><label>Full Name</label><input placeholder="Enter your full name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                    <div className="input-row">
                       <div className="input-group"><label>Phone Number</label><input placeholder="+977 98..." required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                       <div className="input-group"><label>Email Address</label><input placeholder="you@example.com" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                    </div>
                    
                    <div className="input-group" style={{ marginBottom: 12 }}>
                       <label>Discount Code</label>
                       <div style={{ display: "flex", gap: 8 }}>
                          <input placeholder="e.g. FIRST50" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} disabled={!!appliedCoupon} />
                          <button type="button" onClick={applyCoupon} disabled={!!appliedCoupon || !couponCode} style={{ padding: "0 24px", background: appliedCoupon ? "#10b981" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: appliedCoupon ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: 800, transition: "0.2s" }}>
                             {appliedCoupon ? "Applied" : "Apply"}
                          </button>
                       </div>
                       {couponError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8, fontWeight: 700 }}>{couponError}</div>}
                       {appliedCoupon && (
                          <div style={{ color: "#10b981", fontSize: 12, marginTop: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                             <Check size={14} /> {appliedCoupon.type === "flat" ? `₹${appliedCoupon.value}` : `${appliedCoupon.value}%`} discount applied! 
                             <span onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} style={{ color: "#ef4444", cursor: "pointer", textDecoration: "underline" }}>Remove</span>
                          </div>
                       )}
                    </div>

                    <button type="submit" className="reserve-btn" disabled={bookingLoading || !preview}>
                       {bookingLoading ? <Loader2 className="animate-spin" /> : preview ? (
                         <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                           Submit Reservation — 
                           {appliedCoupon && <span style={{ textDecoration: "line-through", opacity: 0.5, fontSize: 14 }}>₹{basePrice}</span>}
                           <span>₹{finalPrice}</span>
                         </span>
                       ) : "Upload Receipt to Continue"}
                    </button>
                 </form>
              </section>
            )}
         </div>

         {step < 3 && (
           <footer className="compact-summary">
              <div className="summary-left">
                 <div className="summary-thumb">{selectedSport?.emoji}</div>
                 <div className="summary-text">
                    <div className="s-name">{selectedSport?.name}</div>
                    <div className="s-date">{dates[selectedDate].toLocaleDateString("en-IN", { day: "2-digit", month: "long" })} • {selectedSlot?.time || "Timing Not Selected"}</div>
                 </div>
              </div>
              <div className="summary-right">
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    {appliedCoupon && <div style={{ fontSize: 12, color: "#64748b", textDecoration: "line-through", fontWeight: 700 }}>₹{basePrice}</div>}
                    <div className="s-price">₹{step === 3 ? finalPrice : basePrice}</div>
                 </div>
                 <button className="s-btn" onClick={() => { if(step===1 && selectedSport) setStep(2); if(step===2 && selectedSlot) setStep(3); }} disabled={(step===1 && !selectedSport) || (step===2 && !selectedSlot)}>
                    {step === 1 ? "Choose Time" : "Confirm Booking"} <ChevronRight size={18} />
                 </button>
              </div>
           </footer>
         )}
      </main>

      <style>{`
        .full-experience { height: 100vh; display: grid; grid-template-columns: 420px 1fr; background: #020617; color: white; font-family: 'Inter', sans-serif; overflow: hidden; }
        @media (max-width: 1100px) { .full-experience { grid-template-columns: 320px 1fr; } }
        @media (max-width: 900px) { .brand-side { display: none; } .full-experience { grid-template-columns: 1fr; overflow: auto; height: auto; min-height: 100vh; } }
        .brand-side { position: relative; background: url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000') center/cover; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.05); }
        .brand-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(2,6,23,0.4), #020617); }
        .brand-content { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
        .brand-logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 900; letter-spacing: -1px; }
        .venue-card { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(20px); padding: 32px; border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); }
        .venue-badge { background: rgba(99,102,241,0.2); color: #818cf8; padding: 4px 12px; border-radius: 100px; fontSize: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; display: inline-block; }
        .venue-rating { font-size: 13px; font-weight: 700; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .venue-name { font-family: 'Outfit', sans-serif; font-size: 36px; font-weight: 900; margin: 0 0 16px; letter-spacing: -1.5px; }
        .venue-desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .venue-footer { display: flex; flex-direction: column; gap: 8px; }
        .footer-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #64748b; }
        .social-links { display: flex; gap: 20px; color: #64748b; }
        .interaction-side { display: flex; flex-direction: column; position: relative; height: 100vh; }
        .step-progress { padding: 24px 64px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(10px); flex-shrink: 0; }
        .step-item { display: flex; align-items: center; gap: 12px; position: relative; }
        .step-circle { width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); display: flex; alignItems: center; justifyContent: center; fontSize: 12px; fontWeight: 800; color: #64748b; transition: 0.3s; }
        .step-label { font-size: 14px; font-weight: 700; color: #64748b; }
        .step-item.active .step-circle { background: #6366f1; border-color: #6366f1; color: white; box-shadow: 0 0 15px rgba(99,102,241,0.4); }
        .step-item.active .step-label { color: white; }
        .step-line { width: 60px; height: 2px; background: rgba(255,255,255,0.05); margin-left: 10px; }
        .step-item.active .step-line { background: #6366f1; }
        .interaction-content { flex: 1; padding: 48px 64px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.3) transparent; }
        .interaction-content::-webkit-scrollbar { width: 6px; }
        .interaction-content::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 10px; }
        @media (max-width: 600px) { .step-progress { padding: 16px 24px; } .interaction-content { padding: 32px 24px; } .step-line { display: none; } }
        .step-heading { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 900; margin-bottom: 32px; letter-spacing: -1px; }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 48px; }
        .category-card { padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: 0.3s; position: relative; }
        .category-card.active { background: rgba(99,102,241,0.08); border-color: #6366f1; transform: scale(1.02); }
        .category-emoji { font-size: 40px; }
        .category-name { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
        .category-meta { font-size: 12px; color: #64748b; }
        .check-mark { position: absolute; top: 16px; right: 16px; width: 20px; height: 20px; background: #6366f1; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; }
        .calendar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 12px; }
        .calendar-card { padding: 16px 0; text-align: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; cursor: pointer; transition: 0.2s; }
        .calendar-card.active { background: #00d4ff; border-color: #00d4ff; transform: translateY(-4px); color: #020617; }
        .cal-day { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
        .cal-num { font-size: 24px; font-weight: 900; margin-bottom: 2px; }
        .cal-month { font-size: 10px; color: #64748b; font-weight: 700; }
        .calendar-card.active .cal-day, .calendar-card.active .cal-month { color: rgba(2,6,23,0.7); }
        .slot-grid-large { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .slot-card-large { padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; text-align: center; cursor: pointer; transition: 0.3s; }
        .slot-card-large.active { background: #00d4ff; border-color: #00d4ff; transform: scale(1.05); color: #020617; }
        .slot-time-large { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
        .slot-price-large { font-size: 18px; font-weight: 900; color: #00ff88; margin-bottom: 8px; }
        .slot-card-large.active .slot-price-large { color: #020617; }
        .slot-status { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
        .booking-form-premium { display: flex; flex-direction: column; gap: 24px; max-width: 640px; }
        .input-group label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-group input { width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; border-radius: 16px; color: white; font-size: 16px; outline: none; transition: 0.2s; }
        .input-group input:focus { border-color: #00d4ff; background: rgba(0,212,255,0.05); }
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .payment-notice { display: flex; align-items: center; gap: 12px; padding: 20px; background: rgba(0,255,136,0.05); border-radius: 16px; border: 1px solid rgba(0,255,136,0.1); font-size: 13px; color: #94a3b8; }
        .reserve-btn { background: linear-gradient(135deg, #00d4ff, #00ff88); color: #020617; border: none; padding: 20px; border-radius: 20px; font-size: 18px; font-weight: 800; cursor: pointer; transition: 0.3s; margin-top: 16px; }
        .reserve-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 30px -5px rgba(0,255,136,0.4); }
        .reserve-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .compact-summary { position: sticky; bottom: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.05); padding: 20px 64px; display: flex; justify-content: space-between; align-items: center; z-index: 50; flex-shrink: 0; }
        @media (max-width: 600px) { .compact-summary { padding: 16px 24px; flex-direction: column; gap: 16px; text-align: center; } }
        .summary-left { display: flex; align-items: center; gap: 16px; }
        .summary-thumb { width: 50px; height: 50px; background: rgba(255,255,255,0.05); border-radius: 14px; display: flex; alignItems: center; justifyContent: center; fontSize: 28px; }
        .s-name { font-weight: 800; font-size: 16px; }
        .s-date { font-size: 13px; color: #64748b; font-weight: 600; margin-top: 2px; }
        .summary-right { display: flex; align-items: center; gap: 32px; }
        .s-price { font-size: 28px; font-weight: 900; color: #00ff88; }
        .s-btn { background: linear-gradient(135deg, #00d4ff, #00ff88); color: #020617; border: none; padding: 14px 28px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; alignItems: center; gap: 10px; transition: 0.2s; }
        .s-btn:hover { transform: scale(1.02); box-shadow: 0 5px 15px rgba(0,255,136,0.3); }
        .s-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .back-link { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .animate-in { animation: slideIn 0.5s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
