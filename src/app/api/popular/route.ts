import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 3600; // 1時間ごとに再生成 (ISR)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const theme = searchParams.get('theme');

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId || projectId === 'your_project_id') {
        // Firebase未設定時は空配列
        return NextResponse.json({ items: [] });
    }

    try {
        const { db } = await import('@/lib/firebase');
        const { collection, query, where, limit, getDocs } = await import('firebase/firestore/lite');

        let q;
        if (theme) {
            // テーマが指定されている場合
            q = query(
                collection(db, 'lists'),
                where('theme', '==', theme),
                limit(20)
            );
        } else {
            // テーマ未指定：まずは単純に取得（orderBy によるインデックスエラー回避のため）
            q = query(
                collection(db, 'lists'),
                limit(50)
            );
        }
        
        const snapshot = await getDocs(q).catch(err => {
            console.error('[PopularAPI] Firestore query error:', err);
            return { empty: true, docs: [] };
        });

        if (snapshot.empty) {
            console.log('[PopularAPI] No lists found for theme:', theme || 'global-trend');
            return NextResponse.json({ items: [] });
        }

        // 全slotsを集め、isbnをキーに出現回数をカウント
        const mangaMap: Record<string, { title: string; seriesName: string; author: string; imageUrl: string; isbn: string; count: number }> = {};

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const slots = data.slots as Array<{ title?: string; author?: string; imageUrl?: string; isbn?: string } | null> | undefined;
            if (!slots || !Array.isArray(slots)) return;

            slots.forEach((manga: { title?: string; seriesName?: string; author?: string; imageUrl?: string; isbn?: string } | null) => {
                if (!manga || !manga.isbn) return;
                if (mangaMap[manga.isbn]) {
                    mangaMap[manga.isbn].count += 1;
                } else {
                    mangaMap[manga.isbn] = {
                        title: manga.title || '',
                        seriesName: manga.seriesName || '',
                        author: manga.author || '',
                        imageUrl: manga.imageUrl || '',
                        isbn: manga.isbn,
                        count: 1,
                    };
                }
            });
        });

        // 出現回数の多い順にソートし上位12件を返す
        const sorted = Object.values(mangaMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 12);

        return NextResponse.json({ items: sorted }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            }
        });
    } catch (e) {
        console.error('Popular API error:', e);
        return NextResponse.json({ items: [] });
    }
}
