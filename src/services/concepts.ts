import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Concept } from '@/types';

function conceptsCollection(userId: string) {
  return collection(db, 'users', userId, 'concepts');
}

export async function saveConcept(userId: string, searchedQuery: string, explanation: string) {
  await addDoc(conceptsCollection(userId), {
    query: searchedQuery,
    explanation,
    createdAt: serverTimestamp(),
  });
}

export async function getConcepts(userId: string): Promise<Concept[]> {
  const q = query(conceptsCollection(userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      query: data.query as string,
      explanation: data.explanation as string,
      createdAt: (data.createdAt as Timestamp | undefined)?.toMillis() ?? Date.now(),
    };
  });
}

export async function deleteConcept(userId: string, conceptId: string) {
  await deleteDoc(doc(db, 'users', userId, 'concepts', conceptId));
}
