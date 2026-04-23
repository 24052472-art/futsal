"use client";
import Link from "next/link";
import { Zap, Globe, Share2, MessageCircle, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", paddingTop: 60, paddingBottom: 40 }}>
      {/* CTA Banner */}
      <div className="container-pad" style={{ marginBottom: 60 }}>
        <div style={{ borderRadius: 24, padding: "56px 40px", background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.1))", border: "1px solid rgba(0,255,136,0.3)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 400, height: 200, background: "radial-gradient(ellipse, rgba(0,255,136,0.2) 0%, transparent 70%)" }} />
          <h2 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16, position: "relative" }}>
            Ready to grow your arena? 🚀
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, marginBottom: 32, position: "relative" }}>
            Join 200+ arena owners. Start your 7-day free trial today.
          </p>
          <Link href="/register" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 36px", fontSize: 17, textDecoration: "none", borderRadius: 14, position: "relative", background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617", fontWeight: 800 }}>
            <Zap size={20} fill="currentColor" /> Get Started Free
          </Link>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 14, position: "relative" }}>No credit card required · Setup in 10 minutes</div>
        </div>
      </div>

      <div className="container-pad">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 900, fontSize: 18, fontFamily: "sans-serif", letterSpacing: "-1px" }}>
                GH
              </div>
              <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>Game<span style={{ color: "#00ff88" }}>Haru</span></span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
              The all-in-one SaaS platform for sports arena management across India and Nepal.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#00d4ff"; (e.currentTarget as HTMLElement).style.color = "#00ff88"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap", "API Docs"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
            { title: "Support", links: ["Documentation", "Help Center", "Status", "Privacy Policy", "Terms of Service"] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--text-primary)" }}>{col.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(l => {
                  let href = "#";
                  if (l === "Features") href = "/#features";
                  if (l === "Pricing") href = "/#pricing";
                  if (l === "Changelog") href = "/changelog";
                  if (l === "Roadmap") href = "/roadmap";
                  if (l === "API Docs") href = "/api-docs";
                  if (l === "About") href = "/about";
                  if (l === "Blog") href = "/blog";
                  if (l === "Careers") href = "/careers";
                  if (l === "Press") href = "/press";
                  if (l === "Contact") href = "/contact";
                  if (l === "Documentation") href = "/documentation";
                  if (l === "Help Center") href = "/help-center";
                  if (l === "Status") href = "/status";
                  if (l === "Privacy Policy") href = "/privacy";
                  if (l === "Terms of Service") href = "/terms";
                  return (
                    <Link key={l} href={href} style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "white")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>{l}</Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>@2026GameHaru.All right reserved</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
              <Mail size={14} /> abhi.kush047@gmail.com
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
              <Phone size={14} /> +9779829098384
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){footer div[style*="grid-template-columns: 2fr"]{grid-template-columns:1fr 1fr!important}}`}</style>
    </footer>
  );
}
