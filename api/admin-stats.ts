import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const ADMIN_EMAIL = 'lucky.alvinwijaya@gmail.com';

let adminAuth: Auth | undefined;
let db: Firestore | undefined;
let initError: string | null = null;

try {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? '');
    initializeApp({ credential: cert(serviceAccount) });
  }
  adminAuth = getAuth();
  db = getFirestore();
} catch (error) {
  initError = error instanceof Error ? error.message : 'Unknown initialization error';
  console.error('Firebase Admin initialization failed:', error);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (initError || !adminAuth || !db) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let email: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length));
    if (!decoded.email_verified) return res.status(403).json({ error: 'Email not verified.' });
    email = decoded.email;
  } catch {
    return res.status(401).json({ error: 'Invalid session.' });
  }

  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  const [usersResult, queriesSnapshot] = await Promise.all([
    adminAuth.listUsers(1000),
    db.collection('queries').get(),
  ]);

  const totalUsers = usersResult.users.length;
  const totalExplanations = queriesSnapshot.size;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = queriesSnapshot.docs.filter(
    (d) => (d.data().timestamp as number) >= todayStart.getTime(),
  ).length;

  const counts: Record<string, number> = {};
  for (const doc of queriesSnapshot.docs) {
    const q = ((doc.data().query as string) ?? '').toLowerCase().trim();
    if (q) counts[q] = (counts[q] ?? 0) + 1;
  }
  const topConcepts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([concept, count]) => ({ concept, count }));

  return res.status(200).json({ totalUsers, totalExplanations, todayCount, topConcepts });
}
