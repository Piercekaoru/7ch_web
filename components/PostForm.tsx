import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { buildServicePausedPath, isServicePausedCandidateError } from '../lib/servicePause';
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
      if (isServicePausedCandidateError(err)) {
        window.location.assign(buildServicePausedPath(`${location.pathname}${location.search}`));
        return;
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f0e0d6] p-4 border border-[#ccb] rounded shadow-sm max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {isNewThread && (
          <div className="flex items-center">
            <label className="w-20 text-sm font-bold text-[#800000]">{t('thread.title')}</label>
            <input 
              type="text" 
              className="flex-1 p-1 border border-gray-400 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        )}
        
        <div className="flex items-center">
          <label className="w-20 text-sm font-bold text-[#800000]">{t('thread.name')}</label>
          <input 
            type="text" 
            className="flex-1 p-1 border border-gray-400 text-sm"
            placeholder={t('meta.anonymous')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <label className="w-20 text-sm font-bold text-[#800000]">{t('thread.email')}</label>
          <input 
            type="text" 
            className="flex-1 p-1 border border-gray-400 text-sm"
            placeholder="sage"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-start">
          <label className="w-20 text-sm font-bold text-[#800000] mt-1">{t('thread.content')}</label>
          <textarea 
            className="flex-1 p-1 border border-gray-400 text-sm font-mono h-32"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-1 bg-gray-200 border border-gray-400 text-sm hover:bg-gray-300"
            >
              {t('thread.return')}
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-1 bg-[#dddddd] border border-gray-400 text-sm font-bold hover:bg-white active:bg-gray-300 disabled:opacity-50"
          >
            {isSubmitting ? t('meta.loading') : isNewThread ? t('thread.new') : t('thread.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};
