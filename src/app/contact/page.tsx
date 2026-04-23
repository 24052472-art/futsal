"use client";
import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, Phone, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <main style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 120, paddingBottom: 80, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: 500, background: "radial-gradient(ellipse at 100% 0%, rgba(0,255,136,0.15) 0%, transparent 70%)" }} />
        
        <div className="container-pad" style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, marginBottom: 24, letterSpacing: "-1px" }}>
            Get in <span className="gradient-text">Touch</span>
          </h1>
          
          <div className="grid-mobile-1" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 40, alignItems: "start" }}>
            {/* Contact Info */}
            <div className="glass" style={{ padding: "clamp(24px, 4vw, 40px)", borderRadius: 24 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Contact Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4ff", flexShrink: 0 }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>Email Us</div>
                    <div style={{ fontWeight: 700 }}>abhi.kush047@gmail.com</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,255,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00ff88", flexShrink: 0 }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>Call Us</div>
                    <div style={{ fontWeight: 700 }}>+9779829098384</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", flexShrink: 0 }}>
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
            <div className="glass" style={{ padding: "clamp(24px, 4vw, 40px)", borderRadius: 24, border: "1px solid var(--border-hover)" }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Send a Message</h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Full Name</label>
                  <input type="text" required placeholder="John Doe" className="input-field" style={{ padding: "14px 16px" }}
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Email Address</label>
                  <input type="email" required placeholder="john@example.com" className="input-field" style={{ padding: "14px 16px" }}
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Message</label>
                  <textarea required placeholder="How can we help you?" className="input-field" style={{ padding: "14px 16px", minHeight: 120, resize: "vertical" }}
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <button type="submit" disabled={status === "sending"} className="btn-primary" style={{ padding: 16, marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, opacity: status === "sending" ? 0.7 : 1 }}>
                  {status === "sending" && <Loader2 size={18} className="animate-spin" />}
                  {status === "sent" && <CheckCircle2 size={18} />}
                  {status === "idle" && "Send Message"}
                  {status === "sending" && "Sending..."}
                  {status === "sent" && "Message Sent!"}
                  {status === "error" && "Failed — Try Again"}
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
