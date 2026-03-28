import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { InlineErrorNotice } from './InlineErrorNotice';
import { buildKnownErrorRedirectPath } from '../lib/errorRedirect';
import { getDisplayErrorMessage } from '../lib/errorMessage';
import { api } from '../services/api';
import { ThreadDetail, Post } from '../types';
import { PostContent } from './PostContent';
import { PostForm } from './PostForm';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

// 线程详情：展示 OP + 全部回复、引用预览、以及回复表单。
// Thread detail: renders OP + replies, quote previews, and reply form.

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
        <PostContent content={post.content} allPosts={allPosts} onQuoteClick={onReply} />
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.getThreadContent(threadId);
      setData(res);
      setErrorMessage(null);
    } catch (e) {
      const redirectPath = buildKnownErrorRedirectPath(e, `${location.pathname}${location.search}`);
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }
      setErrorMessage(getDisplayErrorMessage(e, t));
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
      const textarea = document.querySelector<HTMLTextAreaElement>('textarea[data-post-form-textarea="true"]');
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

  if (!data && errorMessage) {
    return (
      <div className="max-w-4xl mx-auto px-2 pb-20 sm:px-2">
        <InlineErrorNotice
          title={t('error.loadThreadTitle')}
          message={errorMessage}
          actionLabel={t('servicePause.retry')}
          onAction={() => void loadData()}
        />
      </div>
    );
  }

  if (!data) return <div className="p-4 text-center text-gray-500 dark:text-gray-400">{t('meta.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-0 sm:px-2">
      {errorMessage && (
        <InlineErrorNotice
          title={t('error.loadThreadTitle')}
          message={errorMessage}
          className="mb-4"
        />
      )}
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
        <Dialog open={showReplyForm} onOpenChange={setShowReplyForm}>
          <div className="flex justify-center">
            <DialogTrigger asChild>
              <button
                className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 bg-white px-6 py-3 font-bold text-[#333] shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
              >
                <span className="text-xl text-[#2da0b3]">✏️</span>
                {t('thread.reply')}
              </button>
            </DialogTrigger>
          </div>
          <DialogContent className="max-w-4xl w-[95vw] p-0 border-none bg-transparent shadow-none [&>button]:hidden">
            <PostForm
              key={formKey}
              threadId={threadId}
              onSubmit={async (payload: any) => {
                await handleReplySubmit(payload);
                setShowReplyForm(false);
              }}
              onCancel={() => setShowReplyForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
