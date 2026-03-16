import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useNavigate, useParams, Route, Routes, Link, useLocation } from 'react-router-dom';
import { api, apiBaseUrl, useMock as isMockMode } from './services/api';
import { Board, Thread } from './types';
import { PostForm } from './components/PostForm';
import { ThreadView } from './components/ThreadDetail';
import { Button } from './components/ui/button';
import { DonateModal } from './components/DonateModal';
import { Pagination } from './components/Pagination';
import { ThemeSwitcher } from './components/ThemeSwitcher';

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
} from "@/components/ui/alert-dialog"
import { Docs } from './pages/Docs';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { Help } from './pages/Help';
import { QA } from './pages/QA';
import { Changelog } from './pages/Changelog';
import { ServicePaused } from './pages/ServicePaused';
import { SubscriptionConvert } from './pages/SubscriptionConvert';
import { buildServicePausedPath, isServicePausedCandidateError } from './lib/servicePause';

// 应用入口：路由、全局状态、SSE 通知、以及主要布局。
// App entry: routing, global state, SSE notices, and overall layout.

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

  // 设备判定：宽度 < 768 视为移动端。
  // Device detection: width < 768 treated as mobile.
  const [isMobile, setIsMobile] = useState(false);

  // 无限滚动所需的 observer 与触发元素。
  // IntersectionObserver + sentinel for infinite scroll.
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

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

  // 拉取线程列表：支持覆盖或追加。
  // Fetch threads: replace or append.
  const loadThreads = async (page: number, append: boolean = false) => {
    if (loading || !boardId) return;
    setLoading(true);

    try {
      const data = await api.getThreads(boardId, page);
      if (append) {
        setThreads(prev => [...prev, ...data.threads]);
      } else {
        setThreads(data.threads);
      }
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setHasMore(page < data.totalPages);
    } catch (error) {
      if (isServicePausedCandidateError(error)) {
        navigate(buildServicePausedPath(`${location.pathname}${location.search}`));
        return;
      }
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  // 首次进入或板块切换时重新加载。
  // Reload on first mount or board switch.
  useEffect(() => {
    if (boardId) {
      setThreads([]);
      setCurrentPage(1);
      setHasMore(true);
      loadThreads(1, false);
    }
    setShowPostForm(false);
  }, [boardId]);

  useEffect(() => {
    if (!boardId || refreshToken === 0) return;
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
    if (!isMobile || !hasMore || loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
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

  const board = boards.find(b => b.id === boardId);
  if (!board) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Board not found</div>;
  const isAll = boardId === 'all';

  const renderThreadCard = (thread: Thread, boardName: string) => {
    if (hiddenThreads.has(thread.id)) {
      return (
        <div key={thread.id} className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <span className="font-bold">{t('meta.hidden_thread')}: {thread.title.substring(0, 30)}...</span>
          <button onClick={(e) => onToggleHide(e, thread.id)} className="text-[#0056b3] hover:underline">[{t('meta.show')}]</button>
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
      <div key={thread.id} className="relative group rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="absolute top-4 right-4 text-xs text-gray-400 dark:text-gray-500">
          {dateStr} <span className="ml-2">ID:{thread.opPost.uid}</span>
          <button onClick={(e) => onToggleHide(e, thread.id)} className="ml-2 text-[#0056b3] hover:underline">[{t('meta.hide')}]</button>
        </div>
        <div className="mt-1">
          <div className="mb-2 pr-40">
            <span
              className="cursor-pointer text-lg font-bold text-[#333] hover:text-[#0056b3] hover:underline dark:text-gray-100 dark:hover:text-sky-300"
              onClick={() => onThreadClick(thread)}
            >
              {thread.title}
            </span>
          </div>
          <div
            className="mb-3 cursor-pointer text-sm leading-relaxed text-[#333] dark:text-gray-200"
            onClick={() => onThreadClick(thread)}
          >
            {thread.opPost.content.length > 200 ? thread.opPost.content.substring(0, 200) + '...' : thread.opPost.content}
          </div>
          <div className="mb-3">
            <a className="bbs-link text-sm break-all" href={`/board/${thread.boardId}/thread/${thread.id}`}>
              https://7ch-web.vercel.app/board/{thread.boardId}/thread/{thread.id}/
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1 text-[#0056b3]">
              <span>💬</span>
              <span>{thread.postCount}</span>
            </div>
            <div className="text-[#0056b3]">{boardName}</div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>{thread.viewCount}</span>
            </div>
            <button
              onClick={(e) => onToggleFollow(e, thread.id)}
              className={`px-3 py-1 rounded text-xs transition-colors ml-auto border ${isFollowed ? 'bg-white text-[#2da0b3] border-[#2da0b3]' : 'bg-[#2da0b3] text-white border-[#2da0b3] hover:bg-[#238a9b]'}`}
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
    const text = `${thread.title} ${thread.opPost.content}`.toLowerCase();
    return text.includes(s);
  }) : threads;

  return (
    <div className="bg-[#f0f0f0] min-h-[calc(100vh-3.5rem)] dark:bg-background">
      <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
        {!isAll && (
          <div className="mb-6 flex justify-center">
            {!showPostForm ? (
              <button
                onClick={() => setShowPostForm(true)}
                className="flex items-center gap-2 rounded border border-gray-300 bg-white px-6 py-3 font-bold text-[#333] shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                <span className="text-xl text-[#2da0b3]">✏️</span>
                {t('thread.new')}
              </button>
            ) : (
              <PostForm
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
                }}
                onCancel={() => setShowPostForm(false)}
              />
            )}
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
            {loading && <span className="text-gray-500 dark:text-gray-400">{t('meta.loading')}...</span>}
            {!loading && hasMore && (
              <button
                onClick={() => {
                  const nextPage = currentPage + 1;
                  setCurrentPage(nextPage);
                  loadThreads(nextPage, true);
                }}
                className="text-[#0056b3] hover:underline dark:text-sky-300"
              >
                {t('pagination.load_more')}
              </button>
            )}
            {!hasMore && threads.length > 0 && (
              <div className="text-gray-500 dark:text-gray-400">{t('pagination.no_more')}</div>
            )}
          </div>
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
        const hasServicePauseFailure = results.some(
          (result) =>
            result.status === 'rejected' && isServicePausedCandidateError(result.reason)
        );
        if (ids.length > 0 && hasServicePauseFailure && validThreads.length === 0) {
          navigate(buildServicePausedPath(`${location.pathname}${location.search}`));
          return;
        }
        validThreads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setFavThreads(validThreads);
      } finally {
        setLoadingFavs(false);
      }
    };
    loadFavoriteThreads();
  }, [followedThreads.size]);

  const renderThreadCard = (thread: Thread, boardName: string) => {
    if (hiddenThreads.has(thread.id)) {
      return (
        <div key={thread.id} className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <span className="font-bold">{t('meta.hidden_thread')}: {thread.title.substring(0, 30)}...</span>
          <button onClick={(e) => onToggleHide(e, thread.id)} className="text-[#0056b3] hover:underline">[{t('meta.show')}]</button>
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
      <div key={thread.id} className="relative group rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="absolute top-4 right-4 text-xs text-gray-400 dark:text-gray-500">
          {dateStr} <span className="ml-2">ID:{thread.opPost.uid}</span>
          <button onClick={(e) => onToggleHide(e, thread.id)} className="ml-2 text-[#0056b3] hover:underline">[{t('meta.hide')}]</button>
        </div>
        <div className="mt-1">
          <div className="mb-2 pr-40">
            <span
              className="cursor-pointer text-lg font-bold text-[#333] hover:text-[#0056b3] hover:underline dark:text-gray-100 dark:hover:text-sky-300"
              onClick={() => onThreadClick(thread)}
            >
              {thread.title}
            </span>
          </div>
          <div
            className="mb-3 cursor-pointer text-sm leading-relaxed text-[#333] dark:text-gray-200"
            onClick={() => onThreadClick(thread)}
          >
            {thread.opPost.content.length > 200 ? thread.opPost.content.substring(0, 200) + '...' : thread.opPost.content}
          </div>
          <div className="mb-3">
            <a className="bbs-link text-sm break-all" href={`/board/${thread.boardId}/thread/${thread.id}`}>
              https://7ch-web.vercel.app/board/{thread.boardId}/thread/{thread.id}/
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1 text-[#0056b3]">
              <span>💬</span>
              <span>{thread.postCount}</span>
            </div>
            <div className="text-[#0056b3]">{boardName}</div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>{thread.viewCount}</span>
            </div>
            <button
              onClick={(e) => onToggleFollow(e, thread.id)}
              className={`px-3 py-1 rounded text-xs transition-colors ml-auto border ${isFollowed ? 'bg-white text-[#2da0b3] border-[#2da0b3]' : 'bg-[#2da0b3] text-white border-[#2da0b3] hover:bg-[#238a9b]'}`}
            >
              {isFollowed ? t('meta.following') : t('meta.follow')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#f0f0f0] min-h-[calc(100vh-3.5rem)] dark:bg-background">
      <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
        <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-700 dark:text-gray-100">
          <span>★</span> {t('nav.favorites')}
        </div>
        {loadingFavs ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">{t('meta.loading')}</div>
        ) : favThreads.length === 0 ? (
          <div className="rounded border border-gray-200 bg-white p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
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

  if (!boardId || !threadId) return <div>Invalid thread</div>;

  return (
    <div className="bg-[#f0f0f0] min-h-[calc(100vh-3.5rem)] pt-4 dark:bg-background">
      <ThreadView
        threadId={threadId}
        onBack={() => navigate(`/board/${boardId}`)}
        isFollowed={followedThreads.has(threadId)}
        onToggleFollow={(e) => onToggleFollow(e, threadId)}
        refreshToken={refreshToken}
        enablePolling={enablePolling}
      />
    </div>
  );
};

// --- Main App Component ---
// 全局状态 + SSE 推送 + 页面导航。
// Global state + SSE updates + navigation.
const App: React.FC = () => {
  const { t, i18n } = useTranslation();
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

  useEffect(() => {
    api.getBoards()
      .then(setBoards)
      .catch((e: any) => {
        if (isServicePausedCandidateError(e)) {
          navigate(buildServicePausedPath(`${location.pathname}${location.search}`));
          return;
        }
        setBoardsError(String(e?.message ?? e) || '加载失败');
        setBoards([
          { id: 'all', name: 'board.all.name', description: 'board.all.desc' },
          { id: 'news', name: 'board.news.name', description: 'board.news.desc' },
          { id: 'g', name: 'board.g.name', description: 'board.g.desc' },
          { id: 'acg', name: 'board.acg.name', description: 'board.acg.desc' },
          { id: 'vip', name: 'board.vip.name', description: 'board.vip.desc' },
        ]);
      });
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
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-100 font-serif tracking-tight">7ちゃんねる</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('board.catalog')}
              className="w-48 rounded border border-gray-300 bg-gray-100 px-3 py-1 pr-8 text-sm text-gray-800 transition-colors focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden h-5 select-none items-center gap-1 rounded border border-gray-300 bg-gray-200 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:inline-flex">
                <span className="text-xs">⌘</span>K
              </kbd>
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          {/* Desktop navigation - hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 text-sm text-[#0056b3] font-medium">
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
            <button className="hover:underline" onClick={() => navigate('/')}>{t('nav.boards')}</button>
            <button
              className="hover:underline"
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
                  className={`text-xs ${i18n.language === l ? 'font-bold text-black dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  {l === 'zh-CN' ? '中文' : '日'}
                </button>
              ))}
            </div>
          </div>
          {/* Mobile dropdown menu */}
          <div className="md:hidden relative">
            <button
              className="p-2 text-sm font-medium text-[#0056b3] dark:text-sky-300"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              ☰
            </button>
            {showMobileMenu && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setShowMobileLoginDialog(true)}
                  >
                    {t('dialog.login.button')}
                  </button>
                  <button
                    className="block w-full border-t border-gray-200 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      navigate('/');
                      setShowMobileMenu(false);
                    }}
                  >
                    {t('nav.boards')}
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      navigate('/favorites');
                      setShowMobileMenu(false);
                    }}
                  >
                    {t('nav.favorites')}
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('theme.title')}
                    </div>
                    <ThemeSwitcher />
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                    {['zh-CN', 'ja-JP'].map(l => (
                      <button
                        key={l}
                        onClick={() => {
                          changeLang(l);
                          setShowMobileMenu(false);
                        }}
                        className={`block w-full px-4 py-2 text-left text-sm ${i18n.language === l ? 'font-bold text-black dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}
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
    <footer className="mt-auto py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-border bg-card">
      <div className="flex justify-center flex-wrap gap-4 sm:gap-6 mb-4">
        <Link to="/privacy"><button className="text-gray-500 hover:underline hover:text-[#0056b3] dark:text-gray-400 dark:hover:text-sky-300">{t('footer.privacy')}</button></Link>
        <Link to="/docs"><button className="text-gray-500 hover:underline hover:text-[#0056b3] dark:text-gray-400 dark:hover:text-sky-300">{t('footer.tech')}</button></Link>
        <Link to="/terms"><button className="text-gray-500 hover:underline hover:text-[#0056b3] dark:text-gray-400 dark:hover:text-sky-300">{t('footer.terms')}</button></Link>
        <Link to="/help"><button className="text-gray-500 hover:underline hover:text-[#0056b3] dark:text-gray-400 dark:hover:text-sky-300">{t('footer.help')}</button></Link>
        <Link to="/QA"><button className="text-gray-500 hover:underline hover:text-[#0056b3] dark:text-gray-400 dark:hover:text-sky-300">{t('footer.QA')}</button></Link>
        <Link to="/changelog"><button className="text-gray-500 hover:underline hover:text-[#0056b3] dark:text-gray-400 dark:hover:text-sky-300">Changelog</button></Link>
        <Link to="/tools/convert">
          <button className="inline-flex items-center gap-2 text-gray-500 hover:underline hover:text-[#0056b3] dark:text-gray-400 dark:hover:text-sky-300">
            <span>{t('tools.convert.link')}</span>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
              {t('tools.convert.badge')}
            </span>
          </button>
        </Link>
        <button className="text-gray-500 hover:underline hover:text-[#0056b3] dark:text-gray-400 dark:hover:text-sky-300" onClick={() => setShowDonateModal(true)}>{t('footer.donate')}</button>
      </div>
      <div>&copy; 2024 7ch Project. All rights reserved.</div>
    </footer>
  );

  return (
    <div className="min-h-screen font-sans bg-background text-foreground flex flex-col">
      {renderHeader()}
      {renderLiveNotices()}
      {/* Mobile Login Dialog - rendered outside main content to ensure proper layering */}
      {showMobileLoginDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:hidden">
          <div className="bg-white rounded p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-2">{t('dialog.login.title')}</h3>
            <p className="text-sm mb-4">{t('dialog.login.description')}</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded text-sm"
                onClick={() => setShowMobileLoginDialog(false)}
              >
                {t('dialog.login.close')}
              </button>
              <Link to="/docs" onClick={() => setShowMobileLoginDialog(false)}>
                <button className="px-4 py-2 bg-[#0056b3] text-white rounded text-sm">
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
            <div className="p-4 max-w-4xl mx-auto mt-4">
              <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">{t('nav.boards')}</h2>
                {boardsError && (
                  <div className="mb-4 p-3 rounded border border-red-200 bg-red-100 text-red-700">
                    {t('meta.loading')}: {boardsError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(search.trim() ? boards.filter(b => {
                    const s = search.trim().toLowerCase();
                    const name = `${b.id} ${t(b.name)} ${t(b.description)}`.toLowerCase();
                    return name.includes(s);
                  }) : boards).map(b => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/board/${b.id}`)}
                      className="p-4 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="font-bold text-[#0056b3] text-lg mb-1">/{b.id}/ - {t(b.name)}</div>
                      <div className="text-sm text-gray-500">{t(b.description)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
          <Route path="/service-paused" element={<ServicePaused />} />
          <Route path="/docs" element={<Docs onBack={() => navigate('/')} />} />
          <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate('/')} />} />
          <Route path="/terms" element={<Terms onBack={() => navigate('/')} />} />
          <Route path="/help" element={<Help onBack={() => navigate('/')} />} />
          <Route path="/QA" element={<QA onBack={() => navigate('/')} />} />
          <Route path="/changelog" element={<Changelog onBack={() => navigate('/')} />} />
          <Route path="/tools/convert" element={<SubscriptionConvert onBack={() => navigate('/')} />} />
        </Routes>
      </main>
      {renderFooter()}
      <DonateModal open={showDonateModal} onClose={() => setShowDonateModal(false)} />
    </div>
  );
};

export default App;
