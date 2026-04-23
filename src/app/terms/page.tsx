import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function TermsPage() {
  return (
    <main style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 120, paddingBottom: 80, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.1) 0%, transparent 70%)" }} />
        
        <div className="container-pad" style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 16, letterSpacing: "-1px" }}>
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>Last updated: March 2026</p>

          <div className="glass" style={{ padding: 40, borderRadius: 24, display: "flex", flexDirection: "column", gap: 32 }}>
            <section>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>1. Acceptance of Terms</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                By accessing and using GameHaru's platform, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>
            
            <section>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>2. Provision of Services</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                You agree and acknowledge that GameHaru is entitled to modify, improve or discontinue any of its services at its sole discretion and without notice to you even if it may result in you being prevented from accessing any information contained in it. Furthermore, you agree and acknowledge that GameHaru is entitled to provide services to you through subsidiaries or affiliated entities.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>3. Proprietary Rights</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                You acknowledge and agree that GameHaru may contain proprietary and confidential information including trademarks, service marks and patents protected by intellectual property laws and international intellectual property treaties. GameHaru authorizes you to view and make a single copy of portions of its content for offline, personal, non-commercial use. Our content may not be sold, reproduced, or distributed without our written permission.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>4. Termination of Agreement</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                The Terms of this agreement will continue to apply in perpetuity until terminated by either party without notice at any time for any reason. Terms that are to continue in perpetuity shall be unaffected by the termination of this agreement.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
