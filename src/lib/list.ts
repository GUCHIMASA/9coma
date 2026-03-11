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
        const data = snap.data() as { slots: (MangaItem | string | null)[]; authorName: string; theme?: string; createdAt: number };
        
        // データの補完 (ISBNのみの場合にキャッシュから情報を取得)
        const hydratedSlots = await Promise.all(
          data.slots.map(async (slot) => {
            if (typeof slot === 'string') {
              // ISBN文字列のみの場合、キャッシュから取得を試みる
              try {
                const cacheSnap = await getDoc(doc(db, 'manga_cache', slot));
                if (cacheSnap.exists()) {
                  return cacheSnap.data() as MangaItem;
                }
              } catch (e) {
                console.error(`Cache fetch failed for ISBN ${slot}:`, e);
              }
              // キャッシュになければ最小限の情報で返す（画像は出ないが、タイトルだけは後で楽天から取るなどの拡張も可）
              return { isbn: slot, title: '読み込み中...', author: '', imageUrl: '', affiliateUrl: '' };
            }
            return slot as MangaItem | null;
          })
        );

        return { ...data, slots: hydratedSlots, id } as { slots: (MangaItem | null)[]; authorName: string; theme?: string; createdAt: number; id: string };
      }
    } catch (e) {
      console.error('Firestore error in getListById:', e);
    }
  }

  // モック
  return {
    id,
    authorName: '名無し',
    theme: undefined,
    slots: Array(9).fill(null),
    createdAt: Date.now()
  } as { slots: (MangaItem | null)[]; authorName: string; theme?: string; createdAt: number; id: string };
}
