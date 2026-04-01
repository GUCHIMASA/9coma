'use server';

import { YouTubeSlot } from '@/types/youtube';

/**
 * YouTubeのURLからメタデータを取得する Server Action
 * @param url ユーザーが入力したURL
 */
export async function getYoutubeMetadata(url: string): Promise<YouTubeSlot | null> {
  if (!url) return null;

  try {
    const isChannel = url.includes('/@') || url.includes('/channel/') || url.includes('/c/') || url.includes('/user/');
    
    if (isChannel) {
      // チャンネルの場合: HTMLスクレイピング
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'ja-JP,ja;q=0.9',
        },
        next: { revalidate: 3600 } // 1時間キャッシュ
      });

      if (!response.ok) return null;
      const html = await response.text();

      // og:title (チャンネル名)
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
      // og:image (アイコン)
      const imageMatch = html.match(/<meta property="og:image" content="([^"]+)">/);

      if (titleMatch && imageMatch) {
        return {
          type: 'channel',
          url: url,
          title: titleMatch[1].replace(' - YouTube', ''),
          imageUrl: imageMatch[1],
        };
      }
    } else {
      // 動画の場合: oEmbed API を利用
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oEmbedUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        // 動画IDの抽出 (サムネイルURLやURLから)
        let videoId = '';
        const vMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        if (vMatch) videoId = vMatch[1];

        return {
          type: 'video',
          url: url,
          title: data.title,
          imageUrl: data.thumbnail_url,
          channelName: data.author_name,
          videoId: videoId,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
  }

  return null;
}
