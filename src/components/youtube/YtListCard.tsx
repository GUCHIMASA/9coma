/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { YouTubeSlot } from '@/types/youtube';

interface YtListCardProps {
  id: string;
  authorName: string;
  theme?: string;
  slots: (YouTubeSlot | null)[];
}

/**
 * YouTube版専用のリストカードコンポーネント (9TUBE版)
 * 3層レイアウト (拡大背景・遮光・本体) を採用し、正方形のアスペクト比を維持します。
 */
export default function YtListCard({ id, authorName, theme, slots }: YtListCardProps) {
  return (
    <div style={{ position: 'relative' }}>
      <Link 
        href={`/9tube/list/${id}`}
        style={{
          display: 'block',
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #eee',
          padding: '12px',
          paddingBottom: '48px', // Space for button
          textDecoration: 'none',
          color: 'inherit',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          height: '100%'
        }}
        className="list-card-hover"
      >
        {/* 3x3 Mini Grid Container (1:1 Ratio) */}
        <span style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2px',
          aspectRatio: '1 / 1',
          backgroundColor: '#000', // Border effect
          borderRadius: '6px',
          overflow: 'hidden',
          border: '2px solid #000'
        }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const video = slots[i];
            return (
              <span key={i} style={{ 
                position: 'relative', 
                aspectRatio: '1 / 1', 
                backgroundColor: '#111', 
                overflow: 'hidden',
                display: 'block'
              }}>
                {video?.imageUrl ? (
                  <>
                    {/* 1. 背景層 (178% 拡大) */}
                    <img 
                      src={video.imageUrl} 
                      alt="" 
                      style={{ 
                        position: 'absolute',
                        top: '-39%',
                        left: '-39%',
                        width: '178%',
                        height: '178%',
                        objectFit: 'cover',
                        zIndex: 0,
                        pointerEvents: 'none',
                        filter: 'blur(2px)' // 視覚的なプレミアム感を出すための微細なブラー（任意）
                      }}
                    />
                    {/* 2. 遮光層 (rgba 0,0,0,0.6) */}
                    <span style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      zIndex: 1
                    }} />
                    {/* 3. 前面層 (本体画像 contain) */}
                    <span style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      <img 
                        src={video.imageUrl} 
                        alt={video.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        loading="lazy"
                      />
                    </span>
                  </>
                ) : (
                  <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: '4px', height: '4px', backgroundColor: '#333', borderRadius: '50%' }} />
                  </span>
                )}
              </span>
            );
          })}
        </span>

        {/* Info Area */}
        <span style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ 
            fontSize: '11px', 
            color: '#666', 
            fontWeight: 600, 
            margin: 0, 
            overflow: 'hidden', 
            whiteSpace: 'nowrap', 
            textOverflow: 'ellipsis' 
          }}>
            <span style={{ color: 'inherit', textDecoration: 'none' }}>
              {authorName}さん
            </span>
          </p>
          <span style={{ display: 'flex' }}>
            {theme ? (
              <span style={{ 
                backgroundColor: '#fee2e2', // YouTubeらしい薄い赤背景
                color: '#991b1b', 
                fontSize: '10px', 
                padding: '2px 8px', 
                borderRadius: '99px', 
                fontWeight: 800,
                maxWidth: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                border: '1px solid #fecaca'
              }}>
                {theme}
              </span>
            ) : (
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 800, 
                color: '#333', 
                margin: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'block'
              }}>
                9つのYouTube
              </span>
            )}
          </span>
        </span>
      </Link>

      {/* Clone Button */}
      <Link 
        href={`/9tube?clone=${id}`}
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          backgroundColor: '#FF0000', // YouTube Red
          color: '#fff',
          fontSize: '10px',
          fontWeight: 800,
          textAlign: 'center',
          padding: '6px 0',
          borderRadius: '6px',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(255,0,0,0.2)',
          transition: 'var(--transition-fast)'
        }}
        className="hover-lift"
      >
        これをもとに作る
      </Link>
    </div>
  );
}
