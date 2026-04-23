"use client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <main style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 120, paddingBottom: 80, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: 500, background: "radial-gradient(ellipse at 100% 0%, rgba(0,255,136,0.15) 0%, transparent 70%)" }} />
        
        <div className="container-pad" style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, marginBottom: 24, letterSpacing: "-1px" }}>
            Get in <span className="gradient-text">Touch</span>
          </h1>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 40, alignItems: "start" }}>
            {/* Contact Info */}
            <div className="glass" style={{ padding: 40, borderRadius: 24 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Contact Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4ff" }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>Email Us</div>
                    <div style={{ fontWeight: 700 }}>abhi.kush047@gmail.com</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,255,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00ff88" }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>Call Us</div>
                    <div style={{ fontWeight: 700 }}>+9779829098384</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>WhatsApp</div>
                    <div style={{ fontWeight: 700 }}>Available 24/7</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass" style={{ padding: 40, borderRadius: 24, border: "1px solid var(--border-hover)" }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Send a Message</h3>
              <form onSubmit={e => { e.preventDefault(); alert("Message Sent!"); }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Full Name</label>
                  <input type="text" required placeholder="John Doe" className="input-field" style={{ padding: "14px 16px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Email Address</label>
                  <input type="email" required placeholder="john@example.com" className="input-field" style={{ padding: "14px 16px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Message</label>
                  <textarea required placeholder="How can we help you?" className="input-field" style={{ padding: "14px 16px", minHeight: 120, resize: "vertical" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: 16, marginTop: 10, display: "flex", justifyContent: "center" }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
