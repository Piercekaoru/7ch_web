import type { Metadata } from 'next';

import { BoardPage } from '../features/boards/BoardPage.server';
import { getThreads, getVisibleBoards } from '../lib/api/server';
import { tServer } from '../lib/i18n/dictionaries';
import { getServerLocale } from '../lib/i18n/server';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const description = tServer('site.description', locale);

  return {
    description,
    openGraph: {
      description,
    },
    twitter: {
      description,
    },
  };
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const boards = await getVisibleBoards();
  const board = boards.find((item) => item.id === 'all');

  if (board) {
    try {
      const threadsPage = await getThreads(board.id, 1);
      return <BoardPage board={board} threadsPage={threadsPage} locale={locale} />;
    } catch {
      // Fall through to the unavailable state below.
    }
  }

  return (
    <div className="themed-page min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="themed-card themed-card-featured p-8">
          <h1 className="themed-heading mb-3 text-2xl">{tServer('thread.listUnavailableTitle', locale)}</h1>
          <p className="themed-meta">{tServer('thread.unavailableBody', locale)}</p>
        </div>
      </div>
    </div>
  );
}
