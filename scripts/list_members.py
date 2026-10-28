import urllib.request, json
url = 'https://firestore.googleapis.com/v1/projects/quanters-d0312/databases/(default)/documents/erp_state/main'
req = urllib.request.urlopen(url)
doc = json.loads(req.read().decode('utf-8'))
members_json = doc['fields']['members']['stringValue']
members = json.loads(members_json)
for m in members:
    print(f"{m.get('id')} | {m.get('quanterId')} | {m.get('fullName')} | {m.get('email')} | pass: {m.get('password')} | roles: {m.get('roles')}")
