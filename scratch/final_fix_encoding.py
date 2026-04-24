import os

def fix_content(content):
    fixes = {
        'â‚¹': '₹',
        'â,¹': '₹',
        'â,': '₹',
        'â€¢': '•',
        'â ³': '⏳',
        'ðŸ Ÿï¸ ': '⚽',
        'ðŸ Ÿ': '⚽',
        'â€': '—'
    }
    new_content = content
    for old, new in fixes.items():
        new_content = new_content.replace(old, new)
    return new_content

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    new_content = fix_content(content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Fixed: {path}")
                except Exception as e:
                    print(f"Error processing {path}: {e}")

# Process directories
process_directory(r'c:\Users\KIIT\Downloads\futsal\src\app\dashboard\payments')
process_directory(r'c:\Users\KIIT\Downloads\futsal\src\components')
