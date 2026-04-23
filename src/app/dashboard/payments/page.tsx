"use client";
import { Download, TrendingUp, CreditCard, AlertCircle } from "lucide-react";

const txns = [
  { id: "TXN001", booking: "BK001", customer: "Rahul Sharma", sport: "âš½ Futsal", date: "Apr 24, 2026", amount: 600, mode: "Razorpay", status: "success" },
  { id: "TXN002", booking: "BK003", customer: "Amit Kumar", sport: "ðŸ Cricket", date: "Apr 24, 2026", amount: 800, mode: "Khalti", status: "success" },
  { id: "TXN003", booking: "BK004", customer: "Sana Ali", sport: "âš½ Futsal", date: "Apr 25, 2026", amount: 300, mode: "Razorpay", status: "success" },
  { id: "TXN004", booking: "BK006", customer: "Kavya Nair", sport: "âš½ Futsal", date: "Apr 26, 2026", amount: 600, mode: "Razorpay", status: "success" },
  { id: "TXN005", booking: "BK005", customer: "Dev Rana", sport: "ðŸ¸ Badminton", date: "Apr 25, 2026", amount: 400, mode: "Razorpay", status: "failed" },
  { id: "TXN006", booking: "BK002", customer: "Priya Mehta", sport: "ðŸ¸ Badminton", date: "Apr 24, 2026", amount: 400, mode: "Cash", status: "pending" },
];

const statusStyle = (s: string) => ({
  success: { bg: "rgba(16,185,129,0.15)", color: "#00ff88", border: "rgba(16,185,129,0.3)", label: "Success" },
  failed: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)", label: "Failed" },
  pending: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)", label: "Pending" },
}[s] || {});

export default function PaymentsPage() {
  const total = txns.filter(t => t.status === "success").reduce((s, t) => s + t.amount, 0);
  const pending = txns.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const failed = txns.filter(t => t.status === "failed").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Payments</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Track all transactions across payment modes.</p>
        </div>
        <button className="btn-outline" style={{ padding: "10px 20px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} color="#00ff88" />
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Collected</span>
          </div>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 30, fontWeight: 800, color: "#00ff88" }}>â‚¹{total.toLocaleString()}</div>
        </div>
        <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={18} color="#f59e0b" />
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Pending</span>
          </div>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 30, fontWeight: 800, color: "#f59e0b" }}>â‚¹{pending.toLocaleString()}</div>
        </div>
        <div className="glass" style={{ borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={18} color="#ef4444" />
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Failed Txns</span>
          </div>
          <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 30, fontWeight: 800, color: "#ef4444" }}>{failed}</div>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 20, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(15,23,42,0.4)" }}>
                {["Txn ID", "Booking", "Customer", "Sport", "Date", "Amount", "Mode", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 18px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txns.map(t => {
                const st = statusStyle(t.status) as any;
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(148,163,184,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "14px 18px", fontSize: 12, color: "#00d4ff", fontWeight: 700 }}>{t.id}</td>
                    <td style={{ padding: "14px 18px", fontSize: 12, color: "var(--text-secondary)" }}>{t.booking}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600 }}>{t.customer}</td>
                    <td style={{ padding: "14px 18px", fontSize: 14 }}>{t.sport}</td>
                    <td style={{ padding: "14px 18px", fontSize: 12, color: "var(--text-muted)" }}>{t.date}</td>
                    <td style={{ padding: "14px 18px", fontSize: 14, fontWeight: 700 }}>â‚¹{t.amount}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-secondary)" }}>{t.mode}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

