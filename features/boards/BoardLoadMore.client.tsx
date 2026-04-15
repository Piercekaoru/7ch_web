'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PaginatedThreads, Thread } from '../../types';
import { formatLocalizedCalendarDateTime } from '../../lib/date';
import { isBoardVisible } from '../../lib/boards';
import { buildDescription } from '../../lib/seo/sanitize';
import { threadUrl } from '../../lib/seo/url';
import { ThreadCardShell } from '../thread-preferences/ThreadCardShell.client';

interface BoardLoadMoreProps {
  boardId: string;
  initialPage: number;
  totalPages: number;
}

const filterVisibleThreads = (boardId: string, threads: Thread[]) =>
  boardId === 'all' ? threads.filter((thread) => isBoardVisible(thread.boardId)) : threads;

function LoadedThreadCard({ thread }: { thread: Thread }) {
  const { i18n, t } = useTranslation();
  const href = threadUrl(thread.boardId, thread.id);
  const summary = buildDescription(thread.opPost.content, '', 220);

  return (
    <ThreadCardShell threadId={thread.id} title={thread.title}>
      <div className="mb-2 text-xs themed-meta">
        {formatLocalizedCalendarDateTime(new Date(thread.updatedAt), i18n.language)} ID:{thread.opPost.uid}
      </div>
      <h2 className="themed-heading-sm mb-2 break-words text-lg hover:underline [overflow-wrap:anywhere] sm:text-[1.35rem]">
        <Link href={href}>{thread.title}</Link>
      </h2>
      {summary && (
        <p className="mb-4 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
          <Link href={href}>{summary}</Link>
        </p>
      )}
      <div className="mb-3">
        <Link className="bbs-link break-all text-sm" href={href}>
          {href}
        </Link>
      </div>
      <div className="flex items-center gap-4 text-xs font-bold themed-meta">
        <span>{t('meta.replies')}：{thread.postCount}</span>
        <span>/{thread.boardId}/</span>
        <span>{t('meta.views')}：{thread.viewCount}</span>
      </div>
    </ThreadCardShell>
  );
}

export function BoardLoadMore({ boardId, initialPage, totalPages }: BoardLoadMoreProps) {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [nextPage, setNextPage] = useState(initialPage + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);

  const hasMore = nextPage <= totalPages;

  const loadMore = async () => {
    if (!hasMore || inFlightRef.current) return;

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ boardId, page: String(nextPage) });
      const response = await fetch(`/api/threads?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`${t('favorites.readFailed')}：${response.status}`);
      }

      const data = await response.json() as PaginatedThreads;
      setThreads((previous) => {
        const seen = new Set(previous.map((thread) => thread.id));
        const merged = [...previous];
        for (const thread of filterVisibleThreads(boardId, data.threads)) {
          if (seen.has(thread.id)) continue;
          seen.add(thread.id);
          merged.push(thread);
        }
        return merged;
      });
      setNextPage((page) => page + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('favorites.readFailed'));
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (window.innerWidth >= 768) return;
      if (entries[0]?.isIntersecting) void loadMore();
    }, { threshold: 0.1 });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, nextPage]);

  if (initialPage >= totalPages) return null;

  return (
    <div className="mt-4 md:hidden">
      <div className="space-y-4">
        {threads.map((thread) => (
          <LoadedThreadCard key={thread.id} thread={thread} />
        ))}
      </div>

      <div ref={sentinelRef} className="py-4 text-center">
        {error && <div className="mb-2 text-sm font-bold text-[#d32f2f]">{error}</div>}
        {hasMore ? (
          <button type="button" onClick={() => void loadMore()} className="themed-inline-action text-sm" disabled={isLoading}>
            {isLoading ? t('pagination.loading_more') : t('pagination.load_more')}
          </button>
        ) : (
          <div className="themed-meta text-sm">{t('pagination.no_more')}</div>
        )}
      </div>
    </div>
  );
}
