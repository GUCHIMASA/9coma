import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const theme = searchParams.get('theme');

    // テーマ未指定の場合は空配列を返す
    if (!theme) {
        return NextResponse.json({ items: [] });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId || projectId === 'your_project_id') {
        // Firebase未設定時は空配列
        return NextResponse.json({ items: [] });
    }

    try {
        const { db } = await import('@/lib/firebase');
        const { collection, query, where, limit, getDocs } = await import('firebase/firestore');

        // listsコレクションからthemeが一致するドキュメントを取得（複合インデックス不要）
        const q = query(
            collection(db, 'lists'),
            where('theme', '==', theme),
            limit(20)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
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

        return NextResponse.json({ items: sorted });
    } catch (e) {
        console.error('Popular API error:', e);
        return NextResponse.json({ items: [] });
    }
}
