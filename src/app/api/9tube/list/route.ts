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
