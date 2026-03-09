import type { MangaItem } from '@/types';

// サーバーサイド用ユーティリティ

export async function getListById(id: string) {
  // Firebaseが設定されている場合はFirestoreから取得
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'lists', id));
      if (snap.exists()) {
        return { ...snap.data(), id } as { slots: (MangaItem | null)[]; authorName: string; theme?: string; createdAt: number; id: string };
      }
    } catch (e) {
      console.error('Firestore error in getListById:', e);
    }
  }

  // モック（APIルートのmockStoreとは別になる可能性が高いが、OGP確認用にダミーデータを返す）
  return {
    id,
    authorName: '名無し',
    theme: undefined,
    slots: Array(9).fill(null),
    createdAt: Date.now()
  } as { slots: (MangaItem | null)[]; authorName: string; theme?: string; createdAt: number; id: string };
}
