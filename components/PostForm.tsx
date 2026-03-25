import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { InlineErrorNotice } from './InlineErrorNotice';
import { buildKnownErrorRedirectPath } from '../lib/errorRedirect';
import { getDisplayErrorMessage } from '../lib/errorMessage';
import { CreatePostRequest, CreateThreadRequest } from '../types';

// 发帖/回帖表单：同一组件兼顾新线程与回复。
// Post/reply form: single component handles thread creation and replies.
interface PostFormProps {
  boardId?: string; // If present, creating thread
  threadId?: string; // If present, replying
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({ boardId, threadId, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  // 当传入 boardId 时，表示创建新线程；否则是回复。
  // If boardId exists, we are creating a thread; otherwise replying.
  const isNewThread = !!boardId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert(t('error.required'));
      return;
    }

    // 组装请求体：根据模式选择线程/回复结构。
    // Build payload: choose thread or reply shape based on mode.
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (isNewThread) {
        const payload: CreateThreadRequest = {
          boardId: boardId!,
          title: title.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          content: content.trim()
        };
        await onSubmit(payload);
      } else {
        const payload: CreatePostRequest = {
          threadId: threadId!,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          content: content.trim()
        };
        await onSubmit(payload);
        // 回复成功后清空正文，方便继续回复。
        // Clear content after successful reply for quick follow-ups.
        setContent('');
      }
    } catch (err) {
      const redirectPath = buildKnownErrorRedirectPath(err, `${location.pathname}${location.search}`);
      if (redirectPath) {
        window.location.assign(redirectPath);
        return;
      }
      setSubmitError(getDisplayErrorMessage(err, t));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl rounded border border-[#ccb] bg-[#f0e0d6] p-4 shadow-sm dark:border-[#5d463e] dark:bg-[#2c211c]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {isNewThread && (
          <div className="flex items-center">
            <label className="w-20 text-sm font-bold text-[#800000] dark:text-[#f0a6a6]">{t('thread.title')}</label>
            <input 
              type="text" 
              className="flex-1 border border-gray-400 bg-white p-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        )}
        
        <div className="flex items-center">
          <label className="w-20 text-sm font-bold text-[#800000] dark:text-[#f0a6a6]">{t('thread.name')}</label>
          <input 
            type="text" 
            className="flex-1 border border-gray-400 bg-white p-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder={t('meta.anonymous')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <label className="w-20 text-sm font-bold text-[#800000] dark:text-[#f0a6a6]">{t('thread.email')}</label>
          <input 
            type="text" 
            className="flex-1 border border-gray-400 bg-white p-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="sage"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-start">
          <label className="mt-1 w-20 text-sm font-bold text-[#800000] dark:text-[#f0a6a6]">{t('thread.content')}</label>
          <textarea 
            className="h-32 flex-1 border border-gray-400 bg-white p-1 text-sm font-mono text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {submitError && (
          <InlineErrorNotice
            title={t('error.submitFailedTitle')}
            message={submitError}
          />
        )}

        <div className="flex justify-end gap-2 mt-2">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="border border-gray-400 bg-gray-200 px-4 py-1 text-sm text-gray-800 hover:bg-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              {t('thread.return')}
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="border border-gray-400 bg-[#dddddd] px-6 py-1 text-sm font-bold text-gray-800 hover:bg-white active:bg-gray-300 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            {isSubmitting ? t('meta.loading') : isNewThread ? t('thread.new') : t('thread.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};
