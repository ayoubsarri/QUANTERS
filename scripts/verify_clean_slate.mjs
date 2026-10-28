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

async function verify() {
  await signInAnonymously(auth);
  const snap = await getDoc(doc(db, 'erp_state', 'main'));
  const d = snap.data();
  console.log('--- VERIFICATION RESULTS ---');
  console.log('1. Members count:', d.members.length, '->', d.members[0].email, d.members[0].fullName, d.members[0].roles);
  console.log('2. Workshops count:', d.workshops.length);
  console.log('3. Explore posts count:', d.explorePosts.length);
  for (const ep of d.explorePosts) console.log('   -', ep.id, ':', ep.title);
  console.log('4. Daily quizzes count:', d.dailyQuizzes.length);
  console.log('5. Tasks count:', d.tasks.length);
  console.log('6. Proposals count:', d.proposals.length);
  console.log('7. Ledger count:', d.ledger.length);
  console.log('8. Grievances count:', d.grievances.length);
  console.log('9. Project submissions count:', d.projectSubmissions.length);
  console.log('10. Exam completions count:', d.examCompletions.length);
  
  const rawJson = JSON.stringify(d);
  const hasYacine = rawJson.toLowerCase().includes('yacine');
  const hasBrahimi = rawJson.toLowerCase().includes('brahimi');
  const hasPythonWs = rawJson.toLowerCase().includes('scientific python');
  console.log('Contains Yacine:', hasYacine);
  console.log('Contains Brahimi:', hasBrahimi);
  console.log('Contains Scientific Python:', hasPythonWs);
  if (!hasYacine && !hasBrahimi && !hasPythonWs && d.members.length === 1 && d.workshops.length === 0 && d.explorePosts.length === 5 && d.dailyQuizzes.length === 0) {
    console.log('ALL VERIFICATIONS PASSED 100%!');
  } else {
    console.error('VERIFICATION FAILED!');
  }
}
verify().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
