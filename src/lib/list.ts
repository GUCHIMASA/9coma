import type { MangaItem } from '@/types';

// サーバーサイド用ユーティリティ

export async function getListById(id: string) {
  // Firebaseが設定されている場合はFirestoreから取得
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, getDoc, setDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'lists', id));
      if (snap.exists()) {
        const data = snap.data() as { slots: (MangaItem | string | null)[]; authorName: string; theme?: string; createdAt: number };
        
        // データの補完 (ISBNのみの場合にキャッシュから情報を取得)
        console.log(`[Hydration] Starting hydration for list ${id}. Author: ${data.authorName}`);
        const hydratedSlots = await Promise.all(
          data.slots.map(async (slot, idx) => {
            if (typeof slot === 'string' && slot.length > 0) {
              console.log(`[Hydration] Slot ${idx}: Found ISBN string ${slot}. Checking cache...`);
              // ISBN文字列のみの場合、キャッシュから取得を試みる
              try {
                const cacheSnap = await getDoc(doc(db, 'manga_cache', slot));
                if (cacheSnap.exists()) {
                  console.log(`[Hydration] Slot ${idx}: Cache HIT for ISBN ${slot}`);
                  return cacheSnap.data() as MangaItem;
                }
                
                console.log(`[Hydration] Slot ${idx}: Cache MISS for ISBN ${slot}. Trying fallback to Rakuten API...`);
                // キャッシュになければ、一度だけ楽天APIから直接取得を試みる（救済策）
                const appId = process.env.RAKUTEN_APPLICATION_ID;
                if (appId && appId !== 'your_rakuten_app_id_here') {
                  const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404');
                  url.searchParams.set('applicationId', appId);
                  url.searchParams.set('isbn', slot);
                  url.searchParams.set('formatVersion', '2');
                  
                  const res = await fetch(url.toString());
                  const resData = await res.json();
                  if (resData.Items && resData.Items.length > 0) {
                    const item = resData.Items[0];
                    const manga: MangaItem = {
                      isbn: item.isbn,
                      title: item.title,
                      author: item.author,
                      imageUrl: item.largeImageUrl,
                      affiliateUrl: item.affiliateUrl || item.itemUrl,
                    };
                    console.log(`[Hydration] Slot ${idx}: Successfully fetched from Rakuten for ISBN ${slot}. Saving to cache...`);
                    // ついでにキャッシュに保存しておく
                    await setDoc(doc(db, 'manga_cache', slot), { ...manga, updatedAt: Date.now() });
                    return manga;
                  } else {
                    console.warn(`[Hydration] Slot ${idx}: Rakuten API returned no results for ISBN ${slot}`);
                  }
                }
              } catch (e) {
                console.error(`[Hydration] Slot ${idx}: Error during hydration for ISBN ${slot}:`, e);
              }
              // 全て失敗した場合は最小限の情報で返す
              return { isbn: slot, title: '不明なマンガ', author: '', imageUrl: '', affiliateUrl: '' };
            }
            return slot as MangaItem | null;
          })
        );
        console.log(`[Hydration] Completed hydration for list ${id}`);

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
