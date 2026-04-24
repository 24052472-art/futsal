import os

def fix_file_by_line(path, line_no, new_text):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    if 0 < line_no <= len(lines):
        # We replace the entire line to be safe
        # Find the indentation
        original = lines[line_no - 1]
        indent = original[:len(original) - len(original.lstrip())]
        lines[line_no - 1] = indent + new_text + '\n'
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"Fixed line {line_no} in {path}")

# Fix Bookings Page (The ones that might have missed)
fix_file_by_line(r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\bookings\page.tsx', 173, '<div style={{ fontSize: 15, fontWeight: 900, color: "#00ff88" }}>₹{b.amount}</div>')
fix_file_by_line(r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\bookings\page.tsx', 166, '<span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{b.sportEmoji || "⚽"} {b.sportName || b.sport || "General"}</span>')

# Fix Calendar Page
fix_file_by_line(r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\calendar\page.tsx', 175, '{ev.status === "pending_verification" && <span style={{ fontSize: 10, marginRight: 4 }}>⏳</span>}')

# Fix Overview YAxis (Just in case)
fix_file_by_line(r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\page.tsx', 194, '<YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />')
