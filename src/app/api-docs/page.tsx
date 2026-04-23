import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function apidocsPage() {
  return (
    <main style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 120, paddingBottom: 80, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.1) 0%, transparent 70%)" }} />
        
        <div className="container-pad" style={{ position: "relative", zIndex: 1, maxWidth: 800, textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 16, letterSpacing: "-1px" }}>
            Api Docs
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 40, fontSize: 18 }}>
            This page is currently under construction. Please check back later.
          </p>

          <div className="glass" style={{ padding: 40, borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              🚧
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "white" }}>Coming Soon</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 500 }}>
              We are working hard to bring you the best experience. The Api Docs section will be available in our next major update.
            </p>
            <a href="/" className="btn-primary" style={{ padding: "12px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 700, marginTop: 16, background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617" }}>
              Return Home
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
