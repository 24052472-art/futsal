"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 24px",
      background: scrolled ? "rgba(15,23,42,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(148,163,184,0.1)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", color: "#020617", fontWeight: 900, fontSize: 18, fontFamily: "sans-serif", letterSpacing: "-1px" }}>
            GH
          </div>
          <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 22, color: "white", letterSpacing: "-0.5px" }}>Game<span style={{ color: "#00ff88" }}>Haru</span></span>
        </Link>

        <div className="hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "Pricing", "How It Works"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 15, fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >{item}</a>
          ))}
        </div>

        <div className="hide-mobile" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <Link href="/dashboard" className="btn-primary" style={{ padding: "10px 22px", fontSize: 15, borderRadius: 10, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 15, fontWeight: 500, padding: "8px 16px" }}>Login</Link>
              <Link href="/register" className="btn-primary" style={{ background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617", padding: "10px 22px", fontSize: 15, fontWeight: 700, borderRadius: 10, textDecoration: "none", display: "inline-block" }}>
                Start Free Trial
              </Link>
            </>
          )}
        </div>
        <button className="show-mobile" onClick={() => setOpen(!open)} style={{ display: "none", background: "none", border: "none", color: "white", cursor: "pointer" }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div style={{ background: "rgba(15,23,42,0.98)", padding: "16px 24px 24px", borderTop: "1px solid var(--border)" }}>
          {["Features", "Pricing", "How It Works"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              style={{ display: "block", padding: "12px 0", color: "var(--text-secondary)", textDecoration: "none", fontSize: 16 }}
              onClick={() => setOpen(false)}
            >{item}</a>
          ))}
          {user ? (
            <Link href="/dashboard" className="btn-primary" style={{ display: "block", textAlign: "center", padding: "12px", marginTop: 16, textDecoration: "none", borderRadius: 10 }}>
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/register" className="btn-primary" style={{ display: "block", textAlign: "center", padding: "12px", marginTop: 16, textDecoration: "none", borderRadius: 10, background: "linear-gradient(135deg, #00d4ff, #00ff88)", color: "#020617", fontWeight: 700 }}>
              Start Free Trial
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
