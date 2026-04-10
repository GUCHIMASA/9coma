import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, serverTimestamp, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { nanoid } from 'nanoid';

export const runtime = 'edge';

// GET: リストの取得
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

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

    // パラメータがない場合は最新のリストを返す（必要に応じて）
    const q = query(
      collection(db, '9tube_lists'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const lists = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error in GET /api/9tube/list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: リストの保存
export async function POST(req: Request) {
  // --- 診断ログ (原因特定後に削除) ---
  console.log('[DEBUG-ENV] Firestore Config Status:');
  console.log(' - API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'YES' : 'MISSING');
  console.log(' - PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'YES' : 'MISSING');
  console.log(' - AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'YES' : 'MISSING');
  console.log(' - APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'YES' : 'MISSING');
  console.log(' - YOUTUBE_KEY:', process.env.YOUTUBE_API_KEY ? 'YES' : 'MISSING');
  // --------------------------------

  try {
    const data = await req.json();
    const { slots, authorName, theme, colorThemeId, themeId, deviceId } = data;

    // バリデーション: 少なくとも1つのスロットが埋まっていること
    const filledSlots = slots.filter((s: unknown) => s !== null);
    if (filledSlots.length === 0) {
      return NextResponse.json({ error: 'At least one slot must be filled' }, { status: 400 });
    }

    // カスタムIDの生成 (nanoid 10文字)
    const customId = nanoid(10);

    // 9tube_lists コレクションに保存
    await setDoc(doc(db, '9tube_lists', customId), {
      slots,
      authorName: authorName || '私',
      theme: theme || '',
      colorThemeId: colorThemeId || '01',
      themeId: themeId || 'default',
      deviceId: deviceId || 'unknown',
      createdAt: serverTimestamp(),
      type: 'youtube'
    });

    return NextResponse.json({ id: customId });
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
