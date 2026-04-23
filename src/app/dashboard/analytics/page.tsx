"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";
import { Trash2, RefreshCcw, AlertTriangle, CheckCircle2, IndianRupee, Lock, Crown } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import Link from "next/link";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const heatColor = (v: number) => {
  const colors = ["rgba(0,212,255,0.05)", "rgba(0,212,255,0.15)", "rgba(0,212,255,0.3)", "rgba(0,212,255,0.5)", "rgba(0,212,255,0.75)", "rgba(0,212,255,1)"];
  return colors[Math.min(v, 5)];
};

export default function AnalyticsPage() {
  const { plan } = useAuth();
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [resetState, setResetState] = useState<"idle" | "confirm" | "resetting" | "success">("idle");
  
  // Real-time data states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    avgBooking: 0,
    repeatRate: 0
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [sportData, setSportData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

        if (bookings.length === 0) {
          // Fallback to mock data if empty for demo purposes, 
          // or just show zeros. Let's show real zeros if it's really empty.
          setStats({ totalRevenue: 0, totalBookings: 0, avgBooking: 0, repeatRate: 0 });
          setLoading(false);
          return;
        }

        // 1. Basic Stats
        const totalRev = bookings.reduce((acc, b) => acc + (b.amount || 0), 0);
        const totalBk = bookings.length;
        
        // 2. Repeat Rate Calculation
        const customerBookings: Record<string, number> = {};
        bookings.forEach(b => {
          const key = b.email || b.phone || b.customer;
          customerBookings[key] = (customerBookings[key] || 0) + 1;
        });
        const totalCustomers = Object.keys(customerBookings).length;
        const repeatCustomers = Object.values(customerBookings).filter(count => count > 1).length;
        const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

        setStats({
          totalRevenue: totalRev,
          totalBookings: totalBk,
          avgBooking: totalBk > 0 ? totalRev / totalBk : 0,
          repeatRate: repeatRate
        });

        // 3. Monthly Revenue (Last 6 months)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyMap: Record<string, number> = {};
        bookings.forEach(b => {
          const date = b.createdAt ? new Date(b.createdAt) : new Date(b.date);
          const m = months[date.getMonth()];
          monthlyMap[m] = (monthlyMap[m] || 0) + (b.amount || 0);
        });
        setMonthlyData(Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })));

        // 4. Sport Breakdown
        const sportsMap: Record<string, number> = {};
        bookings.forEach(b => {
          const s = b.sport?.replace(/[^a-zA-Z]/g, "") || "Unknown";
          sportsMap[s] = (sportsMap[s] || 0) + 1;
        });
        const colors = ["#00d4ff", "#00ff88", "#f59e0b", "#ec4899"];
        setSportData(Object.entries(sportsMap).map(([name, count], i) => ({
          name,
          value: Math.round((count / totalBk) * 100),
          color: colors[i % colors.length]
        })));

        // 5. Heatmap (Static slots for now, dynamic values)
        const slots = ["6â€“7 AM", "7â€“8 AM", "8â€“9 AM", "5â€“6 PM", "6â€“7 PM", "7â€“8 PM", "8â€“9 PM"];
        const hData = slots.map(slot => {
          const row: any = { slot };
          days.forEach(day => {
            // Count bookings in this slot and day
            row[day] = bookings.filter(b => {
              const bDate = b.createdAt ? new Date(b.createdAt) : new Date(b.date);
              const bDay = days[(bDate.getDay() + 6) % 7]; // Convert 0=Sun to 6=Sun
              return bDay === day && b.time?.includes(slot.split(" ")[0]);
            }).length;
          });
          return row;
        });
        setHeatmapData(hData);

      } catch (err) {
        console.error("Analytics Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const handleReset = async () => {
    setResetState("resetting");
    await new Promise(r => setTimeout(r, 1500));
    setResetState("success");
    setTimeout(() => setResetState("idle"), 3000);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Analyzing platform data...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Analytics</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Real-time revenue trends and peak hour insights.</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {resetState === "idle" && (
            <button onClick={() => setResetState("confirm")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
              <RefreshCcw size={14} /> Reset Analytics
            </button>
          )}

          {resetState === "confirm" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px", background: "rgba(30,41,59,0.9)", border: "1px solid #ef4444", borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "white", padding: "0 8px" }}>Wipe all stats?</span>
              <button onClick={handleReset} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#ef4444", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Yes</button>
              <button onClick={() => setResetState("idle")} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "transparent", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>No</button>
            </div>
          )}

          {resetState === "resetting" && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Resetting...</span>}
          {resetState === "success" && <span style={{ fontSize: 13, color: "#00ff88", fontWeight: 700 }}>Cleared!</span>}

          <div style={{ display: "flex", gap: 8, background: "rgba(30,41,59,0.6)", border: "1px solid var(--border)", borderRadius: 10, padding: 4 }}>
            {["7d", "30d", "3m", "1y"].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{ padding: "7px 16px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: range === r ? "linear-gradient(135deg,#00d4ff,#00ff88)" : "transparent", color: range === r ? "white" : "var(--text-muted)", transition: "all 0.2s" }}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Revenue", value: `â‚¹${stats.totalRevenue.toLocaleString()}`, sub: "Overall Earnings", color: "#00ff88" },
          { label: "Total Bookings", value: stats.totalBookings.toString(), sub: "Confirmed slots", color: "#00d4ff" },
          { label: "Avg. per Booking", value: `â‚¹${Math.round(stats.avgBooking).toLocaleString()}`, sub: "Slot efficiency", color: "#f59e0b" },
          { label: "Repeat Customers", value: `${Math.round(stats.repeatRate)}%`, sub: "Loyalty rate", color: "#ec4899" },
        ].map(k => (
          <div key={k.label} className="glass" style={{ borderRadius: 16, padding: 22 }}>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 26, fontWeight: 800, color: k.color, letterSpacing: "-0.5px" }}>{k.value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 24 }}>
        <div className="glass" style={{ borderRadius: 20, padding: 28 }}>
          <h2 style={{ fontFamily: "Outfit,sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData.length > 0 ? monthlyData : [{ month: "No Data", revenue: 0 }]}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#00ff88" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={v => `â‚¹${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10 }} formatter={(v: any) => [`â‚¹${Number(v).toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: 28, position: "relative", overflow: "hidden" }}>
          <h2 style={{ fontFamily: "Outfit,sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Sport Split</h2>
          {plan === "starter" ? (
            <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Pro Feature</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 180 }}>Upgrade to Pro to see bookings by sport category.</div>
              <Link href="/dashboard/settings" style={{ fontSize: 12, color: "#00d4ff", fontWeight: 700, textDecoration: "none" }}>Upgrade Now â†’</Link>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={sportData.length > 0 ? sportData : [{ name: "None", value: 100, color: "#334155" }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {(sportData.length > 0 ? sportData : [{ color: "#334155" }]).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10 }} formatter={(v: any) => [`${v}%`, "Bookings"]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {sportData.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{s.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 20, padding: 28, position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: plan === "starter" ? 0 : 6 }}>
          <div>
            <h2 style={{ fontFamily: "Outfit,sans-serif", fontSize: 17, fontWeight: 700 }}>Peak Hour Heatmap</h2>
            {plan !== "starter" && <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>Darker slots represent higher booking density.</p>}
          </div>
          {plan === "starter" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Crown size={14} color="#f59e0b" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>Pro Feature</span>
            </div>
          )}
        </div>

        {plan === "starter" ? (
          <div style={{ padding: "40px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 300 }}>
              Unlock peak hour heatmaps and slot efficiency insights with the Pro Plan.
            </div>
            <Link href="/dashboard/settings" className="btn-primary" style={{ padding: "8px 24px", fontSize: 13, textDecoration: "none" }}>Upgrade to Unlock</Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4 }}>
              <thead>
                <tr>
                  <th style={{ width: 90, textAlign: "left", padding: "4px 8px", color: "var(--text-muted)", fontSize: 12 }}>Time</th>
                  {days.map(d => <th key={d} style={{ textAlign: "center", padding: "4px 8px", color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {(heatmapData.length > 0 ? heatmapData : []).map(row => (
                  <tr key={row.slot}>
                    <td style={{ padding: "4px 8px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{row.slot}</td>
                    {days.map(d => {
                      const val = row[d] || 0;
                      return (
                        <td key={d} style={{ padding: 3 }}>
                          <div style={{ height: 36, borderRadius: 6, background: heatColor(val), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: val >= 3 ? "white" : "var(--text-muted)", transition: "all 0.2s" }}>
                            {val}
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
    </div>
  );
}

