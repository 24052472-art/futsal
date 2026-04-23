import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPage() {
  return (
    <main style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 120, paddingBottom: 80, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.1) 0%, transparent 70%)" }} />
        
        <div className="container-pad" style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 16, letterSpacing: "-1px" }}>
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>Last updated: March 2026</p>

          <div className="glass" style={{ padding: 40, borderRadius: 24, display: "flex", flexDirection: "column", gap: 32 }}>
            <section>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>1. Information We Collect</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                GameHaru collects information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), and other information you choose to provide.
              </p>
            </section>
            
            <section>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>2. Use of Information</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                We may use the information we collect about you to:
              </p>
              <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 20, marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <li>Provide, maintain, and improve our Services.</li>
                <li>Perform internal operations, including troubleshooting software bugs and operational problems.</li>
                <li>Send you communications we think will be of interest to you.</li>
                <li>Personalize and improve the Services, including to provide or recommend features, content, social connections, referrals, and advertisements.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: "white" }}>3. Data Security</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                GameHaru takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. We use industry-standard encryption to protect your data both in transit and at rest.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
