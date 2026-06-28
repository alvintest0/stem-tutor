import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminAuth: Auth | undefined;
let initError: string | null = null;

try {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? '');
    initializeApp({ credential: cert(serviceAccount) });
  }
  adminAuth = getAuth();
} catch (error) {
  initError = error instanceof Error ? error.message : 'Unknown initialization error';
  console.error('Firebase Admin initialization failed:', error);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a friendly, patient STEM tutor for beginners who loves Minecraft.
Explain the concept the student gives you in simple, plain language, using Minecraft-themed
analogies (crafting recipes, blocks, mobs, biomes, redstone, mining, the Nether, enchanting, etc.)
wherever they genuinely fit. The Minecraft references are flavor for a relatable analogy — never
let them compromise the actual scientific or mathematical accuracy. Avoid jargon unless you
immediately define it. Keep the whole explanation under 160 words.

Write in plain prose only: no Markdown formatting (no #, *, -, or numbered lists), no headers, and
no emoji. Separate paragraphs with a single blank line.`;

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

  const { concept } = req.body ?? {};

  if (typeof concept !== 'string' || concept.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a STEM concept to explain.' });
  }

  if (concept.length > 300) {
    return res.status(400).json({ error: 'That concept is too long. Try something shorter.' });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: concept.trim() }],
    });

    const explanation = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return res.status(200).json({ explanation });
  } catch (error) {
    console.error('Claude API error:', error);
    return res.status(502).json({ error: 'Failed to get an explanation. Please try again.' });
  }
}
