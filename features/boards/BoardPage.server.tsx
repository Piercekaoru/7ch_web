import type { Board, PaginatedThreads } from '../../types';
import { ThreadCard } from './ThreadCard.server';
import { BoardPagination } from './BoardPagination.server';
import { tServer, type Locale } from '../../lib/i18n/dictionaries';
import { CreateThreadForm } from '../forms/CreateThreadForm.client';
import { BoardLoadMore } from './BoardLoadMore.client';

interface BoardPageProps {
  board: Board;
  threadsPage: PaginatedThreads;
  searchQuery?: string;
  locale: Locale;
}

export function BoardPage({ board, threadsPage, searchQuery, locale }: BoardPageProps) {
  const boardName = tServer(board.name, locale);
  const trimmedSearchQuery = searchQuery?.trim();

  return (
    <div className="themed-page min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-4xl px-2 py-6 sm:px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="themed-meta text-sm">/{board.id}/</div>
            <h1 className="themed-heading text-2xl">{boardName}</h1>
            <p className="themed-meta mt-1 text-sm">{tServer(board.description, locale)}</p>
          </div>
        </div>

        {board.id !== 'all' && <CreateThreadForm boardId={board.id} />}

        {trimmedSearchQuery && (
          <div className="themed-card-muted mb-4 p-3 text-sm">
            {tServer('search.label', locale)}：<span className="font-bold text-foreground">{trimmedSearchQuery}</span>
            <span className="themed-meta ml-2">{tServer('search.backendResults', locale)}</span>
          </div>
        )}

        <div className="space-y-4">
          {threadsPage.threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} boardName={thread.boardId === board.id ? boardName : `/${thread.boardId}/`} locale={locale} />
          ))}
        </div>

        {threadsPage.threads.length === 0 && (
          <div className="themed-card themed-card-featured p-10 text-center themed-meta">
            {tServer('thread.emptyBoard', locale)}
          </div>
        )}

        {!trimmedSearchQuery && (
          <>
            <BoardPagination boardId={board.id} currentPage={threadsPage.page} totalPages={threadsPage.totalPages} locale={locale} />
            <BoardLoadMore boardId={board.id} initialPage={threadsPage.page} totalPages={threadsPage.totalPages} />
          </>
        )}
      </div>
    </div>
  );
}
