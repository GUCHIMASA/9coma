import { NextResponse } from 'next/server';
import type { MangaItem } from '@/types';

// モック漫画データ（APIキー取得後に楽天APIへ差し替え）
const MOCK_MANGA: Record<string, Record<string, string>[]> = {
    'default': [
        {
            isbn: '9784088820934',
            title: 'ONE PIECE 1',
            seriesName: 'ONE PIECE',
            author: '尾田 栄一郎',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0934/9784088820934.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/1234567/',
        },
        {
            isbn: '9784088742717',
            title: 'NARUTO -ナルト- 1',
            seriesName: 'NARUTO-ナルト-',
            author: '岸本 斉史',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/2717/9784088742717.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/2345678/',
        },
        {
            isbn: '9784088717616',
            title: 'DRAGON BALL 1',
            seriesName: 'DRAGON BALL',
            author: '鳥山 明',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/7616/9784088717616.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/3456789/',
        },
        {
            isbn: '9784063288995',
            title: '進撃の巨人 1',
            seriesName: '進撃の巨人',
            author: '諫山 創',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/8995/9784063288995.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/4567890/',
        },
        {
            isbn: '9784819170000',
            title: '鬼滅の刃 1',
            seriesName: '鬼滅の刃',
            author: '吾峠 呼世晴',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0000/9784819170000.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/5678901/',
        },
        {
            isbn: '9784088775401',
            title: '呪術廻戦 1',
            seriesName: '呪術廻戦',
            author: '芥見 下々',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/5401/9784088775401.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/6789012/',
        },
    ],
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const title = searchParams.get('title') || '';
    const author = searchParams.get('author') || '';
    const isbn = searchParams.get('isbn') || '';

    // 楽天APIキー
    const appId = process.env.RAKUTEN_APPLICATION_ID;
    const affiliateId = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;

    if (appId && appId !== 'your_rakuten_app_id_here') {
        try {
            // ISBN 検索の確実性を。より広範な BooksTotal を使用。
            const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404');
            url.searchParams.set('applicationId', appId);
            url.searchParams.set('affiliateId', affiliateId || '');
            if (accessKey) url.searchParams.set('accessKey', accessKey);

            // パラメータを個別にセット
            // ISBN がある場合は、他の絞り込み条件やジャンル（1001:漫画等）を一切含めない（特定の本を確実に拾うため）
            if (isbn) {
                url.searchParams.set('isbnjan', isbn);
            } else {
                if (title) url.searchParams.set('title', title);
                if (author) url.searchParams.set('author', author);
                if (keyword) url.searchParams.set('keyword', keyword);
                url.searchParams.set('booksGenreId', '001001'); // 通常検索時は漫画に限定
            }

            if (!title && !author && !keyword && !isbn) {
                return NextResponse.json({ items: [], isMock: false, error: '検索キーワードを入力してください' }, { status: 400 });
            }

            url.searchParams.set('hits', '30');
            url.searchParams.set('formatVersion', '2');
            url.searchParams.set('outOfStockFlag', '1');

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
                next: { revalidate: 10800 }
            });
            const data = await res.json();

            if (!data.errors && !data.error && res.ok && data.Items) {
                interface RakutenItemDef {
                    isbn: string;
                    title: string;
                    seriesName?: string;
                    author: string;
                    largeImageUrl: string;
                    affiliateUrl?: string;
                    itemUrl?: string;
                }
                // フィルタリングせずそのまま返して、API 本来の結果を確認する
                const items = data.Items.map((item: RakutenItemDef) => ({
                    isbn: item.isbn,
                    title: item.title,
                    seriesName: item.seriesName,
                    author: item.author,
                    imageUrl: item.largeImageUrl,
                    affiliateUrl: item.affiliateUrl || item.itemUrl,
                }));

                // Firestore への保存を再開し、パフォーマンスを向上
                const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
                if (projectId && projectId !== 'your_project_id' && items.length > 0) {
                    import('@/lib/firebase').then(async ({ db }) => {
                        const { doc, setDoc, getDoc } = await import('firebase/firestore');

                        // 並列実行で効率化しつつ、エラーを適切にハンドル
                        await Promise.allSettled(
                            items.map(async (m: MangaItem) => {
                                try {
                                    const cacheRef = doc(db, 'manga_cache', m.isbn);
                                    const cacheSnap = await getDoc(cacheRef);
                                    // シリーズ名が未取得の場合、またはキャッシュがない場合のみ書き込む
                                    if (!cacheSnap.exists() || !cacheSnap.data()?.seriesName) {
                                        await setDoc(cacheRef, { ...m, updatedAt: Date.now() }, { merge: true });
                                    }
                                } catch (e) {
                                    console.error(`[SearchCache] Failed to cache ISBN ${m.isbn}:`, e);
                                }
                            })
                        );
                        console.log(`[SearchCache] Background caching completed for ${items.length} items`);
                    }).catch((e) => {
                        console.error('[SearchCache] Failed to load Firebase/Firestore for background caching:', e);
                    });
                }

                return NextResponse.json({ items, isMock: false });
            } else {
                console.warn('Rakuten API Error:', data.errors || data.error);
            }
        } catch (error) {
            console.error('Rakuten API fetch error:', error);
        }
    }

    // fallback to mock (basic selection)
    const allItems = MOCK_MANGA['default'];
    const filtered = allItems.filter((item: Record<string, string>) => {
        // ISBN が指定されている場合は最優先でフィルタ
        if (isbn && item.isbn !== isbn) return false;
        
        // ISBN 指定がない場合のみ他のあやふやなフィルタを通す
        if (!isbn) {
            if (title && !item.title.toLowerCase().includes(title.toLowerCase())) return false;
            if (author && !item.author.toLowerCase().includes(author.toLowerCase())) return false;
            if (keyword) {
                const k = keyword.toLowerCase();
                if (!item.title.toLowerCase().includes(k) && !item.author.toLowerCase().includes(k)) return false;
            }
        }
        return true;
    });

    return NextResponse.json({ items: filtered, isMock: true });
}
