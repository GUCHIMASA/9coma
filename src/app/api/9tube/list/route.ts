import { NextResponse } from 'next/server';
import type { YouTubeSlot } from '@/types/youtube';

export const runtime = 'edge';

/**
 * GET: YouTube リストの一覧取得または特定 ID の取得
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Edge Runtime での巨大な Firebase SDK 読み込みによるクラッシュを回避するため「動的インポート」を採用
    const { db } = await import('@/lib/firebase');
    const { doc, getDoc, collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');

    if (id) {
      // 特定のIDのデータを取得
      const docRef = doc(db, '9tube_lists', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
      } else {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
    }

    // パラメータがない場合は最新の 10 件を返す
    const q = query(
      collection(db, '9tube_lists'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const lists = querySnapshot.docs.map(snap => ({
      id: snap.id,
      ...snap.data()
    }));

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error in GET /api/9tube/list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST: YouTube リストの新規保存
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { slots, authorName, theme, colorThemeId, themeId, deviceId } = data as {
      slots: (YouTubeSlot | null | undefined)[];
      authorName?: string;
      theme?: string;
      colorThemeId?: string;
      themeId?: string;
      deviceId?: string;
    };

    // 動的インポート
    const { db } = await import('@/lib/firebase');
    const { doc, setDoc, collection } = await import('firebase/firestore');

    // バリデーション: 少なくとも1つのスロットが埋まっていること (null/undefined 両方を排除)
    const filledSlots = slots.filter((s) => s != null);
    if (filledSlots.length === 0) {
      return NextResponse.json({ error: 'At least one slot must be filled' }, { status: 400 });
    }

    const createdAt = Date.now();
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId || projectId === 'your_project_id') {
      return NextResponse.json({ error: '保存できません（データベース未設定）' }, { status: 500 });
    }

    // IDの自動生成 (Firestoreの標準機能を利用)
    const listRef = doc(collection(db, '9tube_lists'));
    const id = listRef.id;

    // データクレンジング: Edge Runtime (Cloudflare) での 1101 クラッシュを回避するため、
    // Firestore SDK が許容しない undefined プロパティを完全に排除する。
    const docData = JSON.parse(JSON.stringify({
      slots,
      authorName: authorName || '私',
      theme: theme || '',
      colorThemeId: colorThemeId || '01',
      themeId: themeId || 'default',
      deviceId: deviceId || 'unknown',
      createdAt,
      type: 'youtube'
    }));

    // 9tube_lists コレクションに保存
    await setDoc(listRef, docData);

    return NextResponse.json({ id });
  } catch (error: unknown) {
    console.error('Error adding document to 9tube_lists: ', error);
    const err = error as Error & { code?: string };
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: err.message || String(error),
      code: err.code || 'unknown'
    }, { status: 500 });
  }
}
