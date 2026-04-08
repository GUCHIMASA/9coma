import { NextResponse } from 'next/server';
import { getListById } from '@/lib/list';
import type { MangaItem } from '@/types';

export const runtime = 'edge';

// リスト保存
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slots, authorName, theme, colorThemeId, deviceId } = body as { 
            slots: (MangaItem | null)[]; 
            authorName: string; 
            theme?: string;
            colorThemeId?: string;
            deviceId?: string;
        };

        if (!slots || !Array.isArray(slots) || slots.length !== 9) {
            return NextResponse.json({ error: '9枠のデータが必要です' }, { status: 400 });
        }

        const createdAt = Date.now();
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (!projectId || projectId === 'your_project_id') {
            return NextResponse.json({ error: '保存できません（データベース未設定）' }, { status: 500 });
        }

        try {
            const { db } = await import('@/lib/firebase');
            const { doc, setDoc, getDoc, collection } = await import('firebase/firestore');
            
            // IDの自動生成 (Firestoreの機能を利用)
            const listRef = doc(collection(db, 'lists'));
            const id = listRef.id;

            // 著者一覧の抽出
            const authors = Array.from(new Set(
                slots
                    .filter(s => s !== null && typeof s === 'object' && s.author)
                    .map(s => s!.author)
            ));

            // 著者スラッグの抽出
            const authorSlugs = Array.from(new Set(
                authors.map(a => a.replace(/[\s\u3000]/g, ''))
            ));
            
            // リストの保存
            await setDoc(listRef, { 
                slots, 
                authorName: authorName || '名無し', 
                authors,
                author_slugs: authorSlugs,
                ...(theme ? { theme } : {}), 
                ...(colorThemeId ? { colorThemeId } : {}),
                ...(deviceId ? { userId: deviceId } : {}),
                createdAt 
            });

            // マンガ情報のキャッシュ保存
            try {
                await Promise.allSettled(
                    slots.filter(s => s !== null).map(async (m) => {
                        const cacheRef = doc(db, 'manga_cache', m!.isbn);
                        const cacheSnap = await getDoc(cacheRef);
                        if (!cacheSnap.exists()) {
                            await setDoc(cacheRef, { ...m, updatedAt: Date.now() }, { merge: true });
                        }
                    })
                );
            } catch (ce) {
                console.error('Manga cache save error:', ce);
            }

            return NextResponse.json({ id });
        } catch (e) {
            console.error('Firestore save error:', e);
            return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
        }
    } catch {
        return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
    }
}

// リスト取得
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    try {
        // getListById を使用して取得。失敗時はモックに逃げずにエラーを返す。
        const data = await getListById(id);
        if (data) {
            return NextResponse.json({ ...data, id });
        }
        return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    } catch (e) {
        console.error('Error in API GET /api/list:', e);
        return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
    }
}
