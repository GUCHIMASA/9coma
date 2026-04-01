import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // 開発用モックデータ
    return NextResponse.json({
      items: [
        {
          id: 'videoId1',
          title: '【モック】作業用BGM 癒やしのピアノメドレー',
          thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          channelTitle: 'Relaxing Music Channel',
          type: 'video'
        },
        {
          id: 'channelId1',
          title: '【モック】料理研究家リュウジのバズレシピ',
          thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_nF_S_Z_y_X_P_U_U_Z_V_W_X_Y_Z_A_B_C_D=s176-c-k-c0x00ffffff-no-rj',
          channelTitle: '料理研究家リュウジのバズレシピ',
          type: 'channel'
        }
      ]
    });
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(q)}&type=video,channel&key=${apiKey}`
    );
    const data = await res.json();

    const items = data.items?.map((item: any) => ({
      id: item.id.videoId || item.id.channelId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      type: item.id.kind === 'youtube#channel' ? 'channel' : 'video',
      publishedAt: item.snippet.publishedAt
    })) || [];

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
