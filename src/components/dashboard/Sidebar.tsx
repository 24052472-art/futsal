"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Zap, LayoutDashboard, Calendar, BookOpen, Clock,
  CreditCard, BarChart3, Tag, Users, Settings, ChevronRight,
  LogOut, Crown, X, Menu, User, ShieldCheck, IndianRupee
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
  { href: "/dashboard/bookings", icon: BookOpen, label: "Bookings" },
  { href: "/dashboard/slots", icon: Clock, label: "Slot Manager" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Payments" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/customers", icon: Users, label: "Customers" },
  { href: "/dashboard/coupons", icon: Tag, label: "Coupons" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, role, plan } = useAuth();
  const [categoryCount, setCategoryCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snap) => {
      setCategoryCount(snap.size);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Plan Limits & Visibility
  const planConfig = {
    starter: { label: "Starter Plan", limit: 2, color: "#00d4ff", features: ["Overview", "Calendar", "Bookings", "Slot Manager", "Analytics", "Customers", "Settings"] },
    pro: { label: "Pro Plan", limit: 5, color: "#00ff88", features: ["Overview", "Calendar", "Bookings", "Slot Manager", "Payments", "Analytics", "Customers", "Coupons", "Settings"] },
    enterprise: { label: "Enterprise", limit: 999, color: "#f59e0b", features: ["Overview", "Calendar", "Bookings", "Slot Manager", "Payments", "Analytics", "Customers", "Coupons", "Settings"] },
  };

  const currentPlan = planConfig[plan as keyof typeof planConfig] || planConfig.starter;

  return (
    <>
      <aside style={{
        width: collapsed ? 72 : 240,
        minHeight: "100vh",
        background: "rgba(15,23,42,0.98)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {!collapsed && (
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 900, fontSize: 14, fontFamily: "sans-serif", letterSpacing: "-0.5px", flexShrink: 0 }}>
                GH
              </div>
              <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 900, fontSize: 20, color: "white", letterSpacing: "-0.5px" }}>GH<span style={{ color: "#00ff88" }}>os</span></span>
            </Link>
          )}
          {collapsed && <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 900, fontSize: 14, fontFamily: "sans-serif", letterSpacing: "-0.5px" }}>GH</div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}>
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* User Profile Info */}
        {!collapsed && user && (
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: "1.5px solid var(--border)" }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--border)" }}>
                  <User size={20} color="var(--text-muted)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.displayName || user.email?.split("@")[0]}</div>
                <div style={{ fontSize: 11, color: "#00d4ff", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                   {role === "admin" && <ShieldCheck size={10} />} {role === "admin" ? "SUPER ADMIN" : "ARENA OWNER"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {navItems.filter(item => {
            if (role === "admin") {
              return ["Overview", "Analytics", "Customers", "Settings"].includes(item.label);
            }
            // Feature Gating for Owners
            return currentPlan.features.includes(item.label);
          }).map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                background: active ? "rgba(0,212,255,0.1)" : "transparent",
                border: active ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
                color: active ? "#00d4ff" : "var(--text-muted)",
                textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 500,
                transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden",
              }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(148,163,184,0.06)"; (e.currentTarget as HTMLElement).style.color = "white"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; } }}>
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && active && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
              </Link>
            );
          })}

          {role === "admin" && (
            <>
              {!collapsed && <div style={{ padding: "20px 12px 8px", fontSize: 11, fontWeight: 700, color: "#00d4ff", textTransform: "uppercase", letterSpacing: 1 }}>Admin Panel</div>}
              <Link href="/dashboard/admin/pricing" style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                background: pathname === "/dashboard/admin/pricing" ? "rgba(0,212,255,0.1)" : "transparent",
                border: pathname === "/dashboard/admin/pricing" ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
                color: pathname === "/dashboard/admin/pricing" ? "#00d4ff" : "var(--text-muted)",
                textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "all 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = pathname === "/dashboard/admin/pricing" ? "#00d4ff" : "var(--text-muted)")}>
                <IndianRupee size={18} />
                {!collapsed && <span>Pricing Manager</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Plan badge */}
        {!collapsed && role !== "admin" && (
          <div style={{ margin: "0 8px 8px", padding: "14px 16px", borderRadius: 12, background: `linear-gradient(135deg, ${currentPlan.color}15, ${currentPlan.color}08)`, border: `1px solid ${currentPlan.color}25` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Crown size={15} color={currentPlan.color} />
              <span style={{ fontWeight: 700, fontSize: 13, color: currentPlan.color }}>{currentPlan.label}</span>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 10 }}>
              {categoryCount}/{plan === "enterprise" ? "∞" : currentPlan.limit} categories used
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${Math.min((categoryCount / currentPlan.limit) * 100, 100)}%`, borderRadius: 2, background: `linear-gradient(90deg, #00d4ff, ${currentPlan.color})` }} />
            </div>
            {plan !== "enterprise" && (
              <Link href="/dashboard/settings" style={{ display: "block", textAlign: "center", padding: "7px", borderRadius: 8, background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>
                Upgrade Now
              </Link>
            )}
          </div>
        )}

        {/* Logout */}
        <div style={{ padding: "8px 8px 16px" }}>
          <button onClick={handleLogout} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, color: "var(--text-muted)", textDecoration: "none", fontSize: 14, transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
