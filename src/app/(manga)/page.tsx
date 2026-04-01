import HomeClient from '@/components/HomeClient';
import RecentLists from '@/components/RecentLists';

export const revalidate = 60; // 1分ごとに再生成 (ISR)

export default function Home() {
  return (
    <main>
      <HomeClient />
      <RecentLists />
    </main>
  );
}
