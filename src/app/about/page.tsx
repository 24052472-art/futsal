import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function AboutPage() {
  return (
    <main style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 120, paddingBottom: 80, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400, background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.15) 0%, transparent 70%)" }} />
        
        <div className="container-pad" style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, marginBottom: 24, letterSpacing: "-1px" }}>
            About <span className="gradient-text">GameHaru</span>
          </h1>
          <div className="glass" style={{ padding: 40, borderRadius: 24 }}>
            <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.8, marginBottom: 24 }}>
              GameHaru is the leading premium sports and gaming arena management platform across South Asia. We empower arena owners with cutting-edge tools to automate bookings, streamline payments, and accelerate growth.
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.8, marginBottom: 24 }}>
              Born from the frustration of manual WhatsApp bookings and double-booking conflicts, GameHaru was built to be the operating system for modern sports venues.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 40 }}>
              <div style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", padding: 24, borderRadius: 16 }}>
                <h3 style={{ fontSize: 32, fontWeight: 900, color: "#00d4ff", marginBottom: 8 }}>200+</h3>
                <div style={{ color: "var(--text-muted)" }}>Active Arenas</div>
              </div>
              <div style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", padding: 24, borderRadius: 16 }}>
                <h3 style={{ fontSize: 32, fontWeight: 900, color: "#00ff88", marginBottom: 8 }}>₹50L+</h3>
                <div style={{ color: "var(--text-muted)" }}>Processed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
