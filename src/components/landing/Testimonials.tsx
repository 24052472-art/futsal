"use client";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Rajan Thapa", role: "Futsal Arena Owner, Kathmandu", avatar: "R", text: "Before GameHaru, I was managing everything on paper and WhatsApp. Now I get bookings 24/7, even while I sleep. Revenue went up 40% in the first month.", rating: 5, sport: "⚽ Futsal" },
  { name: "Sneha Patel", role: "Cricket Complex Owner, Ahmedabad", avatar: "S", text: "The booking link alone changed everything. I shared it on our Instagram bio and we were fully booked for 2 weeks straight. The analytics are incredibly useful.", rating: 5, sport: "🏏 Cricket" },
  { name: "Arjun Singh", role: "Multi-Sport Arena, Delhi", avatar: "A", text: "Double bookings were killing us. GameHaru's slot locking system is a game changer. Zero conflicts in 3 months of using it.", rating: 5, sport: "🏸 Multi-Sport" },
  { name: "Priya Sharma", role: "Badminton Club, Pune", avatar: "P", text: "Setup took literally 8 minutes. My customers love the clean booking page and the WhatsApp reminders. Best investment for my arena.", rating: 5, sport: "🏸 Badminton" },
  { name: "Bikash Rai", role: "Indoor Sports Center, Pokhara", avatar: "B", text: "Khalti payment integration is perfect for Nepal. My customers book and pay online — no more running after cash payments.", rating: 5, sport: "🏋️ Indoor Sports" },
  { name: "Meera Iyer", role: "Futsal Club, Bengaluru", avatar: "M", text: "The revenue analytics showed me that Tuesday evenings were underutilized. I ran a discount promo and now Tuesdays are fully booked.", rating: 5, sport: "⚽ Futsal" },
];

export default function Testimonials() {
  return (
    <section className="section-pad" style={{ background: "rgba(15,23,42,0.5)" }}>
      <div className="container-pad">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ color: "#00d4ff", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>Testimonials</span>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, marginTop: 12, letterSpacing: "-1px" }}>
            Trusted by arena owners<br />
            <span className="gradient-text">across South Asia</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={i} className="glass glass-hover" style={{ borderRadius: 20, padding: 28 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={15} color="#f59e0b" fill="#f59e0b" />
                ))}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #00d4ff, #00ff88)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#020617" }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{t.role}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 20 }}>{t.sport.split(" ")[0]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
