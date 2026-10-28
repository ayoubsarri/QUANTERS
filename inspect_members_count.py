import re

with open('src/lib/data/seed.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.findall(r'id:\s*"(mem-[^"]+)"', text)
print("Member IDs in seed.ts:", len(m), m)

with open('src/components/admin/AdminSidebar.tsx', 'r', encoding='utf-8') as f:
    sb = f.read()

for line in sb.splitlines():
    if 'members' in line.lower() or 'badge' in line.lower() or 'length' in line:
        print("Sidebar:", line.strip())
