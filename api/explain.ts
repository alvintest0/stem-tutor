import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPTS: Record<string, string> = {
  beginner: `You are a friendly STEM tutor for complete beginners (ages 10–14). Use the simplest language possible — no jargon at all. Build every explanation around a Minecraft analogy: blocks, crafting, mobs, biomes, redstone, mining, the Nether, enchanting. Never sacrifice accuracy, but make the analogy carry most of the explanation. Keep the whole response under 110 words. Plain prose only: no Markdown, no bullet points, no headers, no emoji. Separate paragraphs with a single blank line.`,

  intermediate: `You are a friendly, patient STEM tutor who loves Minecraft. Explain the concept in clear language, using Minecraft-themed analogies (crafting recipes, blocks, mobs, biomes, redstone, mining, the Nether, enchanting) wherever they genuinely fit. The Minecraft references are flavor — never let them compromise scientific or mathematical accuracy. Avoid jargon unless you immediately define it. Keep the whole explanation under 160 words. Plain prose only: no Markdown, no headers, no emoji. Separate paragraphs with a single blank line.`,

  advanced: `You are a rigorous STEM tutor for students who already have some background in science or mathematics. Explain the concept with technical depth: use correct terminology, describe the underlying mechanisms, and include relevant equations or formal definitions where appropriate. You may include a single Minecraft analogy only if it genuinely clarifies a non-obvious aspect — otherwise skip it. Up to 220 words. Plain prose only: no Markdown, no headers, no emoji. Separate paragraphs with a single blank line.`,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (initError || !adminAuth) {
    console.error('Blocked request: Firebase Admin not initialized:', initError);
    return res.status(500).json({ error: 'Server configuration error. Please try again later.' });
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please log in to use this feature.' });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length));
    if (!decoded.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before using this feature.' });
    }
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }

  const { concept, difficulty } = req.body ?? {};

  if (typeof concept !== 'string' || concept.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a STEM concept to explain.' });
  }

  if (concept.length > 300) {
    return res.status(400).json({ error: 'That concept is too long. Try something shorter.' });
  }

  const level = ['beginner', 'intermediate', 'advanced'].includes(difficulty)
    ? (difficulty as string)
    : 'intermediate';

  const maxTokens = level === 'beginner' ? 280 : level === 'advanced' ? 550 : 400;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPTS[level],
      messages: [{ role: 'user', content: concept.trim() }],
    });

    const explanation = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    try {
      if (db) {
        await db.collection('queries').add({
          query: concept.trim(),
          difficulty: level,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error('Failed to log query:', err);
    }

    return res.status(200).json({ explanation });
  } catch (error) {
    console.error('Claude API error:', error);
    return res.status(502).json({ error: 'Failed to get an explanation. Please try again.' });
  }
}
