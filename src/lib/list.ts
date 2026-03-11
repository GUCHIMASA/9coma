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
        const rawData = snap.data();
        // 開発時の調査用ログ
        console.log(`[Diagnostic] Raw Firestore data for list ${id}:`, JSON.stringify(rawData));
        
        const data = rawData as { slots: (MangaItem | string | null)[]; authorName: string; theme?: string; createdAt: number };
        
        // データの補完 (ISBNのみの場合、または画像URLがない場合にキャッシュから情報を取得)
        console.log(`[Hydration] Starting hydration for list ${id}. Author: ${data.authorName}`);
        
        const hydratedSlots = await Promise.all(
          data.slots.map(async (slot, idx) => {
            const isIsbnString = typeof slot === 'string' && slot.length > 0;
            // オブジェクトかつ画像URLが実質的にない（欠落、null、または空文字）、かつISBNがある場合を判定
            const isObject = slot !== null && typeof slot === 'object';
            const slotAsObj = slot as unknown as Record<string, unknown>;
            const isMissingImageUrl = isObject && (!slotAsObj.imageUrl || slotAsObj.imageUrl === '') && ('isbn' in slotAsObj);
            
            if (isIsbnString || isMissingImageUrl) {
              const isbn = isIsbnString ? (slot as string) : (slotAsObj.isbn as string);
              console.log(`[Hydration] Slot ${idx}: Needs hydration. ISBN: ${isbn}. Trigger: ${isIsbnString ? 'String' : 'FalsyURL'}`);
              
              // ISBNを使ってキャッシュまたは楽天から情報を復元
              try {
                const cacheSnap = await getDoc(doc(db, 'manga_cache', isbn));
                if (cacheSnap.exists()) {
                  console.log(`[Hydration] Slot ${idx}: Cache HIT for ISBN ${isbn}`);
                  return cacheSnap.data() as MangaItem;
                }
                
                console.log(`[Hydration] Slot ${idx}: Cache MISS for ISBN ${isbn}. Trying fallback to Rakuten API...`);
                // キャッシュになければ、一度だけ楽天APIから直接取得を試める（救済策）
                const appId = process.env.RAKUTEN_APPLICATION_ID;
                if (appId && appId !== 'your_rakuten_app_id_here') {
                  const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404');
                  url.searchParams.set('applicationId', appId);
                  url.searchParams.set('isbn', isbn);
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
                    console.log(`[Hydration] Slot ${idx}: Successfully fetched from Rakuten for ISBN ${isbn}. Saving to cache...`);
                    await setDoc(doc(db, 'manga_cache', isbn), { ...manga, updatedAt: Date.now() });
                    return manga;
                  } else {
                    console.warn(`[Hydration] Slot ${idx}: Rakuten API returned no results for ISBN ${isbn}`);
                  }
                }
              } catch (e) {
                console.error(`[Hydration] Slot ${idx}: Error during hydration for ISBN ${isbn}:`, e);
              }
              // 全て失敗した場合は（あったものを活かすか、ISBNだけのオブジェクトを返す）
              return typeof slot === 'object' ? slot : { isbn: isbn, title: '不明なマンガ', author: '', imageUrl: '', affiliateUrl: '' };
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
