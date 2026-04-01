import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import YtGrid from '@/components/youtube/YtGrid';
import { YouTubeSlot } from '@/types/youtube';
import YtShareButtons from '@/components/youtube/YtShareButtons';
import { COLOR_THEMES } from '@/lib/colors';

export const revalidate = 3600;

interface PageProps {
  params: {
    id: string;
  };
}

/**
 * YouTube版 個別閲覧ページ
 */
const getListData = cache(async (id: string) => {
  try {
    const docRef = doc(db, '9tube_lists', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error fetching YouTube list:', error);
  }
  return null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getListData(params.id);
  if (!data) return { title: 'Not Found | 9coma' };

  const themeTitle = data.theme ? `${data.theme} - ` : '';
  const authorName = data.authorName || '私';

  // Vercel プレビュー環境等での OGP 絶対パスを保証
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

  return {
    metadataBase: new URL(baseUrl),
    title: `${themeTitle}${authorName}を構成する9つのYouTube | 9coma`,
    description: `${authorName}が選んだ「私を構成する9つのYouTube」リストをチェック。`,
    openGraph: {
      title: `${themeTitle}${authorName}を構成する9つのYouTube`,
      description: `${authorName}が選んだ「私を構成する9つのYouTube」リストをチェック。`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    }
  };
}

export default async function YouTubeListPage({ params }: PageProps) {
  const data = await getListData(params.id);

  if (!data) {
    notFound();
  }

  const { slots, authorName, theme, colorThemeId } = data as {
    slots: (YouTubeSlot | null)[];
    authorName: string;
    theme?: string;
    colorThemeId?: string;
  };

  const colorTheme = COLOR_THEMES[colorThemeId || '01'] || COLOR_THEMES['01'];

  return (
    <main
      className="animate-fade-in"
      style={{
        padding: '3rem 1rem 6rem',
        backgroundColor: colorTheme.bg,
        color: colorTheme.text,
        minHeight: '100vh',
        transition: 'background-color 0.3s ease'
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        {authorName && (
          <div style={{
            display: 'inline-block',
            padding: '4px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '99px',
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: '1rem',
            border: `1px solid ${colorTheme.text}22`
          }}>
            {authorName}
          </div>
        )}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 900,
          fontFamily: '"Noto Sans JP", sans-serif',
          letterSpacing: '-0.02em',
          marginBottom: '0.8rem'
        }}>
          {theme ? theme : '私を構成する9つのYouTube'}
        </h1>
        <p style={{ opacity: 0.7, fontSize: '1rem' }}>
          {authorName}さんを構成する珠玉のリスト
        </p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '24px',
          borderRadius: '24px',
          border: `1px solid ${colorTheme.text}11`,
          marginBottom: '3rem'
        }}>
          <YtGrid
            slots={slots}
            isReadOnly={true}
          />
        </div>

        {/* 下部アクション */}
        <section style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '1.5rem', fontWeight: 600, opacity: 0.8 }}>
            ＼ このリストをSNSでシェアしよう！ ／
          </p>

          <YtShareButtons
            id={params.id}
            authorName={authorName}
            theme={theme}
          />

          <p style={{ marginBottom: '1.5rem', marginTop: '4rem', fontWeight: 600, opacity: 0.8 }}>
            ＼ あなたもYouTube版 9コマを作ってみる？ ／
          </p>
          <a
            href="/9tube"
            className="yt-create-button"
            style={{
              display: 'inline-flex',
              padding: '1rem 2.5rem',
              background: '#FF0000',
              color: 'white',
              borderRadius: '99px',
              fontWeight: 900,
              fontSize: '1.1rem',
              textDecoration: 'none',
              boxShadow: 'none'
            }}
          >
            自分だけの9コマを作る
          </a>
        </section>
      </div>
    </main>
  );
}
