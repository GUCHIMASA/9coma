'use server';

import { YouTubeSlot } from '@/types/youtube';

/**
 * YouTubeのURLからメタデータを取得する Server Action
 * @param url ユーザーが入力したURL
 */
export async function getYoutubeMetadata(url: string): Promise<YouTubeSlot | null> {
  if (!url) return null;

  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    // 1. チャンネルか動画かの判定
    const isChannel = url.includes('/channel/') || url.includes('/@');

    if (!isChannel) {
      // --- 動画 (Video) の場合 ---
      
      // A. まずは oEmbed 方式（APIキー不要・安定）で試行
      try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const oeRes = await fetch(oEmbedUrl, { next: { revalidate: 3600 } });
        
        if (oeRes.ok) {
          const data = await oeRes.json();
          // videoId を抽出 (正規表現)
          const vMatch = url.match(/(?:v=|v\/|embed\/|shorts\/|youtu\.be\/|\/)([0-9A-Za-z_-]{11})/);
          const videoId = vMatch ? vMatch[1] : undefined;

          if (data.title && data.thumbnail_url) {
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
      } catch (e) {
        console.warn('oEmbed failed, falling back to API:', e);
      }

      // B. oEmbed が失敗した場合のフォールバック (YouTube Data API v3)
      if (apiKey) {
        const vMatch = url.match(/(?:v=|v\/|embed\/|shorts\/|youtu\.be\/|\/)([0-9A-Za-z_-]{11})/);
        const videoId = vMatch ? vMatch[1] : null;

        if (videoId) {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
          const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
          
          if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
              const video = data.items[0];
              const thumbnails = video.snippet.thumbnails;
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
          }
        }
      }
    } else {
      // --- チャンネル (Channel) の場合 ---

      // チャンネル取得には API キーが必須
      if (!apiKey) {
        console.error('YOUTUBE_API_KEY is not set for channel search.');
        return null;
      }

      let channelId = '';
      let handle = '';

      // ID抽出: /channel/UC*** (24文字)
      const idMatch = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      if (idMatch) {
        channelId = idMatch[1];
      } else {
        // ハンドル抽出: /@handle (英数字、アンダースコア、ピリオド、ハイフンに対応)
        const handleMatch = url.match(/\/@([a-zA-Z0-9._-]+)/);
        if (handleMatch) handle = handleMatch[1];
      }

      // Step 1: 直接取得試行 (Channels API)
      let apiUrl = '';
      if (channelId) {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
      } else if (handle) {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${handle}&key=${apiKey}`;
      } else {
        console.error('Could not extract channelId or handle from URL:', url);
        return null;
      }

      const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
      let data = await response.json();

      if (!response.ok) {
        console.error('YouTube Channels API Error:', response.status, data);
      }

      // Step 2: Fallback (Search API) - handle の場合のみ
      if (handle && (!data.items || data.items.length === 0)) {
        console.log(`[YouTubeAPI] forHandle failed for @${handle}, trying Search API fallback...`);
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=@${handle}&type=channel&maxResults=1&key=${apiKey}`;
        const sRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
        
        if (sRes.ok) {
          const sData = await sRes.ok ? await sRes.json() : null;
          if (sData && sData.items && sData.items.length > 0) {
            const foundChannelId = sData.items[0].id.channelId;
            console.log(`[YouTubeAPI] Search API found channelId: ${foundChannelId}`);
            
            // IDで再度詳細を取得
            const retryUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${foundChannelId}&key=${apiKey}`;
            const rRes = await fetch(retryUrl, { next: { revalidate: 3600 } });
            if (rRes.ok) {
              data = await rRes.json();
            } else {
              console.error('YouTube Channels API Retry Error:', rRes.status);
            }
          } else {
            console.error('YouTube Search API returned no items for handle:', handle);
          }
        } else {
          const errorBody = await sRes.text();
          console.error('YouTube Search API Error:', sRes.status, errorBody);
        }
      }

      if (data.items && data.items.length > 0) {
        const channel = data.items[0];
        return {
          type: 'channel',
          url: url,
          title: channel.snippet.title,
          imageUrl: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
        };
      } else {
        console.error('Final attempt failed to fetch channel metadata for:', url);
      }
    }
  } catch (error) {
    console.error('Error in getYoutubeMetadata:', error);
  }

  return null;
}
