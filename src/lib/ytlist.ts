import type { YouTubeSlot } from '@/types/youtube';

export interface YouTubeListData {
  id: string;
  slots: (YouTubeSlot | null)[];
  authorName: string;
  theme?: string;
  colorThemeId?: string;
  themeId?: string;
  createdAt: number;
}

/**
 * ID を指定して 9TUBE リストデータを取得する
 * Edge Runtime クラッシュ回避のため動的インポートを使用。
 */
export async function get9TubeListById(id: string): Promise<YouTubeListData | null> {
  try {
    const { db } = await import('@/lib/firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, '9tube_lists', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id, ...docSnap.data() } as YouTubeListData;
    }
  } catch (error) {
    console.error('Error fetching 9tube list:', error);
  }
  return null;
}
