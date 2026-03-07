import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '9coma | 私を構成する漫画9選',
  description: '自分を形成した漫画9作品を選んでページを作成し、SNSでシェアできるWebサービス',
  openGraph: {
    title: '9coma | 私を構成する漫画9選',
    description: '自分を形成した漫画9作品を選んでページを作成し、SNSでシェアできるWebサービス',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
