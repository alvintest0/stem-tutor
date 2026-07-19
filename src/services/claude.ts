import { auth } from '@/services/firebase';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export async function explainConcept(concept: string, difficulty: Difficulty = 'intermediate'): Promise<string> {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch('/api/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ concept, difficulty }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Something went wrong.' }));
    throw new Error(body.error ?? 'Something went wrong.');
  }

  const data = await response.json();
  return data.explanation as string;
}
