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
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAdminStats() {
      const userSnap = await getDocs(collection(db, "users"));
      setStats({
        users: userSnap.size,
        revenue: userSnap.size * 1499,
        arenas: userSnap.docs.filter(d => d.data().role === "owner").length
      });
      setRecentUsers(userSnap.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() })));
    }
    fetchAdminStats();
  }, []);

  const adminStats = [
    { label: "Platform Revenue", value: `â‚¹${stats.revenue.toLocaleString()}`, change: "+15%", icon: <IndianRupee size={22} />, color: "#00ff88", bg: "rgba(16,185,129,0.1)" },
    { label: "Arena Partners", value: stats.arenas.toString(), change: "+4", icon: <Globe size={22} />, color: "#00d4ff", bg: "rgba(0,212,255,0.1)" },
    { label: "Total Users", value: stats.users.toString(), change: "+12%", icon: <Users size={22} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Pro Subscriptions", value: Math.floor(stats.arenas * 0.8).toString(), change: "+2", icon: <Zap size={22} />, color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 28 }}>Platform Command Center</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20, marginBottom: 32 }}>
        {adminStats.map(s => (
          <div key={s.label} className="glass" style={{ borderRadius: 20, padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{s.value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
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
        const q = query(collection(db, "bookings"), where("ownerId", "==", user.uid), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const allBookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 1. Calculate Today's Revenue & Stats
        const today = new Date().toISOString().split('T')[0];
        let todayRev = 0;
        const customerSet = new Set();
        
        allBookings.forEach((b: any) => {
          if (b.date && b.date.includes(today)) {
             todayRev += Number(b.amount || 0);
          }
          if (b.customerEmail || b.email) customerSet.add(b.customerEmail || b.email);
        });

        setSummary({
          todayRevenue: todayRev,
          totalBookings: allBookings.length,
          occupancy: Math.min(100, Math.round((allBookings.length / 50) * 100)), // Mock occupancy relative to 50 slots
          activeCustomers: customerSet.size
        });

        // 2. Format Chart Data (Last 7 Days)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyData = days.map(day => {
          const rev = allBookings
            .filter((b: any) => b.createdAt && new Date(b.createdAt.toDate()).toLocaleDateString('en-US', { weekday: 'short' }) === day)
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
    { label: "Today's Revenue", value: `â‚¹${summary.todayRevenue.toLocaleString()}`, change: "+12%", icon: <IndianRupee size={22} />, color: "#00ff88", bg: "rgba(16,185,129,0.1)" },
    { label: "Total Bookings", value: summary.totalBookings.toString(), change: "+8%", icon: <Calendar size={22} />, color: "#00d4ff", bg: "rgba(0,212,255,0.1)" },
    { label: "Occupancy Rate", value: `${summary.occupancy}%`, change: "+5%", icon: <TrendingUp size={22} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Active Customers", value: summary.activeCustomers.toString(), change: "+23%", icon: <Users size={22} />, color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  ];

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" size={32} color="#00d4ff" />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 26, fontWeight: 900 }}>Welcome back, {user?.displayName || "Partner"} ðŸ‘‹</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Real-time business performance for your arena.</p>
        </div>
        <Link href="/dashboard/bookings" className="btn-primary" style={{ padding: "12px 24px", fontSize: 14, fontWeight: 800, borderRadius: 14, textDecoration: "none" }}>+ Manual Booking</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20, marginBottom: 32 }}>
        {statsCards.map(s => (
          <div key={s.label} className="glass glass-hover" style={{ borderRadius: 20, padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{s.value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
        <div className="glass" style={{ borderRadius: 24, padding: 32 }}>
           <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Weekly Revenue Growth</h2>
           <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                 <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                       <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} />
                 <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={v => `â‚¹${v}`} />
                 <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12 }} />
                 <Area type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={3} fill="url(#colorRev)" />
              </AreaChart>
           </ResponsiveContainer>
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
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.sportName} â€¢ {b.time}</div>
                   </div>
                   <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#00ff88" }}>â‚¹{b.amount}</div>
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

