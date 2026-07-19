import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!key) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not set. Run via: npm run concepts:count');
  process.exit(1);
}

const app = initializeApp({ credential: cert(JSON.parse(key)) });
const auth = getAuth(app);
const db = getFirestore(app);

let totalConcepts = 0;
let pageToken;

do {
  const result = await auth.listUsers(1000, pageToken);
  for (const user of result.users) {
    const snap = await db.collection('users').doc(user.uid).collection('concepts').get();
    totalConcepts += snap.size;
  }
  pageToken = result.pageToken;
} while (pageToken);

console.log(`Total concepts explored across all users: ${totalConcepts}`);
