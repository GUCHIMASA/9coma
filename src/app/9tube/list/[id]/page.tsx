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
      <style dangerouslySetInnerHTML={{ __html: `
        html, body { 
          background-color: ${colorTheme.bg} !important; 
          color: ${colorTheme.text} !important;
          margin: 0;
          padding: 0;
        }
        :root {
          --color-bg: ${colorTheme.bg};
          --color-text: ${colorTheme.text};
          --color-text-secondary: ${colorTheme.text === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'};
          --color-text-muted: ${colorTheme.text === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
          --color-border: ${colorTheme.text === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
          --color-background: ${colorTheme.bg};
          --scrollbar-thumb: ${colorTheme.text === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'};
          --scrollbar-thumb-hover: ${colorTheme.text === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
        }
        footer {
          color: ${colorTheme.text} !important;
          border-top: 1px solid ${colorTheme.text === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} !important;
        }
        footer a, footer p {
          color: inherit !important;
          opacity: 0.7;
        }
      `}} />
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 900,
          fontFamily: '"Noto Sans JP", sans-serif',
          letterSpacing: '-0.02em',
          marginBottom: '0.8rem'
        }}>
          {theme ? theme : '9TUBE'}
        </h1>
        <p style={{ opacity: 0.7, fontSize: '1rem' }}>
          {authorName}を構成する9つのYouTube
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
          <p style={{ marginBottom: '1.5rem', fontWeight: 800, color: colorTheme.text, opacity: 0.7 }}>
            ＼ このリストをSNSでシェアしよう！ ／
          </p>

          <YtShareButtons
            id={params.id}
            authorName={authorName}
            theme={theme}
          />

          <p style={{ marginBottom: '1.5rem', marginTop: '4rem', fontWeight: 800, color: colorTheme.text, opacity: 0.7 }}>
            ＼ あなたもYouTube版 9コマを作ってみる？ ／
          </p>
          <a
            href="/9tube"
            className="yt-create-button"
            style={{
              display: 'inline-flex',
              width: '100%',
              maxWidth: '400px',
              padding: '1.2rem 2.5rem',
              background: '#FF0000',
              color: 'white',
              borderRadius: '99px',
              fontWeight: 900,
              fontSize: '1.1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(255,0,0,0.3)',
              marginBottom: '1rem',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            自分だけの9コマを作る
          </a>

          <div style={{ margin: '0.5rem 0' }} />

          <a
            href="/"
            style={{
              display: 'inline-flex',
              width: '100%',
              maxWidth: '400px',
              padding: '1.2rem 2.5rem',
              background: '#FFD600',
              color: '#000000',
              borderRadius: '99px',
              fontWeight: 900,
              fontSize: '1.1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(255,214,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            マンガ版（9コマ）で作ってみる ➔
          </a>
        </section>
      </div>
    </main>
  );
}
