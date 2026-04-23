"use client";

const steps = [
  { num: "01", title: "Create Your Arena", desc: "Sign up and set up your arena profile in minutes. Add photos, description, Google Maps location, and game categories.", emoji: "🏟️" },
  { num: "02", title: "Configure Slots & Pricing", desc: "Set your available time slots, days of week, and price per slot for each sport category. Recurring schedules supported.", emoji: "⚙️" },
  { num: "03", title: "Share Your Booking Link", desc: "Get your unique URL. Share on WhatsApp, Instagram bio, Google Maps, or print as a QR code at your arena.", emoji: "🔗" },
  { num: "04", title: "Manage & Grow", desc: "Watch bookings roll in. Track revenue, manage customers, and use analytics to optimize peak hours.", emoji: "📈" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad" style={{ background: "rgba(15,23,42,0.4)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 50% at 80% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />
      <div className="container-pad" style={{ position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ color: "#10b981", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>How It Works</span>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
            Live in <span className="gradient-text">4 simple steps</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div className="glass glass-hover" style={{ borderRadius: 20, padding: 32, height: "100%" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.emoji}</div>
                <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, fontWeight: 800, color: "#6366f1", letterSpacing: 2, marginBottom: 10 }}>{s.num}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", top: "30%", right: -20, fontSize: 20, color: "var(--text-muted)", zIndex: 1 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
