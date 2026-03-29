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

// 9コマリストの型定義
export interface ComicList {
  id: string;
  authorName: string;
  theme?: string;
  slots: (MangaItem | null)[];
  colorThemeId?: string;
  createdAt: number;
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
