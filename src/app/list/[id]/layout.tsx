import type { Metadata } from 'next';
import { getListById } from '@/lib/list';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const data = await getListById(params.id);

  return {
    title: `${data.authorName}さんを構成する漫画9選 | 9coma`,
    description: `${data.authorName}さんが選んだ、自分を構成する漫画9選です。`,
    openGraph: {
      title: `${data.authorName}さんを構成する漫画9選 | 9coma`,
      description: `${data.authorName}さんが選んだ、自分を構成する漫画9選です。`,
      type: 'article',
    },
  };
}

export default function ListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
