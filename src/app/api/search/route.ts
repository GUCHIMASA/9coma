import { NextResponse } from 'next/server';

// モック漫画データ（APIキー取得後に楽天APIへ差し替え）
const MOCK_MANGA: Record<string, Record<string, string>[]> = {
    'default': [
        {
            isbn: '9784088820934',
            title: 'ONE PIECE 1',
            author: '尾田 栄一郎',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0934/9784088820934.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/1234567/',
        },
        {
            isbn: '9784088742717',
            title: 'NARUTO -ナルト- 1',
            author: '岸本 斉史',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/2717/9784088742717.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/2345678/',
        },
        {
            isbn: '9784088717616',
            title: 'DRAGON BALL 1',
            author: '鳥山 明',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/7616/9784088717616.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/3456789/',
        },
        {
            isbn: '9784063288995',
            title: '進撃の巨人 1',
            author: '諫山 創',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/8995/9784063288995.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/4567890/',
        },
        {
            isbn: '9784819170000',
            title: '鬼滅の刃 1',
            author: '吾峠 呼世晴',
            imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0000/9784819170000.jpg',
            affiliateUrl: 'https://books.rakuten.co.jp/rb/5678901/',
        },
        {
            isbn: '9784088775401',
            title: '呪術廻戦 1',
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

    // 楽天APIキーが設定されている場合は楽天APIを叩く
    const appId = process.env.RAKUTEN_APPLICATION_ID;
    const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY; // 新API v2用

    if (appId && appId !== 'your_rakuten_app_id_here') {
        try {
            const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404');
            url.searchParams.set('applicationId', appId);
            url.searchParams.set('affiliateId', affiliateId || '');
            
            // BooksTotal APIは `title` や `author` を個別のパラメータとしてサポートしていないため、
            // 全ての要素を半角スペースで結合して強力な `keyword` 検索として処理します。
            const combinedKeywords = [title, author, keyword]
                .filter(term => term.trim() !== '')
                .join(' ');

            if (combinedKeywords) {
                url.searchParams.set('keyword', combinedKeywords);
            }
            
            url.searchParams.set('booksGenreId', '001001'); // 漫画・コミック
            url.searchParams.set('hits', '30');
            url.searchParams.set('formatVersion', '2');
            url.searchParams.set('outOfStockFlag', '1'); // 品切れ商品も検索に含める
            
            if (accessKey) {
                url.searchParams.set('accessKey', accessKey);
            }

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://9coma.com';
            const res = await fetch(url.toString(), {
                headers: {
                    'Referer': baseUrl,
                    'Origin': baseUrl,
                }
            });
            const data = await res.json();
            
            if (data.errors || data.error || !res.ok) {
                const errorMsg = data.errors?.[0]?.errorMessage || data.error_description || data.error || '不明なエラー';
                console.error('Rakuten API Error:', errorMsg, `(Status: ${res.status})`);
                return NextResponse.json({ error: errorMsg, items: [], isMock: false }, { status: 400 });
            }

            const items = (data.Items || []).map((item: { isbn: string; title: string; author: string; largeImageUrl: string; affiliateUrl?: string; itemUrl: string }) => {
                return {
                    isbn: item.isbn,
                    title: item.title,
                    author: item.author,
                    imageUrl: item.largeImageUrl,
                    affiliateUrl: item.affiliateUrl || item.itemUrl,
                };
            });
            return NextResponse.json({ items, isMock: false });
        } catch (error: unknown) {
            console.error('楽天API error:', error);
            return NextResponse.json({ items: [], isMock: true, error: error instanceof Error ? error.message : String(error) });
        }
    }

    // モックデータを返す（各フィールドでフィルタリング）
    const allItems = MOCK_MANGA['default'];
    const filtered = allItems.filter((item: Record<string, string>) => {
        const matchKeyword = !keyword || 
            item.title.toLowerCase().includes(keyword.toLowerCase()) || 
            item.author.toLowerCase().includes(keyword.toLowerCase());
        const matchTitle = !title || item.title.toLowerCase().includes(title.toLowerCase());
        const matchAuthor = !author || item.author.toLowerCase().includes(author.toLowerCase());
        
        return matchKeyword && matchTitle && matchAuthor;
    });

    return NextResponse.json({ items: filtered, isMock: true });
}
