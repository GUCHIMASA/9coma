import { cache } from 'react';
import type { MangaItem } from '@/types';

// サーバーサイド用ユーティリティ
// cache() でラップすることで、同一リクエスト内での重複呼び出しをメモ化し、Firestoreへのアクセスを1回に制限します。
export const getListById = cache(async (id: string) => {
  console.log(`[Firestore] Physical access triggered for list: ${id}`);
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
            // オブジェクトかつ画像URLが実質的にない、またはシリーズ名が欠落している、かつISBNがある場合を判定
            const isObject = slot !== null && typeof slot === 'object';
            const slotAsObj = slot as unknown as Record<string, unknown>;
            const isMissingImageUrl = isObject && (!slotAsObj.imageUrl || slotAsObj.imageUrl === '') && ('isbn' in slotAsObj);
            const isMissingSeriesName = isObject && (slotAsObj.seriesName === undefined) && ('isbn' in slotAsObj);
            
            if (isIsbnString || isMissingImageUrl || isMissingSeriesName) {
              const isbn = isIsbnString ? (slot as string) : (slotAsObj.isbn as string);
              console.log(`[Hydration] Slot ${idx}: Needs hydration. ISBN: ${isbn}. Trigger: ${isIsbnString ? 'String' : (isMissingImageUrl ? 'FalsyURL' : 'MissingSeries')}`);
              
              // ISBNを使ってキャッシュまたは楽天から情報を復元
              try {
                const cacheSnap = await getDoc(doc(db, 'manga_cache', isbn));
                if (cacheSnap.exists()) {
                  const cachedManga = cacheSnap.data() as MangaItem;
                  // シリーズ名がある場合はそのまま返す
                  if (cachedManga.seriesName && cachedManga.seriesName !== '') {
                    console.log(`[Hydration] Slot ${idx}: Cache HIT with SeriesName for ISBN ${isbn}`);
                    return cachedManga;
                  }
                  console.log(`[Hydration] Slot ${idx}: Cache HIT but MISSING SeriesName for ISBN ${isbn}. Re-fetching...`);
                }
                
                console.log(`[Hydration] Slot ${idx}: Fetching from Rakuten API to heal data. ISBN: ${isbn}`);
                // キャッシュにない、またはシリーズ名が欠落している場合は楽天APIから取得
                const appId = process.env.RAKUTEN_APPLICATION_ID;
                if (appId && appId !== 'your_rakuten_app_id_here') {
                  // seriesName を確実に取得するため BooksBook を使用
                  const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404');
                  url.searchParams.set('applicationId', appId);
                  url.searchParams.set('isbn', isbn);
                  url.searchParams.set('formatVersion', '2');
                  
                  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://9coma.com';
                  const headers: Record<string, string> = {
                    'Referer': baseUrl,
                    'Origin': baseUrl,
                  };
                  if (accessKey) {
                    headers['Authorization'] = `Bearer ${accessKey}`;
                  }

                  const res = await fetch(url.toString(), {
                    headers,
                  });
                  const resData = await res.json();
                  if (resData.Items && resData.Items.length > 0) {
                    const item = resData.Items[0];
                    const manga: MangaItem = {
                      isbn: item.isbn,
                      title: item.title,
                      seriesName: item.seriesName || '',
                      author: item.author,
                      imageUrl: item.largeImageUrl,
                      affiliateUrl: item.affiliateUrl || item.itemUrl,
                    };
                    console.log(`[Hydration] Slot ${idx}: Successfully healed seriesName for ISBN ${isbn}. Updating cache...`);
                    await setDoc(doc(db, 'manga_cache', isbn), { ...manga, updatedAt: Date.now() }, { merge: true });
                    return manga;
                  } else {
                    if (resData.errors || resData.error) {
                      console.warn(`[Hydration] Slot ${idx}: Rakuten API Error:`, resData.errors || resData.error);
                    } else {
                      console.warn(`[Hydration] Slot ${idx}: Rakuten API returned no results for ISBN ${isbn} during healing`);
                    }
                  }
                }
              } catch (e) {
                console.error(`[Hydration] Slot ${idx}: Error during healing for ISBN ${isbn}:`, e);
              }
              // 全て失敗した場合は（あったものを活かすか、ISBNだけのオブジェクトを返す）
              return typeof slot === 'object' ? slot : { isbn: isbn, title: '不明なマンガ', seriesName: '', author: '', imageUrl: '', affiliateUrl: '' };
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
});

// 最新のリストを取得する
export const getRecentLists = cache(async (limitCount: number = 6) => {
  console.log(`[Firestore] Physical access triggered for getRecentLists (limit: ${limitCount})`);
  const projectId = process.env.NEXT_PUBLIC_BASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, query, orderBy, limit, getDocs, doc, getDoc } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'lists'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snaps = await getDocs(q);
      const results = await Promise.all(
        snaps.docs.map(async (snap) => {
          const id = snap.id;
          const data = snap.data() as { slots: (MangaItem | string | null)[]; authorName: string; theme?: string; createdAt: number };
          
          const hydratedSlots = await Promise.all(
            data.slots.map(async (slot) => {
              if (typeof slot === 'string' && slot.length > 0) {
                const cacheSnap = await getDoc(doc(db, 'manga_cache', slot));
                if (cacheSnap.exists()) return cacheSnap.data() as MangaItem;
                return { isbn: slot, title: '不明なマンガ', seriesName: '', author: '', imageUrl: '', affiliateUrl: '' };
              }
              return slot as MangaItem | null;
            })
          );
          
          return { ...data, slots: hydratedSlots, id };
        })
      );
      
      return results;
    } catch (e) {
      console.error('Firestore error in getRecentLists:', e);
      if (e instanceof Error && e.message.includes('index')) {
        console.error('Firestore needs an index! Please check the Firebase console URL in the error message.');
      }
    }
  }
  return [];
});
// 特定の著者の作品一覧を取得する
export const getMangaByAuthor = cache(async (authorName: string) => {
  console.log(`[Firestore] Fetching manga by author: ${authorName}`);
  const projectId = process.env.NEXT_PUBLIC_BASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'manga_cache'),
        where('author', '==', authorName),
        limit(50)
      );
      
      const snaps = await getDocs(q);
      const results = snaps.docs.map(snap => snap.data() as MangaItem);
      return results;
    } catch (e) {
      console.error('Firestore error in getMangaByAuthor:', e);
    }
  }
  return [];
});

// 著者が選ばれた累計コマ数を取得する (Phase 38 アップグレード)
export const getSelectionCountByAuthor = cache(async (authorName: string) => {
  console.log(`[Firestore] Calculating total selection count for author: ${authorName}`);
  const projectId = process.env.NEXT_PUBLIC_BASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
      
      // 著者が含まれるリストを取得（インデックスエラー回避のため orderBy を外し、limit を広めに設定）
      const q = query(
        collection(db, 'lists'),
        where('authors', 'array-contains', authorName),
        limit(500)
      );
      
      const snaps = await getDocs(q);
      let totalSelectionCount = 0;
      const normalizedAuthorName = authorName.trim();
      
      snaps.docs.forEach(snap => {
        const data = snap.data() as { slots: (MangaItem | string | null)[] };
        if (data.slots) {
          // 各スロット内で著者が一致するものをカウント
          const countInList = data.slots.filter(slot => {
            if (!slot || typeof slot === 'string') return false; 
            const slotAuthor = (slot.author || '').trim();
            // 完全一致または、共著などの場合を考慮して includes で判定
            return slotAuthor === normalizedAuthorName || slotAuthor.includes(normalizedAuthorName);
          }).length;
          totalSelectionCount += countInList;
        }
      });
      
      return totalSelectionCount;
    } catch (e) {
      console.error('Firestore error in getSelectionCountByAuthor:', e);
    }
  }
  return 0;
});

// 特定の著者の作品を含むリストを取得する
export const getListsByAuthor = cache(async (authorName: string, limitCount: number = 20) => {
  console.log(`[Firestore] Fetching lists containing works by author: ${authorName}`);
  const projectId = process.env.NEXT_PUBLIC_BASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore');
      
      // authors 配列 (array-contains) による検索 (Phase 38 新方式 - フォールバック削除済み)
      console.log(`[Firestore] Querying with authorName: "${authorName}"`);
      const q = query(
        collection(db, 'lists'),
        where('authors', 'array-contains', authorName),
        limit(limitCount)
      );
      
      const snaps = await getDocs(q);
      const results = snaps.docs.map(snap => ({
        ...snap.data(),
        id: snap.id
      })) as { id: string; slots: (MangaItem | null)[]; authorName: string; authors?: string[]; theme?: string; createdAt: number }[];
      
      return results;
    } catch (e) {
      console.error('Firestore error in getListsByAuthor:', e);
    }
  }
  return [];
});
