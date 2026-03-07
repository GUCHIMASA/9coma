import type { MangaItem } from '@/types';

// モックストレージ（サーバーサイド用）
// ※実際のFirebaseが設定されていない間、同一プロセス内ならメモリを共有できるが、
// Next.jsのデベロップメントモードではリロードで消える可能性がある。
// 本来はFirestoreを使うべき。
const mockStore: Record<string, { slots: (MangaItem | null)[]; authorName: string; createdAt: number }> = {};

export async function getListById(id: string) {
  // Firebaseが設定されている場合はFirestoreから取得
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'lists', id));
      if (snap.exists()) {
        return { ...snap.data(), id } as { slots: (MangaItem | null)[]; authorName: string; createdAt: number; id: string };
      }
    } catch (e) {
      console.error('Firestore error in getListById:', e);
    }
  }

  // モック（APIルートのmockStoreとは別になる可能性が高いが、OGP確認用にダミーデータを返す）
  return {
    id,
    authorName: '名無し',
    slots: Array(9).fill(null),
    createdAt: Date.now()
  };
}
