import { NextResponse } from 'next/server';

export const runtime = 'edge';
import type { MangaItem } from '@/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const title = searchParams.get('title') || '';
    const author = searchParams.get('author') || '';
    const isbn = searchParams.get('isbn') || '';
    const page = searchParams.get('page') || '1';
    const sort = searchParams.get('sort') || 'standard';

    const appId = process.env.RAKUTEN_APPLICATION_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;
    const affiliateId = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID;

    if (!appId || appId === 'your_rakuten_app_id_here') {
        return NextResponse.json({ items: [], error: 'APIキー未設定' }, { status: 500 });
    }

    try {
        const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404');
        url.searchParams.set('format', 'json');
        url.searchParams.set('applicationId', appId);
        if (accessKey) url.searchParams.set('accessKey', accessKey);
        if (affiliateId) url.searchParams.set('affiliateId', affiliateId);

        if (isbn) {
            url.searchParams.set('isbn', isbn.replace(/-/g, ''));
        } else {
            if (keyword) url.searchParams.set('keyword', keyword);
            if (title) url.searchParams.set('title', title);
            if (author) url.searchParams.set('author', author);
            url.searchParams.set('page', page);
            url.searchParams.set('sort', sort);
            url.searchParams.set('hits', '30');
        }
        
        url.searchParams.set('booksGenreId', '001001'); // 漫画ジャンル
        url.searchParams.set('formatVersion', '2');
        url.searchParams.set('outOfStockFlag', '1'); // 在庫なし・絶版も含める

        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Referer': 'https://9coma.com',
            'Origin': 'https://9coma.com'
        };

        const response = await fetch(url.toString(), { 
            headers,
            next: { revalidate: 3600 } 
        });
        const data = await response.json();

        if (data.error || data.errors || !data.Items) {
            const rawError = data.error_description || data.error || data.errors;
            console.error('[SearchAPI] Rakuten API error:', rawError);
            return NextResponse.json({ 
                items: [], 
                error: 'APIエラー',
                rawError: rawError,
                details: typeof rawError === 'string' ? rawError : JSON.stringify(rawError)
            }, { status: 500 });
        }

        if (data.Items && Array.isArray(data.Items)) {
            interface RakutenBookItem {
                isbn: string;
                title: string;
                author: string;
                publisherName: string;
                largeImageUrl: string;
                itemUrl: string;
                affiliateUrl?: string;
                salesDate: string;
                seriesName: string;
            }

            const items: MangaItem[] = data.Items.map((item: RakutenBookItem) => ({
                isbn: item.isbn,
                title: item.title,
                author: item.author,
                publisher: item.publisherName,
                imageUrl: item.largeImageUrl ? item.largeImageUrl.replace('?_ex=200x200', '?_ex=400x400') : '',
                itemUrl: item.itemUrl,
                affiliateUrl: item.affiliateUrl || item.itemUrl,
                releaseDate: item.salesDate,
                seriesName: item.seriesName
            }));

            const filteredItems = items.filter(item => {
                const t = item.title.toLowerCase();
                return !t.includes('セット') && !t.includes('中古');
            });

            return NextResponse.json({ 
                items: filteredItems, 
                totalCount: data.count || filteredItems.length,
                page: parseInt(page),
                hits: 30
            });
        }

        return NextResponse.json({ items: [], count: 0 });

    } catch (error) {
        console.error('[SearchAPI] Fetch error:', error);
        return NextResponse.json({ items: [], error: '取得エラー' }, { status: 500 });
    }
}
