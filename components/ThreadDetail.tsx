import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildServicePausedPath, isServicePausedCandidateError } from '../lib/servicePause';
import { useTheme } from './theme-provider';
import { api } from '../services/api';
import { ThreadDetail, Post } from '../types';
import { PostForm } from './PostForm';

// 线程详情：展示 OP + 全部回复、引用预览、以及回复表单。
// Thread detail: renders OP + replies, quote previews, and reply form.

// --- Rich Text Component (Anchor Logic) ---
// 引用/链接解析：识别 >>123 与 URL，并提供悬停预览。
// Quote/URL parsing: detect >>123 and URLs, plus hover previews.
interface RichTextProps {
  content: string;
  allPosts: Post[];
  onQuoteClick: (id: number) => void;
}

const QUOTE_PROTOCOL = 'quote://';
const quoteTokenPattern = />>(\d{1,7})/g;

const parseQuoteId = (href?: string): number | null => {
  if (!href?.startsWith(QUOTE_PROTOCOL)) return null;
  const id = Number.parseInt(href.slice(QUOTE_PROTOCOL.length), 10);
  return Number.isFinite(id) ? id : null;
};

const transformQuoteSyntax = (source: string): string => {
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  const lines = source.split('\n');

  return lines.map((line) => {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);

    if (fenceMatch) {
      const currentFenceChar = fenceMatch[1][0] as '`' | '~';
      if (!inFence) {
        inFence = true;
        fenceChar = currentFenceChar;
      } else if (fenceChar === currentFenceChar) {
        inFence = false;
        fenceChar = null;
      }
      return line;
    }

    if (inFence) return line;

    // 避免改写 inline code 内的文本，只处理正文中的 >>123。
    // Avoid rewriting inline code text; only transform plain text >>123 tokens.
    return line
      .split(/(`+[^`]*`+)/g)
      .map((segment) => {
        if (segment.startsWith('`') && segment.endsWith('`')) {
          return segment;
        }
        return segment.replace(quoteTokenPattern, (_match, id) => `[>>${id}](${QUOTE_PROTOCOL}${id})`);
      })
      .join('');
  }).join('\n');
};

interface QuoteAnchorProps {
  targetId: number;
  allPosts: Post[];
  onQuoteClick: (id: number) => void;
}

const QuoteAnchor: React.FC<QuoteAnchorProps> = ({ targetId, allPosts, onQuoteClick }) => {
  const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const post = allPosts.find(p => p.id === targetId);
    if (post) {
      setHoveredPost(post);
      // 基于目标元素计算 tooltip 的屏幕位置。
      // Compute tooltip position based on target element.
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({ x: rect.left, y: rect.bottom + 5 });
    }
  };

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="cursor-pointer border-none bg-transparent p-0 text-[#0056b3] hover:underline dark:text-sky-300"
        onClick={() => onQuoteClick(targetId)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHoveredPost(null)}
      >
        {`>>${targetId}`}
      </button>
      {hoveredPost && hoveredPost.id === targetId && (
        <span
          className="fixed z-50 max-w-md rounded border border-gray-400 bg-white p-3 text-left text-xs shadow-xl pointer-events-none dark:border-gray-700 dark:bg-gray-900"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <span className="mb-2 flex justify-between border-b pb-1 font-bold text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <span>{hoveredPost.id} : <span className="text-[#117743] dark:text-emerald-300">{hoveredPost.name}</span></span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{hoveredPost.createdAt.split('T')[0]}</span>
          </span>
          <span className="block max-h-40 overflow-hidden leading-snug text-gray-800 dark:text-gray-200">
            {hoveredPost.content}
          </span>
        </span>
      )}
    </span>
  );
};

const RichText: React.FC<RichTextProps> = ({ content, allPosts, onQuoteClick }) => {
  const markdown = useMemo(() => transformQuoteSyntax(content), [content]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="break-words text-[15px] leading-relaxed text-[#333] dark:text-gray-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        skipHtml
        components={{
          a: ({ href, children, ...props }) => {
            const targetId = parseQuoteId(href);
            if (targetId !== null) {
              return (
                <QuoteAnchor
                  targetId={targetId}
                  allPosts={allPosts}
                  onQuoteClick={onQuoteClick}
                />
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-[#0056b3] hover:underline dark:text-sky-300"
                {...props}
              >
                {children}
              </a>
            );
          },
          p: ({ children }) => <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-4 border-gray-300 pl-3 text-gray-700 dark:border-gray-600 dark:text-gray-300">{children}</blockquote>
          ),
          pre: ({ children }) => <div className="my-2">{children}</div>,
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.92em] dark:bg-gray-800 dark:text-gray-100" {...props}>
                  {children}
                </code>
              );
            }

            const match = /language-([a-zA-Z0-9_-]+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');

            return (
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={match?.[1] ?? 'text'}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  border: isDark ? '1px solid #364152' : '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  background: isDark ? '#111827' : '#f8fafc',
                  fontSize: '0.85rem',
                }}
              >
                {code}
              </SyntaxHighlighter>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm dark:border-gray-700">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
          tr: ({ children }) => <tr className="border-b border-gray-300 dark:border-gray-700">{children}</tr>,
          th: ({ children }) => <th className="border border-gray-300 px-2 py-1 text-left font-bold dark:border-gray-700">{children}</th>,
          td: ({ children }) => <td className="border border-gray-300 px-2 py-1 align-top dark:border-gray-700">{children}</td>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

// --- Single Post Component ---
const SinglePost: React.FC<{ post: Post, allPosts: Post[], onReply: (id: number) => void }> = ({ post, allPosts, onReply }) => {
  const { t, i18n } = useTranslation();
  const d = new Date(post.createdAt);

  // 根据语言格式化时间（中/日两种风格）。
  // Format timestamp based on locale (CN/JP styles).
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

  const displayName = post.name === 'Anonymous' ? t('meta.anonymous') : post.name;

  return (
    <div className="mb-3 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:rounded-sm sm:border sm:shadow-sm" id={`p${post.id}`}>
      <div className="mb-3 flex flex-wrap items-baseline gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-bold text-black dark:text-gray-100">{post.id}</span>
        <span className="font-bold text-[#333] dark:text-gray-100">
          {displayName}
          {post.tripcode && <span className="ml-1 font-normal text-[#117743] dark:text-emerald-300">{post.tripcode}</span>}
        </span>
        <span className="text-xs">{dateStr}</span>
        <span className="text-xs">ID:{post.uid}</span>
        <div className="ml-auto text-xs flex gap-2">
          <button onClick={() => onReply(post.id)} className="text-[#0056b3] hover:underline dark:text-sky-300">[Reply]</button>
        </div>
      </div>
      <div className="pl-0 sm:pl-2">
        <RichText content={post.content} allPosts={allPosts} onQuoteClick={onReply} />
      </div>
    </div>
  );
};

// --- Main Thread View ---
interface ThreadViewProps {
  threadId: string;
  onBack: () => void;
  isFollowed: boolean;
  onToggleFollow: (e: any) => void;
  refreshToken: number;
  enablePolling: boolean;
}

export const ThreadView: React.FC<ThreadViewProps> = ({ threadId, onBack, isFollowed, onToggleFollow, refreshToken, enablePolling }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<ThreadDetail | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.getThreadContent(threadId);
      setData(res);
    } catch (e) {
      if (isServicePausedCandidateError(e)) {
        navigate(buildServicePausedPath(`${location.pathname}${location.search}`));
        return;
      }
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    if (!enablePolling) return;
    // 轮询用于非 SSE 场景，避免线程内容过旧。
    // Polling is a fallback when SSE is not enabled.
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [threadId, enablePolling]);

  useEffect(() => {
    if (refreshToken === 0) return;
    loadData();
  }, [refreshToken]);

  const handleReplySubmit = async (payload: any) => {
    // 回复成功后刷新内容，并触发滚动到底部。
    // After reply, refresh content and scroll to bottom.
    await api.createPost(payload);
    await loadData();
    setFormKey(k => k + 1);
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
  };

  const insertQuote = (id: number) => {
    // 点击引用：自动打开表单并插入 >>id。
    // On quote click: open form and insert >>id.
    setShowReplyForm(true);
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const insert = `>>${id}\n`;
        textarea.value = text.substring(0, start) + insert + text.substring(end);
        const ev = new Event('input', { bubbles: true });
        textarea.dispatchEvent(ev);
        textarea.focus();
      }
      const form = document.getElementById('reply-form');
      if (form) form.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!data) return <div className="p-4 text-center text-gray-500 dark:text-gray-400">{t('meta.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-0 sm:px-2">
      <div className="mb-4 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:rounded-sm sm:shadow-sm">
        <div className="mb-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <button onClick={onBack} className="mr-2 text-[#0056b3] hover:underline dark:text-sky-300">
            &lt; {t('nav.boards')}
          </button>
          <span>/ {data.boardId} /</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-[#333] dark:text-gray-100 md:text-2xl">{data.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1 text-[#d32f2f]">
            <span>💬</span> {data.postCount}
          </span>
          <span className="flex items-center gap-1 text-[#f57c00]">
            <span>⚡</span> {data.viewCount}
          </span>
          <button
            onClick={onToggleFollow}
            className={`px-3 py-0.5 rounded text-xs transition-colors border ${isFollowed ? 'bg-white text-[#2da0b3] border-[#2da0b3]' : 'bg-[#2da0b3] text-white border-[#2da0b3] hover:bg-[#238a9b]'}`}
          >
            {isFollowed ? t('meta.following') : t('meta.follow')}
          </button>
        </div>
      </div>
      <div className="space-y-0 sm:space-y-4">
        {data.posts.map(post => (
          <SinglePost
            key={post.id}
            post={post}
            allPosts={data.posts}
            onReply={insertQuote}
          />
        ))}
      </div>
      <div className="mt-6 border-t border-gray-200 bg-white p-4 pt-4 dark:border-gray-700 dark:bg-gray-900 sm:rounded-sm shadow-sm" id="reply-form">
        {!showReplyForm ? (
          <div className="flex justify-center">
            <button
              onClick={() => setShowReplyForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 bg-white px-6 py-3 font-bold text-[#333] shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
            >
              <span className="text-xl text-[#2da0b3]">✏️</span>
              {t('thread.reply')}
            </button>
          </div>
        ) : (
          <>
            <h3 className="mb-2 border-b border-gray-200 pb-1 font-bold text-gray-600 dark:border-gray-700 dark:text-gray-300">{t('thread.reply')}</h3>
            <div className="flex justify-center mt-2">
              <PostForm
                key={formKey}
                threadId={threadId}
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
