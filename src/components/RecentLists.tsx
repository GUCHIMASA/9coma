import { getRecentLists } from '@/lib/list';
import ListCard from '@/components/ListCard';
import Link from 'next/link';

export default async function RecentLists() {
  const lists = await getRecentLists(6);

  if (!lists || lists.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-8 animate-fade-in" style={{ maxWidth: '1000px', margin: '3rem auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 800, 
        textAlign: 'center', 
        marginBottom: '1.5rem',
        color: 'var(--color-text)'
      }}>
        ✨ みんなの9コマ（新着）
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
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
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <Link 
          href="/lists" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.8rem 1.5rem',
            background: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            borderRadius: '99px',
            fontSize: '0.9rem',
            fontWeight: 700,
            textDecoration: 'none',
            border: '2px solid var(--color-border)',
            transition: 'var(--transition-fast)'
          }}
          className="hover-lift"
        >
          もっと見る<span>→</span>
        </Link>
      </div>
    </section>
  );
}
