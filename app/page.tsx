import Link from 'next/link';
import type { Metadata } from 'next';

import { getVisibleBoards } from '../lib/api/server';
import { tServer } from '../lib/i18n/dictionaries';
import { getServerLocale } from '../lib/i18n/server';
import { siteName } from '../lib/constants';

export const revalidate = 3600;

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

  return (
    <div className="themed-page">
      <div className="mx-auto mt-4 max-w-4xl p-4">
        <section className="themed-card themed-card-featured p-6">
          <div className="mb-6 border-b border-border pb-3">
            <div className="themed-kicker mb-2">{siteName}</div>
            <h1 className="themed-heading text-xl">{tServer('nav.boards', locale)}</h1>
            <p className="themed-meta mt-2 text-sm">{tServer('site.description', locale)}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="themed-card-muted block p-4 transition-colors hover:bg-white/70"
              >
                <div className="mb-1 flex items-center gap-2">
                  <div className="themed-heading-sm text-lg text-[hsl(var(--brand))]">
                    /{board.id}/ - {tServer(board.name, locale)}
                  </div>
                  {board.id === 'links' && (
                    <span className="themed-chip-accent inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      {tServer('commonLinks.staticBadge', locale)}
                    </span>
                  )}
                </div>
                <div className="themed-meta text-sm">{tServer(board.description, locale)}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
