"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, any[]>>({});

  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

  // Date Utilities
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      dateObj: d,
      isoDate: `${year}-${month}-${day}`,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      monthStr: d.toLocaleDateString('en-US', { month: 'short' }),
      dayNum: d.getDate()
    };
  });

  const getWeekRangeStr = () => {
    const start = days[0].dateObj;
    const end = days[6].dateObj;
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —“ ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Fetch Bookings
  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(collection(db, "bookings"), where("ownerId", "==", user.uid));
        const snap = await getDocs(q);
        
        const newEvents: Record<string, any[]> = {};
        
        snap.forEach(doc => {
          const b = doc.data();
          if (!b.date || !b.time) return;

          const bDateObj = new Date(b.date);
          const bYear = bDateObj.getFullYear();
          const bMonth = String(bDateObj.getMonth() + 1).padStart(2, '0');
          const bDay = String(bDateObj.getDate()).padStart(2, '0');
          const cleanDate = `${bYear}-${bMonth}-${bDay}`;

          const startHourStr = b.time.split("-")[0].split(":")[0];
          const startHour = parseInt(startHourStr, 10);
          
          if (!isNaN(startHour)) {
            const key = `${cleanDate}-${startHour}`;
            
            let color = "#00d4ff"; // Default Indigo
            if (b.sportName?.toLowerCase().includes("cricket")) color = "#00ff88"; // Green
            if (b.sportName?.toLowerCase().includes("badminton")) color = "#ec4899"; // Pink
            
            if (!newEvents[key]) newEvents[key] = [];
            newEvents[key].push({
              id: doc.id,
              label: `${b.customerName || "Walk-in"} • ${b.sportName || b.sport || "Arena"}`,
              color: color,
              status: b.status,
              fullData: b
            });
          }
        });

        setEvents(newEvents);
      } catch (err) {
        console.error("Fetch Calendar Error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBookings();
  }, [user]);

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "-1px", marginBottom: 6 }}>Booking Schedule</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Real-time weekly grid of all verified and pending reservations.</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(15,23,42,0.6)", border: "1px solid var(--border)", borderRadius: 16, padding: 6 }}>
          <button onClick={prevWeek} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 8, borderRadius: 10 }} className="btn-hover">
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 800, padding: "0 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarIcon size={16} color="#00d4ff" /> {getWeekRangeStr()}
          </span>
          <button onClick={nextWeek} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 8, borderRadius: 10 }} className="btn-hover">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 24, overflow: "hidden", border: "1px solid var(--border)" }}>
        {loading ? (
          <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
             <Loader2 className="animate-spin" size={32} color="#00d4ff" />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(15,23,42,0.8)" }}>
                  <th style={{ width: 80, padding: "20px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Time</th>
                  {days.map(d => {
                    const isToday = d.isoDate === todayStr;
                    return (
                      <th key={d.isoDate} style={{ padding: "16px 12px", fontSize: 13, fontWeight: 800, color: isToday ? "#00d4ff" : "var(--text-secondary)", textAlign: "center", borderLeft: "1px solid var(--border)", background: isToday ? "rgba(0,212,255,0.06)" : "transparent" }}>
                        <div style={{ lineHeight: 1.4 }}>
                           <div style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: isToday ? "#00d4ff" : "var(--text-muted)" }}>{d.dayName}</div>
                           <div style={{ fontSize: 18, fontWeight: 900 }}>{d.dayNum}</div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {hours.map(h => (
                  <tr key={h} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", height: 72 }}>
                    <td style={{ padding: "0 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", verticalAlign: "top", paddingTop: 12, whiteSpace: "nowrap" }}>
                      {h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`}
                    </td>
                    {days.map(d => {
                      const key = `${d.isoDate}-${h}`;
                      const slotEvents = events[key] || [];
                      const isToday = d.isoDate === todayStr;

                      return (
                        <td key={d.isoDate} style={{ padding: 6, verticalAlign: "top", borderLeft: "1px solid rgba(255,255,255,0.04)", background: isToday ? "rgba(0,212,255,0.02)" : "transparent", width: "13%" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                             {slotEvents.map(ev => (
                               <div key={ev.id} title={ev.label} style={{ background: ev.status === "confirmed" ? `${ev.color}15` : "rgba(245,158,11,0.1)", borderLeft: `3px solid ${ev.status === "confirmed" ? ev.color : "#f59e0b"}`, borderRadius: "4px 8px 8px 4px", padding: "8px 10px", fontSize: 11, fontWeight: 700, color: ev.status === "confirmed" ? ev.color : "#f59e0b", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "0.2s" }} className="hover:opacity-80">
                                 {ev.status === "pending_verification" && <span style={{ fontSize: 10, marginRight: 4 }}>⏳</span>}
                                 {ev.label}
                               </div>
                             ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .btn-hover:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>
    </div>
  );
}

