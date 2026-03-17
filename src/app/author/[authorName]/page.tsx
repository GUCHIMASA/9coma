import { Metadata } from 'next';
import { getMangaByAuthor, getListsByAuthor, getSelectionCountByAuthor } from '@/lib/list';
import ListCard from '@/components/ListCard';
import Link from 'next/link';
import AuthorShareButtons from '@/components/AuthorShareButtons';

export const revalidate = 3600;

interface Props {
  params: {
    authorName: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const authorName = decodeURIComponent(params.authorName);
  return {
    title: `${authorName}先生の作品とみんなの9コマ | 9コマ`,
    description: `${authorName}先生の作品は、いまこれだけの人の人生を構成しています。作品一覧と関連する9コマリストをチェックしよう！`,
  };
}

export default async function AuthorPage({ params }: Props) {
  const authorName = decodeURIComponent(params.authorName);
  const [mangaItems, relatedLists, totalSelectionCount] = await Promise.all([
    getMangaByAuthor(authorName),
    getListsByAuthor(authorName),
    getSelectionCountByAuthor(authorName),
  ]);

  // 重複を除いたユニークな作品名を取得（シリーズ名があればそちらを優先）
  const uniqueManga = Array.from(new Map(mangaItems.map(m => [m.seriesName || m.title, m])).values());

  const shareText = `${authorName}先生の作品は、これまで投稿した人の人生の ${totalSelectionCount} コマを構成しています。先生に伝われ！
  #9コマ #9coma #9koma #${authorName}`;
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://9coma.com'}/author/${params.authorName}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <header style={{ textAlign: 'center', margin: '4rem 0 3rem 0' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          {authorName} 先生
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '2rem' }}>
          {authorName}先生の作品は、いまこれだけの人の人生を構成しています
        </p>
      </header>

      {/* 統計情報セクション */}
      <section style={{
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem', // 下のボタンとの距離を詰める
        textAlign: 'center',
        border: '3px solid var(--color-primary)'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem' }}>
          これまで投稿された皆さんの人生の
        </h2>
        <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)' }}>
          <span style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0 0.5rem' }}>{totalSelectionCount} コマ</span> を構成しています！
        </p>
      </section>

      {/* シェアボタンをここに移動 */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <AuthorShareButtons xShareUrl={xShareUrl} />
      </div>

      {/* 作品一覧セクション */}
      <section style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '2rem', borderLeft: '8px solid var(--color-primary)', paddingLeft: '1rem' }}>
          著書・関連作品
        </h2>
        {uniqueManga.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '20px'
          }}>
            {uniqueManga.map((manga) => (
              <div key={manga.isbn} style={{
                background: 'white',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ position: 'relative', paddingBottom: '141%' }}>
                  <img
                    src={manga.imageUrl}
                    alt={manga.title}
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '0.8rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 0.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4rem' }}>
                    {manga.title}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: 'auto' }}>
                    <a
                      href={manga.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.4rem 0.2rem',
                        background: '#bf0000', // 楽天レッド
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                      }}
                    >
                      楽天
                    </a>
                    <a
                      href={`https://www.amazon.co.jp/s?k=${manga.isbn}&tag=guchimasa03-22`} // ISBN検索+アソシエイトタグ
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.4rem 0.2rem',
                        background: '#ff9900', // Amazon オレンジ
                        color: 'black',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                      }}
                    >
                      Amazon
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)' }}>作品データが見つかりませんでした。</p>
        )}
      </section>

      {/* 関連リストセクション */}
      <section>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '2rem', borderLeft: '8px solid var(--color-primary)', paddingLeft: '1rem' }}>
          {authorName}先生の作品が含まれる9コマ
        </h2>
        {relatedLists.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '24px'
          }}>
            {relatedLists.map((list) => (
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
          <p style={{ color: 'var(--color-text-secondary)' }}>まだ投稿がありません。</p>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: '6rem' }}>
        <Link
          href="/"
          style={{
            color: 'var(--color-primary)',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '1rem'
          }}
        >
          ← トップに戻って作る
        </Link>
      </div>
    </main>
  );
}
