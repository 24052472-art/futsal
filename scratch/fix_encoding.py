import os

def fix_file(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Common encoding glitches for ₹ and emojis
    fixes = {
        'â‚¹': '₹',
        'ðŸ Ÿï¸ ': '⚽',
        'â ³': '⏳',
        'ðŸ Ÿ': '⚽'
    }
    
    new_content = content
    for old, new in fixes.items():
        new_content = new_content.replace(old, new)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {path}")
    else:
        print(f"No changes for {path}")

files = [
    r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\page.tsx',
    r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\bookings\page.tsx',
    r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\calendar\page.tsx',
    r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\payments\page.tsx'
]

for f in files:
    if os.path.exists(f):
        fix_file(f)
