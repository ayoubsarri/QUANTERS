import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const cfg = {
  apiKey: 'AIzaSyC6pIhe81IqNuINx7Wd-TfgBLBJuW4Z6Yw',
  authDomain: 'quanters-d0312.firebaseapp.com',
  projectId: 'quanters-d0312'
};
const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

async function locate() {
  await signInAnonymously(auth);
  const snap = await getDoc(doc(db, 'erp_state', 'main'));
  const d = snap.data();
  for (const [k, v] of Object.entries(d)) {
    const str = JSON.stringify(v);
    if (str.toLowerCase().includes('yacine') || str.toLowerCase().includes('brahimi')) {
      console.log('Found Yacine/Brahimi in key:', k);
      if (Array.isArray(v)) {
        v.forEach((item, idx) => {
          if (JSON.stringify(item).toLowerCase().includes('yacine') || JSON.stringify(item).toLowerCase().includes('brahimi')) {
            console.log('  Item at index', idx, ':', JSON.stringify(item));
          }
        });
      }
    }
    if (str.toLowerCase().includes('scientific python')) {
      console.log('Found Scientific Python in key:', k);
      if (Array.isArray(v)) {
        v.forEach((item, idx) => {
          if (JSON.stringify(item).toLowerCase().includes('scientific python')) {
            console.log('  Item at index', idx, ':', JSON.stringify(item));
          }
        });
      }
    }
  }
}
locate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
