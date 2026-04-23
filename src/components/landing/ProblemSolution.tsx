"use client";
import { X, Check } from "lucide-react";

const problems = [
  "Missed calls = lost revenue",
  "Double bookings & conflicts",
  "No payment tracking",
  "Zero customer data",
  "Can't see peak hours",
  "Manual WhatsApp chaos",
];

const solutions = [
  "24/7 online booking — never miss a slot",
  "Conflict prevention with slot locking",
  "Full payment dashboard & history",
  "Built-in customer CRM",
  "Revenue analytics & heatmaps",
  "Automated confirmations & reminders",
];

export default function ProblemSolution() {
  return (
    <section id="features" className="section-pad" style={{ background: "rgba(15,23,42,0.5)", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)" }} />
      <div className="container-pad" style={{ position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ color: "#00d4ff", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>The Problem</span>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
            Tired of managing bookings<br />
            <span className="gradient-text">the old way?</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 32, alignItems: "start" }}>
          {/* Problems */}
          <div className="glass" style={{ borderRadius: 20, padding: 32, border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={20} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Before GameHaru</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>The daily struggle</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {problems.map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <X size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 40, fontWeight: 900 }} className="gradient-text">→</div>
          </div>

          {/* Solutions */}
          <div className="glass" style={{ borderRadius: 20, padding: 32, border: "1px solid rgba(0,255,136,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,255,136,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={20} color="#00ff88" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>With GameHaru</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Automated & profitable</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {solutions.map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
                  <Check size={15} color="#00ff88" style={{ flexShrink: 0 }} />
                  <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){.container-pad>div:last-child{grid-template-columns:1fr!important} .container-pad>div:last-child>div:nth-child(2){display:none!important}}`}</style>
    </section>
  );
}
