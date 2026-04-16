import { cache } from 'react';
import type { MangaItem } from '@/types';
import type { YouTubeSlot } from '@/types/youtube';

// サーバーサイド用ユーティリティ
// cache() でラップすることで、同一リクエスト内での重複呼び出しをメモ化し、Firestoreへのアクセスを1回に制限します。
export const getListById = cache(async (id: string) => {
  console.log(`[Firestore] Physical access triggered for list: ${id}`);
  // Firebaseが設定されている場合はFirestoreから取得
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, getDoc, setDoc, collection, query, where, documentId, getDocs } = await import('firebase/firestore/lite');
      const snap = await getDoc(doc(db, 'lists', id));
      if (snap.exists()) {
        const rawData = snap.data();
        const data = rawData as { slots: (MangaItem | string | null)[]; authorName: string; theme?: string; colorThemeId?: string; createdAt: number };

        // 1. ハイドレーションが必要な ISBN を抽出
        const isbnsToFetch = new Set<string>();
        data.slots.forEach(slot => {
          if (!slot) return;
          const isIsbnString = typeof slot === 'string' && slot.length > 0;
          const slotAsObj = slot as unknown as Record<string, unknown>;
          
          // 完全なデータ（title, imageUrl）を持っているか判定
          const hasCompleteData = typeof slot === 'object' && slotAsObj.title && slotAsObj.imageUrl;

          if (isIsbnString || !hasCompleteData) {
            const isbn = isIsbnString ? (slot as string) : (slotAsObj.isbn as string);
            if (isbn) isbnsToFetch.add(isbn);
          }
        });

        // 2. キャッシュから一括取得 (Batch Read)
        const cacheMap = new Map<string, MangaItem>();
        if (isbnsToFetch.size > 0) {
          console.log(`[BatchRead] Fetching ${isbnsToFetch.size} manga items from cache for list ${id}`);
          const q = query(collection(db, 'manga_cache'), where(documentId(), 'in', Array.from(isbnsToFetch)));
          const cacheSnaps = await getDocs(q);
          cacheSnaps.forEach(s => cacheMap.set(s.id, s.data() as MangaItem));
        }

        // 3. スロットの補完
        const hydratedSlots = await Promise.all(
          data.slots.map(async (slot) => {
            if (!slot) return null;
            const isIsbnString = typeof slot === 'string' && slot.length > 0;
            const slotAsObj = slot as unknown as Record<string, unknown>;
            const isbn = isIsbnString ? (slot as string) : (slotAsObj.isbn as string);
            
            // すでにデータが揃っている場合はそのまま返す
            if (typeof slot === 'object' && slotAsObj.title && slotAsObj.imageUrl) {
              return slot as MangaItem;
            }

            if (cacheMap.has(isbn)) {
              const cached = cacheMap.get(isbn)!;
              if (cached.seriesName) return cached;
            }

            // キャッシュにない、または不完全な場合はフォールバック
            if (isIsbnString || (typeof slot === 'object' && (!slotAsObj.imageUrl || slotAsObj.seriesName === undefined))) {
              console.log(`[Hydration] Fallback for ISBN: ${isbn}`);
              const appId = process.env.RAKUTEN_APPLICATION_ID;
              if (appId && appId !== 'your_rakuten_app_id_here') {
                try {
                  const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404');
                  url.searchParams.set('applicationId', appId);
                  url.searchParams.set('isbn', isbn);
                  url.searchParams.set('formatVersion', '2');
                  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
                  const res = await fetch(url.toString(), {
                    headers: accessKey ? { 'Authorization': `Bearer ${accessKey}` } : {},
                    next: { revalidate: 86400 }
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
                      itemUrl: item.itemUrl,
                      affiliateUrl: item.affiliateUrl || item.itemUrl,
                    };
                    await setDoc(doc(db, 'manga_cache', isbn), { ...manga, updatedAt: Date.now() }, { merge: true });
                    return manga;
                  }
                } catch (e) {
                  console.error(`[Hydration] Rakuten API error for ${isbn}:`, e);
                }
              }
              return typeof slot === 'object' ? (slot as unknown as MangaItem) : { isbn, title: '不明なマンガ', seriesName: '', author: '', imageUrl: '', itemUrl: '', affiliateUrl: '' };
            }
            return slot as MangaItem;
          })
        );
        return { ...data, slots: hydratedSlots, id } as { slots: (MangaItem | null)[]; authorName: string; theme?: string; colorThemeId?: string; createdAt: number; id: string };
      }
    } catch (e) {
      console.error('Firestore error in getListById:', e);
    }
  }

  // モック
  return {
    id,
    authorName: '私',
    theme: undefined,
    colorThemeId: '01',
    slots: Array(9).fill(null),
    createdAt: Date.now()
  } as { slots: (MangaItem | null)[]; authorName: string; theme?: string; colorThemeId?: string; createdAt: number; id: string };
});

// 最新のリストを取得する
export const getRecentLists = cache(async (limitCount: number = 6) => {
  console.log(`[Firestore] Physical access triggered for getRecentLists (limit: ${limitCount})`);
  const projectId = process.env.NEXT_PUBLIC_BASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, query, orderBy, limit, getDocs, where, documentId } = await import('firebase/firestore/lite');
      
      const q = query(
        collection(db, 'lists'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snaps = await getDocs(q);
      const listDocs = snaps.docs.map(snap => ({ id: snap.id, ...snap.data() } as { id: string; slots: (MangaItem | string | null)[]; authorName: string; theme?: string; createdAt: number }));
      
      // 1. 全リストからハイドレーションが必要な ISBN を一括抽出
      const isbnsToFetch = new Set<string>();
      listDocs.forEach(list => {
        list.slots.forEach(slot => {
          if (typeof slot === 'string' && slot.length > 0) {
            isbnsToFetch.add(slot);
          } else if (slot && typeof slot === 'object') {
            const s = slot as MangaItem;
            // title, imageUrl, author のいずれかが欠けている場合にハイドレーション対象とする
            if (!s.title || !s.imageUrl || !s.author) {
              if (s.isbn) isbnsToFetch.add(s.isbn);
            }
          }
        });
      });

      // 2. キャッシュから一括取得 (30件制限を考慮してチャンク化)
      const cacheMap = new Map<string, MangaItem>();
      if (isbnsToFetch.size > 0) {
        const isbnList = Array.from(isbnsToFetch);
        const chunks = [];
        for (let i = 0; i < isbnList.length; i += 30) {
          chunks.push(isbnList.slice(i, i + 30));
        }

        console.log(`[BatchRead] Fetching ${isbnsToFetch.size} manga items in ${chunks.length} chunks for getRecentLists`);
        
        await Promise.all(
          chunks.map(async (chunk) => {
            const cacheQuery = query(collection(db, 'manga_cache'), where(documentId(), 'in', chunk));
            const cacheSnaps = await getDocs(cacheQuery);
            cacheSnaps.forEach(s => cacheMap.set(s.id, s.data() as MangaItem));
          })
        );
      }

      // 3. 各リストのハイドレーションを適用
      const results = listDocs.map(list => {
        const hydratedSlots = list.slots.map(slot => {
          if (!slot) return null;
          const isIsbnString = typeof slot === 'string';
          const isbn = isIsbnString ? (slot as string) : (slot as MangaItem).isbn;
          
          if (cacheMap.has(isbn)) {
            const cached = cacheMap.get(isbn)!;
            if (cached.seriesName) return cached;
          }
          
          if (isIsbnString) {
            return { isbn, title: '不明なマンガ', seriesName: '', author: '', imageUrl: '', itemUrl: '', affiliateUrl: '' };
          }
          return slot as MangaItem;
        });
        
        return { ...list, slots: hydratedSlots };
      });
      
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
      const { collection, query, where, getDocs, limit } = await import('firebase/firestore/lite');
      
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
      const { collection, query, where, getDocs, limit } = await import('firebase/firestore/lite');
      
      // 著者スラッグ（スペースなし）を生成
      const authorSlug = authorName.replace(/[\s\u3000]/g, '');
      
      // 著者スラッグが含まれるリストを取得
      const q = query(
        collection(db, 'lists'),
        where('author_slugs', 'array-contains', authorSlug),
        limit(500)
      );
      
      const snaps = await getDocs(q);
      let totalSelectionCount = 0;
      
      snaps.docs.forEach(snap => {
        const data = snap.data() as { slots: (MangaItem | string | null)[] };
        if (data.slots) {
          // 各スロット内で著者が一致するものをカウント
          const countInList = data.slots.filter(slot => {
            if (!slot || typeof slot === 'string') return false; 
            const slotAuthor = (slot.author || '').trim();
            // スラッグ化して比較することで表記揺れを吸収
            const slotAuthorSlug = slotAuthor.replace(/[\s\u3000]/g, '');
            return slotAuthorSlug === authorSlug;
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
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore/lite');
      
      // 著者スラッグ（スペースなし）を生成
      const authorSlug = authorName.replace(/[\s\u3000]/g, '');
      
      // author_slugs 配列 (array-contains) による検索
      console.log(`[Firestore] Querying with authorSlug: "${authorSlug}"`);
      const q = query(
        collection(db, 'lists'),
        where('author_slugs', 'array-contains', authorSlug),
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
// 最新のYouTube版リストを取得する
export const getRecentYtLists = cache(async (limitCount: number = 9) => {
  console.log(`[Firestore] Physical access triggered for getRecentYtLists (limit: ${limitCount})`);
  const projectId = process.env.NEXT_PUBLIC_BASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== 'your_project_id') {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore/lite');
      
      const q = query(
        collection(db, '9tube_lists'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snaps = await getDocs(q);
      return snaps.docs.map(snap => ({ 
        id: snap.id, 
        ...snap.data() 
      } as { 
        id: string; 
        slots: (YouTubeSlot | null)[]; 
        authorName: string; 
        theme?: string; 
        themeId?: string;
        colorThemeId?: string;
        createdAt: number 
      }));
    } catch (e) {
      console.error('Firestore error in getRecentYtLists:', e);
    }
  }
  return [];
});
