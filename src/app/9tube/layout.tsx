import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '私を構成する9つのYouTube | 9TUBE (9coma)',
  description: 'あなたの人生に影響を与えたYouTube動画は？9つの動画をタイル状に並べて、あなただけの「マイベストYouTube」をシェアしましょう。',
  openGraph: {
    title: '私を構成する9つのYouTube | 9TUBE',
    description: 'あなたの人生に影響を与えたYouTube動画は？9つの動画をタイル状に並べてシェアしましょう。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '私を構成する9つのYouTube | 9TUBE',
    description: 'あなたの人生に影響を与えたYouTube動画は？9つの動画をタイル状に並べてシェアしましょう。',
  },
};

export default function YouTubeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
