import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import ScrollToTop from '@/components/ScrollToTop';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? process.env.NEXT_PUBLIC_BASE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: '私を構成する9つのマンガ | 9コマ（9coma / 9koma）',
  description: '9コマ（9koma / 9coma）は、私を構成する9つのマンガを3×3のタイル状のページにして共有できるサービスです。人生のバイブルや最近の推しを整理して、あなただけの「マンガ棚」をSNSでシェアしませんか？',
  openGraph: {
    title: '私を構成する9つのマンガ | 9コマ',
    description: '9コマは、私を構成する9つのマンガを3×3のタイル状のページにして共有できるサービスです。人生のバイブルや最近の推しを整理して、あなただけの「マンガ棚」をSNSでシェアしませんか？',
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
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <meta name="google-adsense-account" content="ca-pub-6262972922332942" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6262972922332942"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <ScrollToTop />
        <footer
          className="google-anno-skip"
          style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-background)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
            <a href="/about" style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>
              このサイトについて
            </a>
            <a href="/privacy" style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>
              プライバシーポリシー
            </a>
          </div>
          <p style={{ marginTop: '0.8rem', fontSize: '0.7rem', opacity: 0.8, lineHeight: 1.5 }}>
            Amazon.co.jpアソシエイト、または9coma.comは、Amazon.co.jpを宣伝しリンクすることによって紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
          </p>
          <p>© {new Date().getFullYear()} 9コマ</p>
        </footer>
      </body>
    </html>
  );
}
