import { NextResponse } from 'next/server';
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
                const { doc, setDoc } = await import('firebase/firestore');
                
                // リスト自体の保存
                await setDoc(doc(db, 'lists', id), { 
                    slots, 
                    authorName, 
                    ...(theme ? { theme } : {}), 
                    ...(deviceId ? { userId: deviceId } : {}),
                    createdAt 
                });

                // マンガ情報のキャッシュ保存 (救済・高速化用)
                try {
                    await Promise.all(
                        slots.filter(s => s !== null).map(m => 
                            setDoc(doc(db, 'manga_cache', m!.isbn), { ...m, updatedAt: Date.now() }, { merge: true })
                        )
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

    // Firebaseが設定されている場合はFirestoreから取得
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId && projectId !== 'your_project_id') {
        try {
            const { db } = await import('@/lib/firebase');
            const { doc, getDoc } = await import('firebase/firestore');
            const snap = await getDoc(doc(db, 'lists', id));
            if (snap.exists()) {
                return NextResponse.json({ ...snap.data(), id, isMock: false });
            }
        } catch (e) {
            console.error('Firestore error:', e);
        }
    }

    // モックストレージから取得
    const data = mockStore[id];
    if (!data) {
        return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }
    return NextResponse.json({ ...data, id, isMock: true });
}
