import { getRecentYtLists } from '@/lib/list';
import YtListCard from '@/components/youtube/YtListCard';
import Link from 'next/link';

/**
 * YouTube版（9TUBE）の新着リストを表示するセクション
 */
export default async function RecentYtLists() {
  const lists = await getRecentYtLists(9);

  if (!lists || lists.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in" style={{ maxWidth: '1000px', margin: '4rem auto 3rem' }}>
      <h2 style={{ 
        fontSize: '1.6rem', 
        fontWeight: 900, 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: 'var(--color-text)',
        letterSpacing: '-0.02em'
      }}>
        新着の 9TUBE 📺
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
        gap: '20px',
        padding: '0 1rem'
      }}>
        {lists.map((list) => (
          <YtListCard 
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
          href="/9tube" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.8rem 1.8rem',
            background: '#FF0000', // YouTube Red
            color: '#fff',
            borderRadius: '99px',
            fontSize: '0.95rem',
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(255,0,0,0.2)',
            transition: 'var(--transition-fast)'
          }}
          className="hover-lift"
        >
          自分も 9TUBE を作ってみる<span>→</span>
        </Link>
      </div>
    </section>
  );
}
