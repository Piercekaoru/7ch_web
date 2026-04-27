'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

type Notice = 'board' | 'thread' | 'version' | null;

const parseEventData = (event: MessageEvent): Record<string, unknown> | null => {
  if (!event.data) return null;
  try {
    const parsed = JSON.parse(event.data) as unknown;
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
  } catch {
    return { version: String(event.data) };
  }
};

export function RealtimeNotices() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [notice, setNotice] = useState<Notice>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const routeRef = useRef({
    boardId: null as string | null,
    threadId: null as string | null,
    isBoardPage: false,
    isThreadPage: false,
  });

  const route = useMemo(() => {
    const threadMatch = pathname.match(/^\/board\/([^/]+)\/thread\/([^/]+)\/?$/);
    const boardMatch = pathname.match(/^\/board\/([^/]+)(?:\/page\/\d+)?\/?$/);
    return {
      boardId: threadMatch?.[1] ?? boardMatch?.[1] ?? null,
      threadId: threadMatch?.[2] ?? null,
      isBoardPage: Boolean(boardMatch) && !threadMatch,
      isThreadPage: Boolean(threadMatch),
    };
  }, [pathname]);

  useEffect(() => {
    routeRef.current = route;
    setNotice(null);
  }, [route]);

  useEffect(() => {
    const source = new EventSource('/api/events');

    const handleVersion = (event: MessageEvent) => {
      const payload = parseEventData(event);
      const version = typeof payload?.version === 'string' ? payload.version : null;
      if (!version) return;

      const stored = window.localStorage.getItem('7ch_server_version');
      if (!stored) {
        window.localStorage.setItem('7ch_server_version', version);
        return;
      }

      if (stored !== version) {
        setLatestVersion(version);
        setNotice('version');
      }
    };

    const handleThreadCreated = (event: MessageEvent) => {
      const payload = parseEventData(event);
      const boardId = typeof payload?.boardId === 'string' ? payload.boardId : null;
      const current = routeRef.current;
      if (!current.isBoardPage || !current.boardId || !boardId) return;
      if (current.boardId === 'all' || current.boardId === boardId) {
        setNotice('board');
      }
    };

    const handlePostCreated = (event: MessageEvent) => {
      const payload = parseEventData(event);
      const threadId = typeof payload?.threadId === 'string' ? payload.threadId : null;
      const boardId = typeof payload?.boardId === 'string' ? payload.boardId : null;
      const current = routeRef.current;

      if (current.isThreadPage && current.threadId && threadId === current.threadId) {
        setNotice('thread');
        return;
      }

      if (!current.isBoardPage || !current.boardId || !boardId) return;
      if (current.boardId === 'all' || current.boardId === boardId) {
        setNotice('board');
      }
    };

    const handleResync = () => {
      const current = routeRef.current;
      if (current.isThreadPage) setNotice('thread');
      if (current.isBoardPage) setNotice('board');
    };

    source.addEventListener('server_version', handleVersion as EventListener);
    source.addEventListener('thread_created', handleThreadCreated as EventListener);
    source.addEventListener('post_created', handlePostCreated as EventListener);
    source.addEventListener('resync', handleResync as EventListener);

    return () => {
      source.removeEventListener('server_version', handleVersion as EventListener);
      source.removeEventListener('thread_created', handleThreadCreated as EventListener);
      source.removeEventListener('post_created', handlePostCreated as EventListener);
      source.removeEventListener('resync', handleResync as EventListener);
      source.close();
    };
  }, []);

  if (!notice) return null;

  const refresh = () => {
    if (notice === 'version' && latestVersion) {
      window.localStorage.setItem('7ch_server_version', latestVersion);
      window.location.reload();
      return;
    }

    setNotice(null);
    router.refresh();
  };

  const dismiss = () => {
    if (notice === 'version' && latestVersion) {
      window.localStorage.setItem('7ch_server_version', latestVersion);
    }
    setNotice(null);
  };

  const label = notice === 'thread'
    ? t('realtime.new_replies')
    : notice === 'board'
      ? t('realtime.new_content')
      : t('realtime.new_version');

  return (
    <div className="border-b border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2 text-sm">
        <span className="font-bold">{label}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded-md border border-sky-300 bg-sky-100 px-3 py-1 text-sky-900 transition-colors hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/60 dark:text-sky-100"
          >
            {notice === 'thread' ? t('realtime.load_replies') : t('realtime.refresh')}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-sky-200 px-3 py-1 text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-800 dark:text-sky-200"
          >
            {t('realtime.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
