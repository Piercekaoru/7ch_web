'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { readFollowedThreadIds, subscribeThreadPreferences } from '../../lib/client/threadPreferences';
import { threadUrl } from '../../lib/seo/url';

type Notice =
  | { kind: 'board' }
  | { kind: 'thread' }
  | { kind: 'version'; version: string }
  | { kind: 'subscribedThread'; boardId: string; threadId: string }
  | null;

const parseEventData = (event: MessageEvent): Record<string, unknown> | null => {
  if (!event.data) return null;
  try {
    const parsed = JSON.parse(event.data) as unknown;
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
  } catch {
    return { version: String(event.data) };
  }
};

const getSubscribeNoticeCopy = (language?: string) => {
  const isJapanese = language?.startsWith('ja');
  return isJapanese
    ? {
        label: '購読中のスレッドに新しい返信があります',
        open: '開く',
      }
    : {
        label: '已订阅的帖子有新回复',
        open: '打开',
      };
};

export function RealtimeNotices() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n, t } = useTranslation();
  const [notice, setNotice] = useState<Notice>(null);
  const followedThreadIdsRef = useRef<Set<string>>(new Set());
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
    const syncFollowedThreads = () => {
      followedThreadIdsRef.current = new Set(readFollowedThreadIds());
    };

    syncFollowedThreads();
    return subscribeThreadPreferences(syncFollowedThreads);
  }, []);

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
        setNotice({ kind: 'version', version });
      }
    };

    const handleThreadCreated = (event: MessageEvent) => {
      const payload = parseEventData(event);
      const boardId = typeof payload?.boardId === 'string' ? payload.boardId : null;
      const current = routeRef.current;
      if (!current.isBoardPage || !current.boardId || !boardId) return;
      if (current.boardId === 'all' || current.boardId === boardId) {
        setNotice({ kind: 'board' });
      }
    };

    const handlePostCreated = (event: MessageEvent) => {
      const payload = parseEventData(event);
      const threadId = typeof payload?.threadId === 'string' ? payload.threadId : null;
      const boardId = typeof payload?.boardId === 'string' ? payload.boardId : null;
      const current = routeRef.current;

      if (current.isThreadPage && current.threadId && threadId === current.threadId) {
        setNotice({ kind: 'thread' });
        return;
      }

      if (threadId && boardId && followedThreadIdsRef.current.has(threadId)) {
        setNotice({ kind: 'subscribedThread', boardId, threadId });
        return;
      }

      if (!current.isBoardPage || !current.boardId || !boardId) return;
      if (current.boardId === 'all' || current.boardId === boardId) {
        setNotice({ kind: 'board' });
      }
    };

    const handleResync = () => {
      const current = routeRef.current;
      if (current.isThreadPage) setNotice({ kind: 'thread' });
      if (current.isBoardPage) setNotice({ kind: 'board' });
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
    if (notice.kind === 'version') {
      window.localStorage.setItem('7ch_server_version', notice.version);
      window.location.reload();
      return;
    }

    setNotice(null);
    router.refresh();
  };

  const dismiss = () => {
    if (notice.kind === 'version') {
      window.localStorage.setItem('7ch_server_version', notice.version);
    }
    setNotice(null);
  };

  const subscribeNoticeCopy = getSubscribeNoticeCopy(i18n.language);
  const label = notice.kind === 'thread'
    ? t('realtime.new_replies')
    : notice.kind === 'board'
      ? t('realtime.new_content')
      : notice.kind === 'subscribedThread'
        ? subscribeNoticeCopy.label
        : t('realtime.new_version');

  return (
    <div className="border-b border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2 text-sm">
        <span className="font-bold">{label}</span>
        <div className="ml-auto flex items-center gap-2">
          {notice.kind === 'subscribedThread' ? (
            <Link
              href={threadUrl(notice.boardId, notice.threadId)}
              onClick={() => setNotice(null)}
              className="rounded-md border border-sky-300 bg-sky-100 px-3 py-1 text-sky-900 transition-colors hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/60 dark:text-sky-100"
            >
              {subscribeNoticeCopy.open}
            </Link>
          ) : (
            <button
              type="button"
              onClick={refresh}
              className="rounded-md border border-sky-300 bg-sky-100 px-3 py-1 text-sky-900 transition-colors hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/60 dark:text-sky-100"
            >
              {notice.kind === 'thread' ? t('realtime.load_replies') : t('realtime.refresh')}
            </button>
          )}
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
