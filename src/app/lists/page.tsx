import { getRecentLists, getListsByAuthor } from '@/lib/list';
import ListCard from '@/components/ListCard';
import Link from 'next/link';

export const runtime = 'edge';
export const revalidate = 3600; // 1時間ごとに再バリデーション（ISR）

export default async function ListsPage({
  searchParams,
}: {
  searchParams: { author?: string };
}) {
  const authorQuery = searchParams.author || '';
  const lists = authorQuery 
    ? await getListsByAuthor(authorQuery, 120)
    : await getRecentLists(120);

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem', width: '100%', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', padding: '4rem 0 2rem 0' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 900, 
          background: 'var(--gradient-primary, linear-gradient(135deg, #0066FF 0%, #FF0066 100%))', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          みんなの9コマ
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #444444)', fontSize: '1.1rem', fontWeight: 600 }}>
          {authorQuery ? '著者による絞り込み' : '新着の投稿一覧'}
        </p>
      </header>

      {/* 検索フォーム */}
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto 4rem auto', 
        padding: '0 1rem',
        display: 'flex',
        gap: '12px'
      }}>
        <form action="/lists" method="GET" style={{ display: 'flex', width: '100%', gap: '12px' }}>
          <input 
            type="text" 
            name="author"
            defaultValue={authorQuery}
            placeholder="著者名で検索..."
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '16px',
              border: '2px solid var(--color-border, #1A1A1A)',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              color: 'var(--color-text, #1A1A1A)',
              fontSize: '1rem',
              fontWeight: 500,
              outline: 'none',
              boxShadow: 'var(--shadow-sm, 4px 4px 0px rgba(0, 0, 0, 0.1))'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '14px 28px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-primary, #0066FF)',
              color: 'white',
              fontWeight: 800,
              border: '2px solid var(--color-border, #1A1A1A)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm, 4px 4px 0px rgba(0, 0, 0, 0.1))',
              transition: 'transform 0.1s'
            }}
          >
            検索
          </button>
        </form>
        {authorQuery && (
          <Link 
            href="/lists"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              color: 'var(--color-text, #1A1A1A)',
              textDecoration: 'none',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              border: '2px solid var(--color-border, #1A1A1A)',
              boxShadow: 'var(--shadow-sm, 4px 4px 0px rgba(0, 0, 0, 0.1))'
            }}
            title="検索をクリア"
          >
            ×
          </Link>
        )}
      </div>

      <section style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {authorQuery && (
          <h2 style={{ 
            fontSize: '1.3rem', 
            fontWeight: 900, 
            marginBottom: '2rem', 
            padding: '0 1rem',
            color: 'var(--color-text, #1A1A1A)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔍</span> 「{authorQuery}」先生が含まれる9コマ
          </h2>
        )}

        {lists && lists.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '20px',
            padding: '0 1rem'
          }}>
            {lists.map((list) => (
              <ListCard 
                key={list.id}
                id={list.id}
                authorName={list.authorName}
                theme={list.theme}
                slots={list.slots}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary, #444444)', padding: '6rem 1rem' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              {authorQuery ? '該当する作品が見つかりませんでした。' : 'まだ投稿がありません。'}
            </p>
            {authorQuery && (
              <Link 
                href="/lists" 
                style={{ 
                  display: 'inline-block',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-surface, #FFFFFF)',
                  color: 'var(--color-primary, #0066FF)', 
                  fontWeight: 800,
                  border: '2px solid var(--color-border, #1A1A1A)',
                  boxShadow: 'var(--shadow-sm, 4px 4px 0px rgba(0, 0, 0, 0.1))',
                  textDecoration: 'none'
                }}
              >
                すべての投稿を表示
              </Link>
            )}
          </div>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: '6rem' }}>
        <Link 
          href="/" 
          style={{ 
            color: 'var(--color-text, #1A1A1A)', 
            fontWeight: 800, 
            textDecoration: 'none',
            fontSize: '1rem',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '2px solid var(--color-border, #1A1A1A)',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            boxShadow: 'var(--shadow-sm, 4px 4px 0px rgba(0, 0, 0, 0.1))'
          }}
        >
          ← トップに戻って作る
        </Link>
      </div>
    </main>
  );
}


