// 漫画データの型定義
export interface MangaItem {
  isbn: string;
  title: string;
  seriesName?: string;
  author: string;
  publisher?: string;
  imageUrl: string;
  itemUrl: string;
  affiliateUrl: string;
  releaseDate?: string;
  salesPage?: string;
}

// YouTubeスロットデータの型定義
export interface YouTubeSlot {
  id: string; // 動画ID または チャンネルID
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  type: 'video' | 'channel';
  publishedAt?: string;
}

// 9コマリストの型定義
export interface ComicList {
  id: string;
  authorName: string;
  theme?: string;
  slots: (MangaItem | null)[];
  colorThemeId?: string;
  createdAt: number;
}

// YouTube版リストの型定義
export interface YouTubeList {
  id: string;
  authorName: string;
  theme?: string;
  themeId: string;
  slots: (YouTubeSlot | null)[];
  colorThemeId: string;
  deviceId: string;
  createdAt: any; // Firestore serverTimestamp
  type: 'youtube';
}

// 楽天APIレスポンスの型
export interface RakutenBookItem {
  isbn: string;
  title: string;
  seriesName: string;
  author: string;
  largeImageUrl: string;
  affiliateUrl: string;
  itemUrl: string;
}
