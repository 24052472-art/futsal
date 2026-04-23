"use client";
import { Calendar, CreditCard, BarChart3, Link2, Bell, Users, Shield, Smartphone } from "lucide-react";

const features = [
  { icon: <Calendar size={24} />, title: "Smart Booking Calendar", desc: "Visual calendar with drag-to-create, slot conflict prevention, and real-time availability.", color: "#6366f1" },
  { icon: <CreditCard size={24} />, title: "Integrated Payments", desc: "Accept Razorpay & Khalti payments online. Track cash, partial, and full payments in one place.", color: "#10b981" },
  { icon: <BarChart3 size={24} />, title: "Revenue Analytics", desc: "Daily/monthly revenue charts, peak hour heatmaps, and occupancy rates at a glance.", color: "#f59e0b" },
  { icon: <Link2 size={24} />, title: "Shareable Booking Link", desc: "Every arena gets a unique public URL. Share it on Instagram, WhatsApp, or print it as a QR.", color: "#ec4899" },
  { icon: <Bell size={24} />, title: "Auto Notifications", desc: "Instant email confirmations to customers and booking alerts to arena owners.", color: "#8b5cf6" },
  { icon: <Users size={24} />, title: "Customer CRM", desc: "Auto-build a customer database from every booking. Track repeat customers and booking history.", color: "#06b6d4" },
  { icon: <Shield size={24} />, title: "Double-Booking Shield", desc: "Redis-powered slot locking prevents conflicts during checkout — zero double bookings.", color: "#ef4444" },
  { icon: <Smartphone size={24} />, title: "Mobile Optimized", desc: "Customers book from any device in under 60 seconds. No app download required.", color: "#10b981" },
];

export default function Features() {
  return (
    <section id="features" className="section-pad">
      <div className="container-pad">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ color: "#818cf8", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Features</span>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
            Everything your arena needs,<br />
            <span className="gradient-text">nothing you don't.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, marginTop: 16, maxWidth: 560, margin: "16px auto 0" }}>
            A complete toolkit for sports arena management — built for owners who want to grow, not just survive.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="glass glass-hover" style={{ borderRadius: 18, padding: 28, cursor: "default", transition: "all 0.3s ease" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}35`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: 18 }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "Outfit,sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
