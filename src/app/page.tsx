import HomeClient from '@/components/HomeClient';
import RecentLists from '@/components/RecentLists';
import ToYtBanner from '@/components/banners/to-9tube/ToYtBanner';

export const revalidate = 60; // 1分ごとに再生成 (ISR)

export default function Home() {
  return (
    <main>
      <ToYtBanner />
      <HomeClient />
      <RecentLists />
    </main>
  );
}
