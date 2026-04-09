'use server';

import { YouTubeSlot } from '@/types/youtube';

/**
 * YouTubeのURLからメタデータを取得する Server Action
 * @param url ユーザーが入力したURL
 */
export async function getYoutubeMetadata(url: string): Promise<YouTubeSlot | null> {
  if (!url) return null;

  // 1. API キーの取得とチェック
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY is not set in environment variables.');
    return null;
  }

  try {
    // 2. チャンネルか動画かの判定
    const isChannel = url.includes('/channel/') || url.includes('/@');

    if (isChannel) {
      // 3. チャンネル情報の取得
      let channelId = '';
      let handle = '';

      // ID抽出: /channel/UC*** (24文字)
      const idMatch = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      if (idMatch) {
        channelId = idMatch[1];
      } else {
        // ハンドル抽出: /@handle
        const handleMatch = url.match(/\/@([a-zA-Z0-9._-]+)/);
        if (handleMatch) handle = handleMatch[1];
      }

      let apiUrl = '';
      if (channelId) {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
      } else if (handle) {
        // forHandle パラメータを使用 (@ は不要)
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${handle}&key=${apiKey}`;
      } else {
        return null;
      }

      const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
      if (!response.ok) {
        console.error('YouTube API Channel Response Error:', response.status);
        return null;
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;

      const channel = data.items[0];
      return {
        type: 'channel',
        url: url,
        title: channel.snippet.title,
        imageUrl: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
      };
    } else {
      // 4. 動画情報の取得
      let videoId = '';
      // 各種動画URL形式に対応 (v=***, /v/ID, /embed/ID, /shorts/ID, youtu.be/ID)
      const vMatch = url.match(/(?:v=|v\/|embed\/|shorts\/|youtu\.be\/|\/)([0-9A-Za-z_-]{11})/);
      if (vMatch) videoId = vMatch[1];

      if (!videoId) return null;

      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
      const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
      
      if (!response.ok) {
        console.error('YouTube API Video Response Error:', response.status);
        return null;
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;

      const video = data.items[0];
      const thumbnails = video.snippet.thumbnails;
      // maxres優先、なければhigh, medium
      const imageUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;

      return {
        type: 'video',
        url: url,
        title: video.snippet.title,
        imageUrl: imageUrl,
        channelName: video.snippet.channelTitle,
        videoId: videoId,
      };
    }
  } catch (error) {
    console.error('Error in getYoutubeMetadata:', error);
  }

  return null;
}
