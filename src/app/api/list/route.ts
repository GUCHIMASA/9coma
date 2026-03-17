import { NextResponse } from 'next/server';
import { getListById } from '@/lib/list';
import type { MangaItem } from '@/types';

// モックストレージ（Firebase未設定時用）
const mockStore: Record<string, { slots: (MangaItem | null)[]; authorName: string; theme?: string; userId?: string; createdAt: number }> = {};

function generateId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// リスト保存
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slots, authorName, theme, deviceId } = body as { 
            slots: (MangaItem | null)[]; 
            authorName: string; 
            theme?: string;
            deviceId?: string;
        };

        if (!slots || !Array.isArray(slots) || slots.length !== 9) {
            return NextResponse.json({ error: '9枠のデータが必要です' }, { status: 400 });
        }

        const id = generateId();
        const createdAt = Date.now();

        // Firebaseが設定されている場合はFirestoreに保存
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (projectId && projectId !== 'your_project_id') {
            try {
                const { db } = await import('@/lib/firebase');
                const { doc, setDoc, getDoc } = await import('firebase/firestore');
                
                // 著者一覧の抽出
                const authors = Array.from(new Set(
                    slots
                        .filter(s => s !== null && typeof s === 'object' && s.author)
                        .map(s => s!.author)
                ));
                
                // リスト自体の保存
                await setDoc(doc(db, 'lists', id), { 
                    slots, 
                    authorName, 
                    authors,
                    ...(theme ? { theme } : {}), 
                    ...(deviceId ? { userId: deviceId } : {}),
                    createdAt 
                });

                // マンガ情報のキャッシュ保存 (救済・高速化用)
                try {
                    await Promise.all(
                        slots.filter(s => s !== null).map(async (m) => {
                            const cacheRef = doc(db, 'manga_cache', m!.isbn);
                            const cacheSnap = await getDoc(cacheRef);
                            // 既にキャッシュが存在する場合は書き込まない
                            if (!cacheSnap.exists()) {
                                await setDoc(cacheRef, { ...m, updatedAt: Date.now() }, { merge: true });
                            }
                        })
                    );
                } catch (ce) {
                    console.error('Manga cache save error in list POST:', ce);
                }

                return NextResponse.json({ id, isMock: false });
            } catch (e) {
                console.error('Firestore error:', e);
            }
        }

        // モックストレージに保存
        mockStore[id] = { 
            slots, 
            authorName, 
            ...(theme ? { theme } : {}), 
            ...(deviceId ? { userId: deviceId } : {}),
            createdAt 
        };
        return NextResponse.json({ id, isMock: true });
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

    // getListById ユーティリティを使用して取得（ハイドレーションと内部キャッシュの恩恵を受ける）
    try {
        const data = await getListById(id);
        if (data && data.authorName !== '名無し') {
            return NextResponse.json({ ...data, isMock: false });
        }
    } catch (e) {
        console.error('Error in API GET /api/list:', e);
    }

    // モックストレージから取得
    const data = mockStore[id];
    if (!data) {
        return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ ...data, id, isMock: true });
}
