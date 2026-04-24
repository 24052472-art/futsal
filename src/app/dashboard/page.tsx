"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { TrendingUp, Calendar, CreditCard, Users, ArrowUpRight, Clock, CheckCircle2, XCircle, AlertCircle, ShieldCheck, Zap, Globe, IndianRupee, RefreshCcw, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- Admin Overview (Platform Level) ---
const AdminOverview = () => {
  const [stats, setStats] = useState({ users: 0, revenue: 0, arenas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const userSnap = await getDocs(collection(db, "users"));
        const users = userSnap.docs.map(d => d.data());
        const totalRev = users.filter((u: any) => u.paymentStatus === "verified").length * 1499;
        
        setStats({
          users: userSnap.size,
          revenue: totalRev,
          arenas: users.filter((u: any) => u.role === "owner").length
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  const adminStats = [
    { label: "Platform Revenue", value: `₹${stats.revenue.toLocaleString()}`, change: "+15%", icon: <IndianRupee size={22} />, color: "#00ff88", bg: "rgba(16,185,129,0.1)" },
    { label: "Total Partners", value: stats.arenas.toString(), change: "+4", icon: <Globe size={22} />, color: "#00d4ff", bg: "rgba(0,212,255,0.1)" },
    { label: "System Users", value: stats.users.toString(), change: "+12%", icon: <Users size={22} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Enterprise Load", value: "Optimal", change: "Live", icon: <ShieldCheck size={22} />, color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  ];

  if (loading) return <div style={{ height: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" color="#00d4ff" /></div>;

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "-1px" }}>Enterprise Command Center</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Global platform overview and partner analytics.</p>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 24, marginBottom: 40 }}>
        {adminStats.map(s => (
          <div key={s.label} className="glass glass-hover" style={{ borderRadius: 24, padding: 28, border: "1px solid var(--border)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4, letterSpacing: "-1px" }}>{s.value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ borderRadius: 32, padding: 40, textAlign: "center", border: "1px solid rgba(0,212,255,0.1)", background: "linear-gradient(135deg, rgba(0,212,255,0.05), transparent)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Management Shortcut</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>You have full access to verify and manage all arena partners.</p>
        <Link href="/dashboard/customers" className="btn-primary" style={{ padding: "14px 32px", borderRadius: 16, textDecoration: "none", display: "inline-block", fontWeight: 800 }}>
          Go to Partner Directory
        </Link>
      </div>
    </div>
  );
};

// --- Arena Overview (Owner Level) ---
const ArenaOverview = ({ user }: { user: any }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    todayRevenue: 0,
    totalBookings: 0,
    occupancy: 0,
    activeCustomers: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      try {
        // Remove orderBy from query to avoid missing index errors on new accounts
        const q = query(collection(db, "bookings"), where("ownerId", "==", user.uid));
        const snap = await getDocs(q);
        
        // Sort in-memory instead
        const allBookings = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

        // 1. Calculate Today's Revenue & Stats
        const todayStr = new Date().toLocaleDateString();
        let todayRev = 0;
        const customerSet = new Set();
        
        allBookings.forEach((b: any) => {
          const bDate = b.createdAt?.toDate?.()?.toLocaleDateString() || "";
          if (bDate === todayStr) {
             todayRev += Number(b.amount || 0);
          }
          if (b.customerEmail || b.email) customerSet.add(b.customerEmail || b.email);
        });

        setSummary({
          todayRevenue: todayRev,
          totalBookings: allBookings.length,
          occupancy: Math.min(100, Math.round((allBookings.length / 50) * 100)),
          activeCustomers: customerSet.size
        });

        // 2. Format Chart Data (Last 7 Days)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyData = days.map(day => {
          const rev = allBookings
            .filter((b: any) => {
              try {
                return b.createdAt?.toDate?.()?.toLocaleDateString('en-US', { weekday: 'short' }) === day;
              } catch { return false; }
            })
            .reduce((sum, b: any) => sum + Number(b.amount || 0), 0);
          return { day, revenue: rev };
        });
        setChartData(weeklyData);

        // 3. Recent Bookings
        setRecentBookings(allBookings.slice(0, 5));

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [user]);

  const statsCards = [
    { label: "Today's Revenue", value: `₹${summary.todayRevenue.toLocaleString()}`, change: "+12%", icon: <IndianRupee size={22} />, color: "#00ff88", bg: "rgba(16,185,129,0.1)" },
    { label: "Total Bookings", value: summary.totalBookings.toString(), change: "+8%", icon: <Calendar size={22} />, color: "#00d4ff", bg: "rgba(0,212,255,0.1)" },
    { label: "Occupancy Rate", value: `${summary.occupancy}%`, change: "+5%", icon: <TrendingUp size={22} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Active Customers", value: summary.activeCustomers.toString(), change: "+23%", icon: <Users size={22} />, color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  ];

  if (!user) return <div style={{ padding: 40, textAlign: "center" }}>Identifying account...</div>;

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" size={32} color="#00d4ff" />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 900 }}>Welcome back, {user?.displayName?.split(" ")[0] || "Partner"} 👋</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Real-time business performance for your arena.</p>
        </div>
        <Link href="/dashboard/bookings" className="btn-primary" style={{ padding: "12px 24px", fontSize: 14, fontWeight: 800, borderRadius: 14, textDecoration: "none" }}>+ Manual Booking</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20, marginBottom: 32 }}>
        {statsCards.map(s => (
          <div key={s.label} className="glass glass-hover" style={{ borderRadius: 20, padding: 24, border: "1px solid var(--border)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1px" }}>{s.value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, marginBottom: 32 }}>
        <div className="glass" style={{ borderRadius: 24, padding: 32, border: "1px solid var(--border)", minHeight: 350 }}>
           <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Weekly Revenue Growth</h2>
           {chartData.length > 0 ? (
             <div style={{ width: "100%", height: 250 }}>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                           <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} />
                     <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                     <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12 }} />
                     <Area type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={3} fill="url(#colorRev)" />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
               No revenue data to display yet.
             </div>
           )}
        </div>

        <div className="glass" style={{ borderRadius: 24, padding: 32 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Recent Activity</h2>
              <Link href="/dashboard/bookings" style={{ fontSize: 12, color: "#00d4ff", fontWeight: 700 }}>VIEW ALL</Link>
           </div>
           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {recentBookings.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No bookings yet.</div>
              ) : recentBookings.map((b: any) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                   <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#00d4ff" }}>{ (b.customerName || "?")[0] }</div>
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{b.customerName || "Walk-in"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.sportName} • {b.time}</div>
                   </div>
                   <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#00ff88" }}>₹{b.amount}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{b.status}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  if (loading) return <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ paddingBottom: 40, animation: "fadeIn 0.5s ease-out" }}>
      {role === "admin" ? (
        <AdminOverview />
      ) : (
        <ArenaOverview user={user} />
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

