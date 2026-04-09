import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// YouTube API レスポンスの型定義
interface YouTubeApiItem {
  id: string | { 
    kind?: string; 
    channelId?: string; 
    videoId?: string; 
    playlistId?: string;
  };
  snippet: {
    title: string;
    channelTitle?: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
      maxres?: { url: string };
    };
  };
}

interface YouTubeApiResponse {
  items?: YouTubeApiItem[];
}

/**
 * YouTube の URL からメタデータを取得する API Route
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    const isChannel = url.includes('/channel/') || url.includes('/@');

    if (!isChannel) {
      try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const oeRes = await fetch(oEmbedUrl, { next: { revalidate: 3600 } });
        
        if (oeRes.ok) {
          const data = (await oeRes.json()) as { title?: string; thumbnail_url?: string; author_name?: string };
          const vMatch = url.match(/(?:v=|v\/|embed\/|shorts\/|youtu\.be\/|\/)([0-9A-Za-z_-]{11})/);
          const videoId = vMatch ? vMatch[1] : undefined;

          if (data.title && data.thumbnail_url) {
            return NextResponse.json({
              type: 'video',
              url: url,
              title: data.title,
              imageUrl: data.thumbnail_url,
              channelName: data.author_name,
              videoId: videoId,
            });
          }
        }
      } catch (e) {
        console.warn('oEmbed failed, falling back to API:', e);
      }

      if (apiKey) {
        const vMatch = url.match(/(?:v=|v\/|embed\/|shorts\/|youtu\.be\/|\/)([0-9A-Za-z_-]{11})/);
        const videoId = vMatch ? vMatch[1] : null;

        if (videoId) {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
          const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
          
          if (response.ok) {
            const data = (await response.json()) as YouTubeApiResponse;
            if (data.items && data.items.length > 0) {
              const video = data.items[0];
              const thumbnails = video.snippet.thumbnails;
              const imageUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;

              return NextResponse.json({
                type: 'video',
                url: url,
                title: video.snippet.title,
                imageUrl: imageUrl,
                channelName: video.snippet.channelTitle,
                videoId: videoId,
              });
            }
          }
        }
      }
    } else {
      if (!apiKey) {
        console.error('YOUTUBE_API_KEY is not set for channel search.');
        return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
      }

      let channelId = '';
      let handle = '';

      const idMatch = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      if (idMatch) {
        channelId = idMatch[1];
      } else {
        const handleMatch = url.match(/\/@([a-zA-Z0-9._-]+)/);
        if (handleMatch) handle = handleMatch[1];
      }

      let apiUrl = '';
      if (channelId) {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
      } else if (handle) {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${handle}&key=${apiKey}`;
      } else {
        return NextResponse.json({ error: 'Invalid Channel URL format' }, { status: 400 });
      }

      const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
      let data = (await response.json()) as YouTubeApiResponse;

      if (!response.ok) {
        console.error('YouTube Channels API Error:', response.status);
      }

      if (handle && (!data.items || data.items.length === 0)) {
        console.log(`[YouTubeAPI] forHandle failed for @${handle}, trying Search API fallback...`);
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=@${handle}&type=channel&maxResults=1&key=${apiKey}`;
        const sRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
        
        if (sRes.ok) {
          const sData = (await sRes.json()) as YouTubeApiResponse;
          if (sData && sData.items && sData.items.length > 0) {
            const item = sData.items[0];
            const foundChannelId = typeof item.id === 'string' ? item.id : item.id.channelId;
            
            if (foundChannelId) {
              console.log(`[YouTubeAPI] Search API found channelId: ${foundChannelId}`);
              const retryUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${foundChannelId}&key=${apiKey}`;
              const rRes = await fetch(retryUrl, { next: { revalidate: 3600 } });
              if (rRes.ok) {
                data = (await rRes.json()) as YouTubeApiResponse;
              }
            }
          }
        }
      }

      if (data.items && data.items.length > 0) {
        const channel = data.items[0];
        return NextResponse.json({
          type: 'channel',
          url: url,
          title: channel.snippet.title,
          imageUrl: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
        });
      } else {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('Error in YouTube Metadata API Route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ error: 'Video/Channel not found' }, { status: 404 });
}
