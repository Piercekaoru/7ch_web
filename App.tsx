import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Navigate, useNavigate, useParams, Route, Routes, Link, useLocation } from 'react-router-dom';
import { api, apiBaseUrl, useMock as isMockMode } from './services/api';
import { Board, Thread } from './types';
import { JobMetaSummary } from './components/JobMetaSummary';
import { Button } from './components/ui/button';
import { DonateModal } from './components/DonateModal';
import { Pagination } from './components/Pagination';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { useTheme } from './components/theme-provider';
import { cn } from './lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from './components/ui/dialog';
import { buildKnownErrorRedirectPath } from './lib/errorRedirect';
import { getDisplayErrorMessage } from './lib/errorMessage';
import { commonLinksBoard } from './data/commonLinks';
import { buildJobMetaSearchText } from './lib/jobMeta';

// 应用入口：路由、全局状态、SSE 通知、以及主要布局。
// App entry: routing, global state, SSE notices, and overall layout.

const STATIC_BOARDS: Board[] = [commonLinksBoard];
// 兼容性说明：
// 前端当前故意隐藏 `/baito/` 板块和 `/tools/convert` 工具页，
// 但后端仍保留对应的板块 ID 与订阅转换 API，供兼容性、受控调用和后续恢复使用。
const HIDDEN_BOARD_IDS = new Set(['baito']);

const isBoardVisible = (boardId: string) => !HIDDEN_BOARD_IDS.has(boardId);

const filterVisibleBoards = (sourceBoards: Board[]) => {
  return sourceBoards.filter((board) => isBoardVisible(board.id));
};

const filterVisibleThreads = (sourceThreads: Thread[]) => {
  return sourceThreads.filter((thread) => isBoardVisible(thread.boardId));
};

const mergeBoardsWithStatic = (sourceBoards: Board[]) => {
  const seen = new Set<string>();
  return [...filterVisibleBoards(sourceBoards), ...STATIC_BOARDS].filter((board) => {
    if (seen.has(board.id)) return false;
    seen.add(board.id);
    return true;
  });
};

const DocsPage = lazy(() =>
  import('./pages/Docs').then((module) => ({ default: module.Docs }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy }))
);
const TermsPage = lazy(() =>
  import('./pages/Terms').then((module) => ({ default: module.Terms }))
);
const HelpPage = lazy(() =>
  import('./pages/Help').then((module) => ({ default: module.Help }))
);
const QAPage = lazy(() =>
  import('./pages/QA').then((module) => ({ default: module.QA }))
);
const ChangelogPage = lazy(() =>
  import('./pages/Changelog').then((module) => ({ default: module.Changelog }))
);
const RateLimitedPage = lazy(() =>
  import('./pages/RateLimited').then((module) => ({ default: module.RateLimited }))
);
const ServicePausedPage = lazy(() =>
  import('./pages/ServicePaused').then((module) => ({ default: module.ServicePaused }))
);
const CommonLinksBoardPage = lazy(() =>
  import('./pages/CommonLinks').then((module) => ({ default: module.CommonLinksBoard }))
);
const CommonLinkDetailPage = lazy(() =>
  import('./pages/CommonLinks').then((module) => ({ default: module.CommonLinkDetail }))
);
const ThreadViewPage = lazy(() =>
  import('./components/ThreadDetail').then((module) => ({ default: module.ThreadView }))
);
const PostFormPage = lazy(() =>
  import('./components/PostForm').then((module) => ({ default: module.PostForm }))
);

const RouteLoadingFallback: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="themed-page min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="themed-card themed-card-featured p-6 text-center themed-meta">
          {t('meta.loading')}...
        </div>
      </div>
    </div>
  );
};

const LazyRouteBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>;
};

// --- Board View Component ---
// 看板列表页：负责分页、搜索过滤、移动端无限滚动。
// Board view: handles pagination, search filtering, and mobile infinite scroll.
const BoardView: React.FC<{
  boards: Board[];
  search: string;
  onCreateThread: (payload: any) => void;
  onThreadClick: (thread: Thread) => void;
  onToggleHide: (e: React.MouseEvent, id: string) => void;
  onToggleFollow: (e: React.MouseEvent, id: string) => void;
  hiddenThreads: Set<string>;
  followedThreads: Set<string>;
  refreshToken: number;
}> = ({ boards, search, onCreateThread, onThreadClick, onToggleHide, onToggleFollow, hiddenThreads, followedThreads, refreshToken }) => {
  const { t, i18n } = useTranslation();
  const { themeVariant } = useTheme();
  const isClaude = themeVariant === 'claude';
  const navigate = useNavigate();
  const location = useLocation();
  const { boardId } = useParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);

  // 分页状态（PC 模式使用分页，移动端使用无限滚动）。
  // Pagination state (desktop paging, mobile infinite scroll).
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  // 设备判定：宽度 < 768 视为移动端。
  // Device detection: width < 768 treated as mobile.
  const [isMobile, setIsMobile] = useState(false);

  // 无限滚动所需的 observer 与触发元素。
  // IntersectionObserver + sentinel for infinite scroll.
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const currentBoardRef = React.useRef<string | undefined>(boardId);
  const loadGenerationRef = React.useRef(0);
  const inFlightPagesRef = React.useRef<Set<number>>(new Set());
  const loadedPagesRef = React.useRef<Set<number>>(new Set());

  // 初始化/窗口变化时检测设备。
  // Detect device on mount and resize.
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    currentBoardRef.current = boardId;
  }, [boardId]);

  useEffect(() => {
    if (boardId && !isBoardVisible(boardId)) {
      navigate('/', { replace: true });
    }
  }, [boardId, navigate]);

  const syncLoadingState = () => {
    setLoading(inFlightPagesRef.current.size > 0);
  };

  const resetThreadLoadState = () => {
    loadGenerationRef.current += 1;
    inFlightPagesRef.current.clear();
    loadedPagesRef.current.clear();
    syncLoadingState();
  };

  const mergeUniqueThreads = (previousThreads: Thread[], nextThreads: Thread[]) => {
    const seen = new Set(previousThreads.map((thread) => thread.id));
    const merged = [...previousThreads];
    for (const thread of nextThreads) {
      if (seen.has(thread.id)) continue;
      seen.add(thread.id);
      merged.push(thread);
    }
    return merged;
  };

  // 拉取线程列表：支持覆盖或追加。
  // Fetch threads: replace or append.
  const loadThreads = async (page: number, append: boolean = false) => {
    const requestBoardId = boardId;
    if (!requestBoardId) return;
    if (!isBoardVisible(requestBoardId)) return;
    if (append && loadedPagesRef.current.has(page)) return;
    if (inFlightPagesRef.current.has(page)) return;

    const generation = loadGenerationRef.current;
    inFlightPagesRef.current.add(page);
    syncLoadingState();
    setThreadsError(null);

    try {
      const data = await api.getThreads(requestBoardId, page);
      const visibleThreads = requestBoardId === 'all' ? filterVisibleThreads(data.threads) : data.threads;
      if (generation !== loadGenerationRef.current || currentBoardRef.current !== requestBoardId) {
        return;
      }

      if (append) {
        loadedPagesRef.current.add(page);
        setThreads(prev => mergeUniqueThreads(prev, visibleThreads));
      } else {
        loadedPagesRef.current = new Set([page]);
        setThreads(visibleThreads);
      }

      if (append) {
        setCurrentPage((current) => Math.max(current, page));
      }
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setHasMore(page < data.totalPages);
    } catch (error) {
      if (generation !== loadGenerationRef.current || currentBoardRef.current !== requestBoardId) {
        return;
      }
      const redirectPath = buildKnownErrorRedirectPath(error, `${location.pathname}${location.search}`);
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }
      setThreadsError(getDisplayErrorMessage(error, t));
      console.error('Failed to load threads:', error);
    } finally {
      inFlightPagesRef.current.delete(page);
      if (generation === loadGenerationRef.current && currentBoardRef.current === requestBoardId) {
        syncLoadingState();
      }
    }
  };

  // 首次进入或板块切换时重新加载。
  // Reload on first mount or board switch.
  useEffect(() => {
    if (boardId) {
      resetThreadLoadState();
      setThreads([]);
      setThreadsError(null);
      setCurrentPage(1);
      setHasMore(true);
      loadThreads(1, false);
    }
    setShowPostForm(false);
  }, [boardId]);

  useEffect(() => {
    if (!boardId || refreshToken === 0) return;
    resetThreadLoadState();
    setThreads([]);
    setCurrentPage(1);
    setHasMore(true);
    loadThreads(1, false);
  }, [refreshToken, boardId]);

  // PC 模式分页切换。
  // Desktop pagination handler.
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadThreads(page, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 移动端：观察触底并追加下一页。
  // Mobile: observe sentinel and append next page.
  useEffect(() => {
    if (!isMobile || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          const nextPage = currentPage + 1;
          loadThreads(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile, hasMore, loading, currentPage]);

  if (boardId && !isBoardVisible(boardId)) return null;
  const board = boards.find(b => b.id === boardId);
  if (!board) return <div className="p-6 text-center themed-meta">Board not found</div>;
  const isAll = boardId === 'all';

  const renderThreadCard = (thread: Thread, boardName: string) => {
    if (hiddenThreads.has(thread.id)) {
      return (
        <div key={thread.id} className="themed-card-muted flex items-center justify-between p-3 text-xs">
          <span className="font-bold">{t('meta.hidden_thread')}: {thread.title.substring(0, 30)}...</span>
          <button onClick={(e) => onToggleHide(e, thread.id)} className="themed-inline-action">[{t('meta.show')}]</button>
        </div>
      );
    }

    const d = new Date(thread.updatedAt);
    let dateStr;
    const isJa = i18n.language === 'ja-JP';

    if (isJa) {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const day = days[d.getDay()];
      let y = d.getFullYear().toString();
      if (d.getFullYear() >= 2019) y = 'R' + (d.getFullYear() - 2018);
      else if (d.getFullYear() >= 1989) y = 'H' + (d.getFullYear() - 1988);
      else if (d.getFullYear() >= 1926) y = 'S' + (d.getFullYear() - 1925);
      dateStr = `${y}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}(${day}) ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.00`;
    } else {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dateStr = `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}(${days[d.getDay()]}) ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.00`;
    }

    const isFollowed = followedThreads.has(thread.id);

    return (
      <div key={thread.id} className={cn('themed-card themed-card-featured relative group p-5 sm:p-6', isClaude && 'overflow-hidden')}>
        <div className="absolute top-4 right-4 text-xs themed-meta">
          {dateStr} <span className="ml-2">ID:{thread.opPost.uid}</span>
          <button onClick={(e) => onToggleHide(e, thread.id)} className="themed-inline-action ml-2">[{t('meta.hide')}]</button>
        </div>
        <div className="mt-1">
          <div className="mb-2 pr-40">
            <span
              className={cn(
                'themed-heading-sm cursor-pointer text-lg hover:underline sm:text-[1.35rem]',
                isClaude && 'pr-2'
              )}
              onClick={() => onThreadClick(thread)}
            >
              {thread.title}
            </span>
          </div>
          <div
            className={cn('mb-4 cursor-pointer text-sm leading-relaxed text-foreground', isClaude && 'text-[15px] leading-7')}
            onClick={() => onThreadClick(thread)}
          >
            {thread.jobMeta && <JobMetaSummary jobMeta={thread.jobMeta} />}
            {thread.opPost.content.length > 200 ? thread.opPost.content.substring(0, 200) + '...' : thread.opPost.content}
          </div>
          <div className="mb-3">
            <a className="bbs-link text-sm break-all" href={`/board/${thread.boardId}/thread/${thread.id}`}>
              https://7ch-web.vercel.app/board/{thread.boardId}/thread/{thread.id}/
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold themed-meta">
            <div className="flex items-center gap-1 text-[hsl(var(--brand))]">
              <span>💬</span>
              <span>{thread.postCount}</span>
            </div>
            <div className="themed-inline-action">{boardName}</div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>{thread.viewCount}</span>
            </div>
            <button
              onClick={(e) => onToggleFollow(e, thread.id)}
              className={cn(
                'ml-auto rounded-xl px-3 py-1.5 text-xs transition-colors',
                isFollowed ? 'themed-secondary-action' : 'themed-primary-action'
              )}
            >
              {isFollowed ? t('meta.following') : t('meta.follow')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 仅在有搜索词时进行前端过滤（标题 + OP 内容）。
  // Client-side filter when search term exists (title + OP content).
  const filteredThreads = search.trim() ? threads.filter((thread) => {
    const s = search.trim().toLowerCase();
    const text = `${thread.title} ${thread.opPost.content} ${buildJobMetaSearchText(thread.jobMeta)}`.toLowerCase();
    return text.includes(s);
  }) : threads;

  const renderThreadsErrorState = () => (
    <div className="themed-card themed-card-featured p-6 sm:p-10">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700 sm:flex-row sm:items-center">
        <h2 className="themed-heading text-xl sm:text-2xl">
          {t('error.loadThreadsTitle')}
        </h2>
        <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800/40">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t('error.loadThreadsBadge')}
        </span>
      </div>

      <div className="mb-8 space-y-4 text-[15px] leading-relaxed text-foreground">
        <p className="font-medium text-foreground">{t('error.loadThreadsLead')}</p>
        <p>{threadsError}</p>
        <div className="themed-card-muted p-3 text-sm text-[hsl(var(--brand))]">
          <span className="mb-1 block font-bold">{t('error.loadThreadsNoteTitle')}</span>
          {t('error.loadThreadsNoteBody')}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="themed-card-muted p-4">
          <div className="themed-kicker mb-1">{t('error.loadThreadsActionLabel')}</div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{t('error.loadThreadsActionValue')}</div>
          <div className="themed-meta mt-1 text-xs">{t('error.loadThreadsActionBody')}</div>
        </div>
        <div className="themed-card-muted p-4">
          <div className="themed-kicker mb-1">{t('error.loadThreadsCauseLabel')}</div>
          <div className="text-lg font-bold text-foreground">{t('error.loadThreadsCauseValue')}</div>
          <div className="themed-meta mt-1 text-xs">{t('error.loadThreadsCauseBody')}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={() => void loadThreads(currentPage, false)}
          className="themed-primary-action rounded-xl px-6 py-2 text-sm font-bold transition-colors"
        >
          {t('servicePause.retry')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="themed-secondary-action rounded-xl px-6 py-2 text-sm font-bold transition-colors"
        >
          {t('servicePause.home')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="themed-page min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
        {threadsError && threads.length === 0 ? renderThreadsErrorState() : (
          <>
            {!isAll && (
              <div className="mb-4 flex justify-end">
                <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
                  <DialogTrigger asChild>
                    <button
                      className="themed-secondary-action flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors"
                    >
                      <span className="text-lg text-[hsl(var(--brand))]">✏️</span>
                      {t('thread.new')}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto border-none bg-transparent p-0 shadow-none [&>button]:hidden">
                    <LazyRouteBoundary>
                      <PostFormPage
                        boardId={boardId!}
                        onSubmit={async (payload: any) => {
                          const newId = await api.createThread(payload);
                          const data = await api.getThreads(boardId!, 1);
                          setThreads(data.threads);
                          setTotal(data.total);
                          setTotalPages(data.totalPages);
                          setCurrentPage(1);
                          const newThread = data.threads.find(t => t.id === newId);
                          if (newThread) onThreadClick(newThread);
                          setShowPostForm(false);
                        }}
                        onCancel={() => setShowPostForm(false)}
                      />
                    </LazyRouteBoundary>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {threadsError && threads.length > 0 && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <div className="font-bold">{t('error.loadThreadsTitle')}</div>
                <div>{threadsError}</div>
              </div>
            )}

            <div className="space-y-4">
              {filteredThreads.map((thread) => {
                const bObj = boards.find(b => b.id === thread.boardId);
                const displayBoardName = isAll ? (bObj ? t(bObj.name) : thread.boardId) : t(board.name);
                return renderThreadCard(thread, displayBoardName);
              })}
            </div>

            {/* PC Mode: Classic Pagination */}
            {!isMobile && !search.trim() && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}

            {/* Mobile Mode: Infinite Scroll Trigger */}
            {isMobile && !search.trim() && (
              <div ref={loadMoreRef} className="py-4 text-center">
                {loading && <span className="themed-meta">{t('meta.loading')}...</span>}
                {!loading && hasMore && (
                  <button
                    onClick={() => {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      loadThreads(nextPage, true);
                    }}
                    className="themed-inline-action"
                  >
                    {t('pagination.load_more')}
                  </button>
                )}
                {!hasMore && threads.length > 0 && (
                  <div className="themed-meta">{t('pagination.no_more')}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// --- Favorites View Component ---
// 收藏页：通过线程详情接口回填最新内容。
// Favorites view: hydrates latest data via thread detail API.
const FavoritesView: React.FC<{
  followedThreads: Set<string>;
  boards: Board[];
  onThreadClick: (thread: Thread) => void;
  onToggleHide: (e: React.MouseEvent, id: string) => void;
  onToggleFollow: (e: React.MouseEvent, id: string) => void;
  hiddenThreads: Set<string>;
}> = ({ followedThreads, boards, onThreadClick, onToggleHide, onToggleFollow, hiddenThreads }) => {
  const { t, i18n } = useTranslation();
  const { themeVariant } = useTheme();
  const isClaude = themeVariant === 'claude';
  const navigate = useNavigate();
  const location = useLocation();
  const [favThreads, setFavThreads] = useState<Thread[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  useEffect(() => {
    const loadFavoriteThreads = async () => {
      setLoadingFavs(true);
      try {
        const ids = Array.from(followedThreads);
        const results = await Promise.allSettled(ids.map(id => api.getThreadContent(id)));
        const validThreads = results
          .filter((result): result is PromiseFulfilledResult<Thread> => result.status === 'fulfilled')
          .map(result => result.value);
        const redirectPath = results.reduce<string | null>((matchedPath, result) => {
          if (matchedPath || result.status !== 'rejected') return matchedPath;
          return buildKnownErrorRedirectPath(result.reason, `${location.pathname}${location.search}`);
        }, null);
        if (ids.length > 0 && redirectPath && validThreads.length === 0) {
          navigate(redirectPath);
          return;
        }
        const visibleThreads = filterVisibleThreads(validThreads);
        visibleThreads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setFavThreads(visibleThreads);
      } finally {
        setLoadingFavs(false);
      }
    };
    loadFavoriteThreads();
  }, [followedThreads.size]);

  const renderThreadCard = (thread: Thread, boardName: string) => {
    if (hiddenThreads.has(thread.id)) {
      return (
        <div key={thread.id} className="themed-card-muted flex items-center justify-between p-3 text-xs">
          <span className="font-bold">{t('meta.hidden_thread')}: {thread.title.substring(0, 30)}...</span>
          <button onClick={(e) => onToggleHide(e, thread.id)} className="themed-inline-action">[{t('meta.show')}]</button>
        </div>
      );
    }

    const d = new Date(thread.updatedAt);
    let dateStr;
    const isJa = i18n.language === 'ja-JP';

    if (isJa) {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const day = days[d.getDay()];
      let y = d.getFullYear().toString();
      if (d.getFullYear() >= 2019) y = 'R' + (d.getFullYear() - 2018);
      else if (d.getFullYear() >= 1989) y = 'H' + (d.getFullYear() - 1988);
      else if (d.getFullYear() >= 1926) y = 'S' + (d.getFullYear() - 1925);
      dateStr = `${y}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}(${day}) ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.00`;
    } else {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dateStr = `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}(${days[d.getDay()]}) ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.00`;
    }

    const isFollowed = followedThreads.has(thread.id);

    return (
      <div key={thread.id} className={cn('themed-card themed-card-featured relative group p-5 sm:p-6', isClaude && 'overflow-hidden')}>
        <div className="absolute top-4 right-4 text-xs themed-meta">
          {dateStr} <span className="ml-2">ID:{thread.opPost.uid}</span>
          <button onClick={(e) => onToggleHide(e, thread.id)} className="themed-inline-action ml-2">[{t('meta.hide')}]</button>
        </div>
        <div className="mt-1">
          <div className="mb-2 pr-40">
            <span
              className="themed-heading-sm cursor-pointer text-lg hover:underline sm:text-[1.35rem]"
              onClick={() => onThreadClick(thread)}
            >
              {thread.title}
            </span>
          </div>
          <div
            className={cn('mb-4 cursor-pointer text-sm leading-relaxed text-foreground', isClaude && 'text-[15px] leading-7')}
            onClick={() => onThreadClick(thread)}
          >
            {thread.jobMeta && <JobMetaSummary jobMeta={thread.jobMeta} />}
            {thread.opPost.content.length > 200 ? thread.opPost.content.substring(0, 200) + '...' : thread.opPost.content}
          </div>
          <div className="mb-3">
            <a className="bbs-link text-sm break-all" href={`/board/${thread.boardId}/thread/${thread.id}`}>
              https://7ch-web.vercel.app/board/{thread.boardId}/thread/{thread.id}/
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold themed-meta">
            <div className="flex items-center gap-1 text-[hsl(var(--brand))]">
              <span>💬</span>
              <span>{thread.postCount}</span>
            </div>
            <div className="themed-inline-action">{boardName}</div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>{thread.viewCount}</span>
            </div>
            <button
              onClick={(e) => onToggleFollow(e, thread.id)}
              className={cn(
                'ml-auto rounded-xl px-3 py-1.5 text-xs transition-colors',
                isFollowed ? 'themed-secondary-action' : 'themed-primary-action'
              )}
            >
              {isFollowed ? t('meta.following') : t('meta.follow')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="themed-page min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
        <div className="themed-heading mb-4 flex items-center gap-2 text-xl">
          <span>★</span> {t('nav.favorites')}
        </div>
        {loadingFavs ? (
          <div className="themed-meta py-10 text-center">{t('meta.loading')}</div>
        ) : favThreads.length === 0 ? (
          <div className="themed-card p-10 text-center themed-meta">
            {t('meta.no_favorites')}
          </div>
        ) : (
          <div className="space-y-4">
            {favThreads.map(thread => {
              if (!followedThreads.has(thread.id)) return null;
              const boardObj = boards.find(b => b.id === thread.boardId);
              const boardName = boardObj ? t(boardObj.name) : thread.boardId;
              return renderThreadCard(thread, boardName);
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Thread View Wrapper Component ---
// 路由包装层：读取 URL 参数并注入 ThreadView。
// Route wrapper: reads URL params and injects ThreadView props.
const ThreadViewWrapper: React.FC<{
  followedThreads: Set<string>;
  onToggleFollow: (e: any, id: string) => void;
  refreshToken: number;
  enablePolling: boolean;
}> = ({ followedThreads, onToggleFollow, refreshToken, enablePolling }) => {
  const { boardId, threadId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (boardId && !isBoardVisible(boardId)) {
      navigate('/', { replace: true });
    }
  }, [boardId, navigate]);

  if (!boardId || !threadId) return <div>Invalid thread</div>;
  if (!isBoardVisible(boardId)) return null;

  return (
    <div className="themed-page min-h-[calc(100vh-3.5rem)] pt-4">
      <LazyRouteBoundary>
        <ThreadViewPage
          threadId={threadId}
          onBack={() => navigate(`/board/${boardId}`)}
          isFollowed={followedThreads.has(threadId)}
          onToggleFollow={(e) => onToggleFollow(e, threadId)}
          refreshToken={refreshToken}
          enablePolling={enablePolling}
        />
      </LazyRouteBoundary>
    </div>
  );
};

// --- Main App Component ---
// 全局状态 + SSE 推送 + 页面导航。
// Global state + SSE updates + navigation.
const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { themeVariant } = useTheme();
  const isClaude = themeVariant === 'claude';
  const navigate = useNavigate();
  const location = useLocation();
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsError, setBoardsError] = useState<string | null>(null);

  const [boardRefreshToken, setBoardRefreshToken] = useState(0);
  const [threadRefreshToken, setThreadRefreshToken] = useState(0);
  const [showBoardUpdateNotice, setShowBoardUpdateNotice] = useState(false);
  const [showThreadUpdateNotice, setShowThreadUpdateNotice] = useState(false);
  const [showVersionUpdateNotice, setShowVersionUpdateNotice] = useState(false);
  const [latestServerVersion, setLatestServerVersion] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);

  const [search, setSearch] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const threadMatch = location.pathname.match(/^\/board\/([^/]+)\/thread\/([^/]+)\/?$/);
  const boardMatch = location.pathname.match(/^\/board\/([^/]+)\/?$/);
  const currentBoardId = threadMatch?.[1] ?? boardMatch?.[1] ?? null;
  const currentThreadId = threadMatch?.[2] ?? null;
  const isThreadPage = Boolean(threadMatch);
  const isBoardPage = Boolean(boardMatch) && !isThreadPage;

  const routeRef = useRef({
    currentBoardId: null as string | null,
    currentThreadId: null as string | null,
    isThreadPage: false,
    isBoardPage: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K or / (if not in input)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    routeRef.current = {
      currentBoardId,
      currentThreadId,
      isThreadPage,
      isBoardPage,
    };
  }, [currentBoardId, currentThreadId, isThreadPage, isBoardPage]);

  useEffect(() => {
    setShowBoardUpdateNotice(false);
    setShowThreadUpdateNotice(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMockMode) return;

    // SSE：订阅服务端事件，用于新帖、新回复与版本更新提示。
    // SSE: subscribe to server events for new content and version notices.
    const es = new EventSource(`${apiBaseUrl}/api/events`);
    const parseData = (e: MessageEvent) => {
      if (!e.data) return null;
      try {
        return JSON.parse(e.data);
      } catch {
        return null;
      }
    };

    const handleServerVersion = (e: MessageEvent) => {
      const payload = parseData(e);
      const version = payload?.version ?? e.data;
      if (!version) return;

      const stored = localStorage.getItem('7ch_server_version');
      if (!stored) {
        localStorage.setItem('7ch_server_version', version);
        return;
      }
      if (stored !== version) {
        setLatestServerVersion(version);
        setShowVersionUpdateNotice(true);
      }
    };

    const handleThreadCreated = (e: MessageEvent) => {
      const payload = parseData(e);
      if (!payload) return;
      const { boardId } = payload as { boardId?: string };
      const { currentBoardId, isBoardPage } = routeRef.current;
      if (!isBoardPage || !currentBoardId || !boardId) return;
      if (currentBoardId === 'all' || currentBoardId === boardId) {
        setShowBoardUpdateNotice(true);
      }
    };

    const handlePostCreated = (e: MessageEvent) => {
      const payload = parseData(e);
      if (!payload) return;
      const { threadId, boardId } = payload as { threadId?: string; boardId?: string };
      const { currentThreadId, currentBoardId, isThreadPage, isBoardPage } = routeRef.current;
      if (isThreadPage && currentThreadId && threadId === currentThreadId) {
        setShowThreadUpdateNotice(true);
        return;
      }
      if (!isBoardPage || !currentBoardId || !boardId) return;
      if (currentBoardId === 'all' || currentBoardId === boardId) {
        setShowBoardUpdateNotice(true);
      }
    };

    const handleResync = () => {
      const { isThreadPage, isBoardPage } = routeRef.current;
      if (isThreadPage) setShowThreadUpdateNotice(true);
      if (isBoardPage) setShowBoardUpdateNotice(true);
    };

    es.addEventListener('server_version', handleServerVersion as EventListener);
    es.addEventListener('thread_created', handleThreadCreated as EventListener);
    es.addEventListener('post_created', handlePostCreated as EventListener);
    es.addEventListener('resync', handleResync as EventListener);
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);

    return () => {
      es.removeEventListener('server_version', handleServerVersion as EventListener);
      es.removeEventListener('thread_created', handleThreadCreated as EventListener);
      es.removeEventListener('post_created', handlePostCreated as EventListener);
      es.removeEventListener('resync', handleResync as EventListener);
      es.close();
    };
  }, []);

  // 隐藏线程（持久化到 LocalStorage）。
  // Hidden threads (persisted in LocalStorage).
  const [hiddenThreads, setHiddenThreads] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('7ch_hidden_threads');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 关注线程（持久化到 LocalStorage）。
  // Followed threads (persisted in LocalStorage).
  const [followedThreads, setFollowedThreads] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('7ch_followed_threads');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 弹窗与移动端 UI 状态。
  // Modal and mobile UI state.
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileLoginDialog, setShowMobileLoginDialog] = useState(false);

  const loadBoards = async () => {
    setBoardsError(null);
    try {
      const data = await api.getBoards();
      setBoards(mergeBoardsWithStatic(data));
    } catch (e: any) {
      const redirectPath = buildKnownErrorRedirectPath(e, `${location.pathname}${location.search}`);
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }
      setBoardsError(getDisplayErrorMessage(e, t));
        setBoards(mergeBoardsWithStatic([
          { id: 'all', name: 'board.all.name', description: 'board.all.desc' },
          { id: 'news', name: 'board.news.name', description: 'board.news.desc' },
          { id: 'g', name: 'board.g.name', description: 'board.g.desc' },
          { id: 'acg', name: 'board.acg.name', description: 'board.acg.desc' },
          { id: 'vip', name: 'board.vip.name', description: 'board.vip.desc' },
          { id: 'baito', name: 'board.baito.name', description: 'board.baito.desc' },
        ]));
    }
  };

  useEffect(() => {
    void loadBoards();
  }, []);

  const changeLang = (lng: string) => {
    // 语言切换：同时落地 localStorage，保持刷新后语言一致。
    // Language switch: persist to localStorage for reload consistency.
    i18n.changeLanguage(lng);
    localStorage.setItem('7ch_lang', lng);
  };

  const toggleHide = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHiddenThreads(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('7ch_hidden_threads', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const toggleFollow = (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    setFollowedThreads(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('7ch_followed_threads', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleBoardRefresh = () => {
    setShowBoardUpdateNotice(false);
    setBoardRefreshToken(t => t + 1);
  };

  const handleThreadRefresh = () => {
    setShowThreadUpdateNotice(false);
    setThreadRefreshToken(t => t + 1);
  };

  const handleVersionRefresh = () => {
    // 记录最新版本并强制刷新页面。
    // Store latest version then hard reload.
    if (latestServerVersion) {
      localStorage.setItem('7ch_server_version', latestServerVersion);
    }
    window.location.reload();
  };

  const handleVersionDismiss = () => {
    if (latestServerVersion) {
      localStorage.setItem('7ch_server_version', latestServerVersion);
    }
    setShowVersionUpdateNotice(false);
  };

  const handleThreadClick = (thread: Thread) => {
    navigate(`/board/${thread.boardId}/thread/${thread.id}`);
  };

  // --- Render Functions ---
  // 视图拆分为函数，便于阅读与复用。
  // Split rendering into functions for clarity.

  const renderHeader = () => (
    <header className="themed-header-shell sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <span className={cn('themed-brandmark text-xl sm:text-2xl', isClaude && 'text-[1.55rem] sm:text-[2rem]')}>7ちゃんねる</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('board.catalog')}
              className={cn(
                'themed-search-field w-48 rounded-xl px-3 py-1.5 pr-8 text-sm transition-colors focus:border-[hsl(var(--ring))] focus:outline-none',
                isClaude && 'w-56'
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
              <kbd className="themed-search-kbd hidden h-5 select-none items-center gap-1 rounded-md px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
                <span className="text-xs">⌘</span>K
              </kbd>
              <Search className="h-4 w-4 text-[hsl(var(--soft-foreground))]" />
            </div>
          </div>
          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 text-sm font-medium">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">{t('dialog.login.button')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('dialog.login.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('dialog.login.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('dialog.login.close')}</AlertDialogCancel>
                  <Link to="/docs">
                    <AlertDialogAction>{t('dialog.login.link_text')}</AlertDialogAction>
                  </Link>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <button className="themed-nav-link hover:underline" onClick={() => navigate('/')}>{t('nav.boards')}</button>
            <button
              className="themed-nav-link hover:underline"
              onClick={() => navigate('/favorites')}
            >
              {t('nav.favorites')}
            </button>
            <div className="border-l border-gray-300 dark:border-gray-700 pl-3 flex gap-2">
              <ThemeSwitcher compact />
              {['zh-CN', 'ja-JP'].map(l => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className={cn('text-xs', i18n.language === l ? 'font-bold text-foreground' : 'themed-meta')}
                >
                  {l === 'zh-CN' ? '中文' : '日'}
                </button>
              ))}
            </div>
          </div>
          {/* Mobile dropdown menu */}
          <div className="md:hidden relative">
            <button
              className="themed-nav-link p-2 text-sm font-medium"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              ☰
            </button>
            {showMobileMenu && (
              <div className="themed-card themed-card-featured absolute right-0 z-50 mt-2 w-64 overflow-hidden">
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary"
                    onClick={() => {
                      setShowMobileLoginDialog(true);
                      setShowMobileMenu(false);
                    }}
                  >
                    {t('dialog.login.button')}
                  </button>
                  <button
                    className="block w-full border-t border-border px-4 py-2 text-left text-sm text-foreground hover:bg-secondary"
                    onClick={() => {
                      navigate('/');
                      setShowMobileMenu(false);
                    }}
                  >
                    {t('nav.boards')}
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary"
                    onClick={() => {
                      navigate('/favorites');
                      setShowMobileMenu(false);
                    }}
                  >
                    {t('nav.favorites')}
                  </button>
                  <div className="border-t border-border px-4 py-3">
                    <div className="themed-kicker mb-2">
                      {t('theme.title')}
                    </div>
                    <ThemeSwitcher
                      compact
                      fullWidth
                      onSelect={() => setShowMobileMenu(false)}
                    />
                  </div>
                  <div className="border-t border-border pt-1">
                    {['zh-CN', 'ja-JP'].map(l => (
                      <button
                        key={l}
                        onClick={() => {
                          changeLang(l);
                          setShowMobileMenu(false);
                        }}
                        className={cn('block w-full px-4 py-2 text-left text-sm', i18n.language === l ? 'font-bold text-foreground' : 'themed-meta')}
                      >
                        {l === 'zh-CN' ? '中文' : '日'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const renderLiveNotices = () => (
    <>
      {showVersionUpdateNotice && (
        <div className="border-b border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold">{t('realtime.new_version')}</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleVersionRefresh}
                className="rounded border border-amber-300 bg-amber-100 px-3 py-1 text-amber-900 transition-colors hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/60 dark:text-amber-100 dark:hover:bg-amber-900"
              >
                {t('realtime.refresh_page')}
              </button>
              <button
                onClick={handleVersionDismiss}
                className="rounded border border-amber-200 px-3 py-1 text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/50"
              >
                {t('realtime.dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}
      {showThreadUpdateNotice && (
        <div className="border-b border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold">{t('realtime.new_replies')}</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleThreadRefresh}
                className="rounded border border-sky-300 bg-sky-100 px-3 py-1 text-sky-900 transition-colors hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/60 dark:text-sky-100 dark:hover:bg-sky-900"
              >
                {t('realtime.load_replies')}
              </button>
              <button
                onClick={() => setShowThreadUpdateNotice(false)}
                className="rounded border border-sky-200 px-3 py-1 text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-800 dark:text-sky-200 dark:hover:bg-sky-900/50"
              >
                {t('realtime.dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}
      {showBoardUpdateNotice && (
        <div className="border-b border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold">{t('realtime.new_content')}</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleBoardRefresh}
                className="rounded border border-blue-300 bg-blue-100 px-3 py-1 text-blue-900 transition-colors hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-100 dark:hover:bg-blue-900"
              >
                {t('realtime.refresh_list')}
              </button>
              <button
                onClick={() => setShowBoardUpdateNotice(false)}
                className="rounded border border-blue-200 px-3 py-1 text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:text-blue-200 dark:hover:bg-blue-900/50"
              >
                {t('realtime.dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderFooter = () => (
    <footer className={cn('themed-footer-shell mt-auto py-8 text-center text-sm', isClaude && 'bg-[hsl(var(--surface-muted))]')}>
      <div className="flex justify-center flex-wrap gap-4 sm:gap-6 mb-4">
        <Link to="/privacy"><button className="themed-nav-link hover:underline">{t('footer.privacy')}</button></Link>
        <Link to="/docs"><button className="themed-nav-link hover:underline">{t('footer.tech')}</button></Link>
        <Link to="/terms"><button className="themed-nav-link hover:underline">{t('footer.terms')}</button></Link>
        <Link to="/help"><button className="themed-nav-link hover:underline">{t('footer.help')}</button></Link>
        <Link to="/QA"><button className="themed-nav-link hover:underline">{t('footer.QA')}</button></Link>
        <Link to="/changelog"><button className="themed-nav-link hover:underline">Changelog</button></Link>
        <button className="themed-nav-link hover:underline" onClick={() => setShowDonateModal(true)}>{t('footer.donate')}</button>
      </div>
      <div>&copy; 2024 7ch Project. All rights reserved.</div>
    </footer>
  );

  const renderBoardsErrorState = () => (
    <div className="themed-card themed-card-featured p-6 sm:p-10">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700 sm:flex-row sm:items-center">
        <h2 className="themed-heading text-xl sm:text-2xl">
          {t('error.loadBoardsTitle')}
        </h2>
        <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800/40">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t('error.loadBoardsBadge')}
        </span>
      </div>

      <div className="mb-8 space-y-4 text-[15px] leading-relaxed text-foreground">
        <p className="font-medium text-foreground">{t('error.loadBoardsLead')}</p>
        <p>{boardsError}</p>
        <div className="themed-card-muted p-3 text-sm text-[hsl(var(--brand))]">
          <span className="mb-1 block font-bold">{t('error.loadBoardsNoteTitle')}</span>
          {t('error.loadBoardsNoteBody')}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="themed-card-muted p-4">
          <div className="themed-kicker mb-1">{t('error.loadBoardsActionLabel')}</div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{t('error.loadBoardsActionValue')}</div>
          <div className="themed-meta mt-1 text-xs">{t('error.loadBoardsActionBody')}</div>
        </div>
        <div className="themed-card-muted p-4">
          <div className="themed-kicker mb-1">{t('error.loadBoardsCauseLabel')}</div>
          <div className="text-lg font-bold text-foreground">{t('error.loadBoardsCauseValue')}</div>
          <div className="themed-meta mt-1 text-xs">{t('error.loadBoardsCauseBody')}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={() => void loadBoards()}
          className="themed-primary-action rounded-xl px-6 py-2 text-sm font-bold transition-colors"
        >
          {t('servicePause.retry')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="themed-secondary-action rounded-xl px-6 py-2 text-sm font-bold transition-colors"
        >
          {t('servicePause.home')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans bg-background text-foreground flex flex-col">
      {renderHeader()}
      {renderLiveNotices()}
      {/* Mobile Login Dialog - rendered outside main content to ensure proper layering */}
      {showMobileLoginDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,20,19,0.62)] p-4 backdrop-blur-[2px] md:hidden">
          <div className="themed-dialog-surface max-h-[80vh] w-full max-w-sm overflow-y-auto p-6">
            <h3 className="themed-heading mb-2 text-lg">{t('dialog.login.title')}</h3>
            <p className="themed-meta mb-4 text-sm">{t('dialog.login.description')}</p>
            <div className="flex justify-end gap-2">
              <button
                className="themed-secondary-action rounded-xl px-4 py-2 text-sm"
                onClick={() => setShowMobileLoginDialog(false)}
              >
                {t('dialog.login.close')}
              </button>
              <Link to="/docs" onClick={() => setShowMobileLoginDialog(false)}>
                <button className="themed-primary-action rounded-xl px-4 py-2 text-sm">
                  {t('dialog.login.link_text')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1">
        <Routes>
          {/* 首页 - 看板列表 */}
          <Route path="/" element={
            <div className="mx-auto mt-4 max-w-4xl p-4">
              {boardsError ? renderBoardsErrorState() : (
                <div className="themed-card themed-card-featured p-6">
                  <h2 className="themed-heading mb-6 border-b border-border pb-3 text-xl">{t('nav.boards')}</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(search.trim() ? boards.filter(b => {
                      const s = search.trim().toLowerCase();
                      const name = `${b.id} ${t(b.name)} ${t(b.description)}`.toLowerCase();
                      return name.includes(s);
                    }) : boards).map(b => (
                      <div
                        key={b.id}
                        onClick={() => navigate(`/board/${b.id}`)}
                        className="themed-card-muted cursor-pointer p-4 transition-colors hover:bg-white/70"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <div className="themed-heading-sm text-lg text-[hsl(var(--brand))]">/{b.id}/ - {t(b.name)}</div>
                          {b.id === commonLinksBoard.id && (
                            <span className="themed-chip-accent inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                              {t('commonLinks.staticBadge')}
                            </span>
                          )}
                        </div>
                        <div className="themed-meta text-sm">{t(b.description)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          } />

          <Route path="/board/links" element={
            <LazyRouteBoundary>
              <CommonLinksBoardPage search={search} onBack={() => navigate('/')} />
            </LazyRouteBoundary>
          } />
          <Route path="/board/links/thread/:linkId" element={
            <LazyRouteBoundary>
              <CommonLinkDetailPage onBack={() => navigate('/board/links')} />
            </LazyRouteBoundary>
          } />

          {/* 看板详情页 */}
          <Route path="/board/:boardId" element={
            <BoardView
              boards={boards}
              search={search}
              onCreateThread={async (payload: any) => {
                // Handled inside BoardView component
              }}
              onThreadClick={handleThreadClick}
              onToggleHide={toggleHide}
              onToggleFollow={toggleFollow}
              hiddenThreads={hiddenThreads}
              followedThreads={followedThreads}
              refreshToken={boardRefreshToken}
            />
          } />

          {/* 帖子详情页 */}
          <Route path="/board/:boardId/thread/:threadId" element={
            <ThreadViewWrapper
              followedThreads={followedThreads}
              onToggleFollow={toggleFollow}
              refreshToken={threadRefreshToken}
              enablePolling={!sseConnected}
            />
          } />

          {/* 收藏夹 */}
          <Route path="/favorites" element={
            <FavoritesView
              followedThreads={followedThreads}
              boards={boards}
              onThreadClick={handleThreadClick}
              onToggleHide={toggleHide}
              onToggleFollow={toggleFollow}
              hiddenThreads={hiddenThreads}
            />
          } />

          {/* 文档页面 */}
          <Route path="/service-paused" element={
            <LazyRouteBoundary>
              <ServicePausedPage onOpenDonate={() => setShowDonateModal(true)} />
            </LazyRouteBoundary>
          } />
          <Route path="/rate-limited" element={
            <LazyRouteBoundary>
              <RateLimitedPage />
            </LazyRouteBoundary>
          } />
          <Route path="/docs" element={
            <LazyRouteBoundary>
              <DocsPage onBack={() => navigate('/')} />
            </LazyRouteBoundary>
          } />
          <Route path="/privacy" element={
            <LazyRouteBoundary>
              <PrivacyPolicyPage onBack={() => navigate('/')} />
            </LazyRouteBoundary>
          } />
          <Route path="/terms" element={
            <LazyRouteBoundary>
              <TermsPage onBack={() => navigate('/')} />
            </LazyRouteBoundary>
          } />
          <Route path="/help" element={
            <LazyRouteBoundary>
              <HelpPage onBack={() => navigate('/')} />
            </LazyRouteBoundary>
          } />
          <Route path="/QA" element={
            <LazyRouteBoundary>
              <QAPage onBack={() => navigate('/')} />
            </LazyRouteBoundary>
          } />
          <Route path="/changelog" element={
            <LazyRouteBoundary>
              <ChangelogPage onBack={() => navigate('/')} />
            </LazyRouteBoundary>
          } />
          {/* 前端不再公开暴露订阅转换页；后端 `/api/subscription/*` 仍保留。 */}
          <Route path="/tools/convert" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {location.pathname !== '/service-paused' && location.pathname !== '/rate-limited' && renderFooter()}
      <DonateModal open={showDonateModal} onClose={() => setShowDonateModal(false)} />
    </div>
  );
};

export default App;
