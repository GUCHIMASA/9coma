import { NextResponse } from 'next/server';
import { getListById } from '@/lib/list';

export const runtime = 'edge';

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
