import { getRecentLists } from '@/lib/list';
import ListCard from '@/components/ListCard';

export const revalidate = 3600; // 1時間ごとに再バリデーション（ISR）

export default async function ListsPage() {
  const lists = await getRecentLists(120); // 最大120件程度表示

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header style={{ textAlign: 'center', margin: '4rem 0 3rem 0' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 900, 
          background: 'var(--gradient-primary)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          みんなの9コマ
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', fontWeight: 600 }}>
          新着の投稿一覧
        </p>
      </header>

      <section style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {lists && lists.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '24px',
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
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '4rem' }}>
            まだ投稿がありません。
          </p>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <a 
          href="/" 
          style={{ 
            color: 'var(--color-primary)', 
            fontWeight: 700, 
            textDecoration: 'none',
            fontSize: '0.95rem'
          }}
        >
          ← トップに戻って作る
        </a>
      </div>
    </main>
  );
}
