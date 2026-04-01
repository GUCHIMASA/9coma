export interface YouTubeSlot {
  type: 'video' | 'channel';
  url: string;
  title: string;
  channelName?: string;
  imageUrl: string;
  videoId?: string;
}

export interface YouTubeListItem {
  id: string;
  theme: string;
  authorName: string;
  slots: (YouTubeSlot | null)[];
  createdAt: number;
}
