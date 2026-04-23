"use client";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle2, TrendingUp, Calendar, CreditCard } from "lucide-react";

const stats = [
  { value: "200+", label: "Arenas Online" },
  { value: "₹50L+", label: "Bookings Processed" },
  { value: "10 min", label: "Setup Time" },
  { value: "99.9%", label: "Uptime SLA" },
];

const liveBookings = [
  { name: "Rahul S.", sport: "⚽ Futsal", time: "7:00–8:00 AM", amount: "₹600", status: "confirmed" },
  { name: "Priya M.", sport: "🏸 Badminton", time: "9:00–10:00 AM", amount: "₹400", status: "pending" },
  { name: "Amit K.", sport: "🏏 Cricket Net", time: "6:00–7:00 PM", amount: "₹800", status: "confirmed" },
];

export default function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      paddingTop: 80,
    }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.15) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: "20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "-5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)" }} />

      <div className="container-pad" style={{ position: "relative", zIndex: 1, width: "100%", padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", display: "inline-block" }} className="animate-pulse-glow" />
              <span style={{ color: "#00ff88", fontSize: 13, fontWeight: 700, letterSpacing: "0.5px" }}>LEVEL UP YOUR ARENA</span>
            </div>

            <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: "clamp(36px,5vw,62px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 24 }}>
              Your Arena.<br />
              <span className="gradient-text">Online.</span><br />
              In 10 Minutes.
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
              Stop managing bookings via WhatsApp calls. GameHaru gives every sports arena a smart booking system, payment integration, and analytics dashboard — no code required.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
              <Link href="/register" className="btn-primary" style={{ padding: "14px 28px", fontSize: 16, display: "flex", alignItems: "center", gap: 8, textDecoration: "none", borderRadius: 12 }}>
                Start Free Trial — 7 Days <ArrowRight size={18} />
              </Link>
              <button className="btn-outline" style={{ padding: "14px 24px", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Play size={16} fill="currentColor" /> Watch Demo
              </button>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["No credit card required", "Free 7-day trial", "Cancel anytime"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14 }}>
                  <CheckCircle2 size={15} color="#10b981" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview */}
          <div style={{ position: "relative" }} className="animate-float">
            <div className="glass gradient-border" style={{ borderRadius: 20, padding: 24, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
              {/* Mini top bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                <div style={{ flex: 1, background: "rgba(148,163,184,0.1)", borderRadius: 6, height: 24, display: "flex", alignItems: "center", padding: "0 10px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>arena.gameharu.com/green-turf</span>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { icon: <Calendar size={16} />, label: "Today", value: "12 bookings", color: "#00d4ff" },
                  { icon: <CreditCard size={16} />, label: "Revenue", value: "₹8,400", color: "#00ff88" },
                  { icon: <TrendingUp size={16} />, label: "Occupancy", value: "87%", color: "#f59e0b" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ color: s.color, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 10, marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Live bookings */}
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Live Bookings</div>
                {liveBookings.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#020617" }}>
                        {b.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.sport} · {b.time}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#00ff88" }}>{b.amount}</div>
                      <span className={`badge-${b.status}`} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, display: "inline-block", fontWeight: 700 }}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="animate-pulse-glow" style={{ position: "absolute", top: -16, right: -16, background: "linear-gradient(135deg,#00ff88,#00cc66)", borderRadius: 12, padding: "10px 16px", boxShadow: "0 10px 30px rgba(0,255,136,0.4)", color: "#020617" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(2,6,23,0.7)", marginBottom: 2, letterSpacing: "0.5px", textTransform: "uppercase" }}>New match!</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>⚽ Futsal · ₹600</div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, marginTop: 80, padding: "32px 40px", borderRadius: 20, background: "rgba(30,41,59,0.5)", border: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 4 }} className="gradient-text">{s.value}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:900px){section>div>div:first-child>div:first-child{grid-template-columns:1fr!important}section>div>div:first-child>div:first-child>div:last-child{display:none!important}}`}</style>
    </section>
  );
}
