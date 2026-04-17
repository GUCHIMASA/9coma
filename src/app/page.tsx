import HomeClient from '@/components/HomeClient';
import RecentLists from '@/components/RecentLists';
import ToYtBanner from '@/components/banners/to-9tube/ToYtBanner';

export const revalidate = 60; // 1分ごとに再生成 (ISR)

export default function Home() {
  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'FontSurvivalTest';
          src: url('/fonts/NotoSansJP-Black.otf') format('opentype');
          font-weight: 900;
        }
      ` }} />
      <div style={{ 
        padding: '20px', 
        background: '#f00', 
        color: '#fff', 
        fontFamily: 'FontSurvivalTest', 
        fontSize: '32px',
        textAlign: 'center',
        fontWeight: 900
      }}>
        フォント生存試験中: Noto Sans JP Black
      </div>
      <ToYtBanner />
      <HomeClient />
      <RecentLists />
    </main>
  );
}
