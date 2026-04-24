"use client";
import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

const initialCoupons = [
  { id: 1, code: "FIRST50", type: "flat", value: 50, uses: 24, maxUses: 100, expires: "May 31, 2026", active: true },
  { id: 2, code: "WEEKEND20", type: "percent", value: 20, uses: 56, maxUses: 200, expires: "Apr 30, 2026", active: true },
  { id: 3, code: "CRICKET100", type: "flat", value: 100, uses: 10, maxUses: 50, expires: "Jun 15, 2026", active: false },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "flat", value: "", maxUses: "", expires: "" });

  const toggle = (id: number) => setCoupons(cs => cs.map(c => c.id === id ? { ...c, active: !c.active } : c));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Coupons & Discounts</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Create promo codes to reward loyal customers.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: "10px 20px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="glass" style={{ borderRadius: 20, padding: 28, marginBottom: 24, border: "1px solid rgba(0,212,255,0.3)" }}>
          <h3 style={{ fontFamily: "Outfit,sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Create New Coupon</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {[
              { label: "Coupon Code", key: "code", type: "text", placeholder: "e.g. SAVE50" },
              { label: "Discount Value", key: "value", type: "number", placeholder: "e.g. 50" },
              { label: "Max Uses", key: "maxUses", type: "number", placeholder: "e.g. 100" },
              { label: "Expires On", key: "expires", type: "date", placeholder: "" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>{f.label}</label>
                <input type={f.type} className="input-field" placeholder={f.placeholder} style={{ padding: "11px 14px" }}
                  value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>Discount Type</label>
              <select className="input-field" style={{ padding: "11px 14px" }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="flat">Flat (₹)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button className="btn-primary" style={{ padding: "11px 24px", fontSize: 14 }}>Create Coupon</button>
            <button onClick={() => setShowForm(false)} className="btn-outline" style={{ padding: "11px 24px", fontSize: 14 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
        {coupons.map(c => (
          <div key={c.id} className="glass" style={{ borderRadius: 18, padding: 24, border: `1px solid ${c.active ? "rgba(0,212,255,0.25)" : "var(--border)"}`, opacity: c.active ? 1 : 0.65 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0,212,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag size={18} color="#00d4ff" />
                </div>
                <div>
                  <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>{c.code}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Expires {c.expires}</div>
                </div>
              </div>
              <button onClick={() => setCoupons(cs => cs.filter(x => x.id !== c.id))} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: "#ef4444" }}>
                <Trash2 size={14} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "rgba(15,23,42,0.5)", textAlign: "center" }}>
                <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 22, fontWeight: 800, color: "#00ff88" }}>{c.type === "flat" ? `₹${c.value}` : `${c.value}%`}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>discount</div>
              </div>
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "rgba(15,23,42,0.5)", textAlign: "center" }}>
                <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 22, fontWeight: 800 }}>{c.uses}/{c.maxUses}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>uses</div>
              </div>
            </div>

            {/* Usage bar */}
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginBottom: 16 }}>
              <div style={{ height: "100%", width: `${(c.uses / c.maxUses) * 100}%`, borderRadius: 2, background: "linear-gradient(90deg,#00d4ff,#00ff88)", transition: "width 0.5s" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: c.active ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)", color: c.active ? "#00ff88" : "#64748b" }}>
                {c.active ? "Active" : "Inactive"}
              </span>
              <button onClick={() => toggle(c.id)} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
                {c.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

