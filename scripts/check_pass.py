with open('src/lib/data/seed.ts', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('SEED_MEMBERS')
print(text[idx:idx+1500])
