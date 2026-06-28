import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!key) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Run this via `npm run users:count`.');
  process.exit(1);
}

const app = initializeApp({ credential: cert(JSON.parse(key)) });
const auth = getAuth(app);

let count = 0;
let verifiedCount = 0;
let pageToken;

do {
  const result = await auth.listUsers(1000, pageToken);
  for (const user of result.users) {
    count++;
    if (user.emailVerified) verifiedCount++;
  }
  pageToken = result.pageToken;
} while (pageToken);

console.log(`Total registered users: ${count}`);
console.log(`Verified: ${verifiedCount}`);
console.log(`Unverified: ${count - verifiedCount}`);
