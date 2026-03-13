import Link from 'next/link';
import { MangaItem } from '@/types';

interface ListCardProps {
  id: string;
  authorName: string;
  theme?: string;
  slots: (MangaItem | null)[];
}

export default function ListCard({ id, authorName, theme, slots }: ListCardProps) {
  return (
    <div style={{ position: 'relative' }}>
      <Link 
        href={`/list/${id}`}
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
        {/* 3x3 Mini Grid Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2px',
          aspectRatio: '3 / 4',
          backgroundColor: '#000', // Border effect
          borderRadius: '6px',
          overflow: 'hidden',
          border: '2px solid #000'
        }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const manga = slots[i];
            return (
              <div key={i} style={{ 
                position: 'relative', 
                aspectRatio: '3 / 4', 
                backgroundColor: '#eee', 
                overflow: 'hidden' 
              }}>
                {manga?.imageUrl ? (
                  <img 
                    src={manga.imageUrl} 
                    alt={manga.title || ''} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#ccc', borderRadius: '50%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Area */}
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ 
            fontSize: '11px', 
            color: '#666', 
            fontWeight: 600, 
            margin: 0, 
            overflow: 'hidden', 
            whiteSpace: 'nowrap', 
            textOverflow: 'ellipsis' 
          }}>
            {authorName}さん
          </p>
          <div style={{ display: 'flex' }}>
            {theme ? (
              <span style={{ 
                backgroundColor: '#fffbeb', 
                color: '#92400e', 
                fontSize: '10px', 
                padding: '2px 8px', 
                borderRadius: '99px', 
                fontWeight: 800,
                maxWidth: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                border: '1px solid #fde68a'
              }}>
                {theme}
              </span>
            ) : (
              <p style={{ 
                fontSize: '13px', 
                fontWeight: 800, 
                color: '#333', 
                margin: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}>
                9つのマンガ
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Clone Button - Positioned absolutely inside the relative container */}
      <Link 
        href={`/?clone=${id}`}
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 800,
          textAlign: 'center',
          padding: '6px 0',
          borderRadius: '6px',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-fast)'
        }}
        className="hover-lift"
      >
        これをもとに作る
      </Link>
    </div>
  );
}
