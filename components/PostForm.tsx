import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  SendHorizontal,
  Bold,
  Italic,
  Link as LinkIcon,
  Quote,
  Code,
  List,
  Eye,
  Info
} from 'lucide-react';
import { InlineErrorNotice } from './InlineErrorNotice';
import { PostContent } from './PostContent';
import { buildKnownErrorRedirectPath } from '../lib/errorRedirect';
import { getDisplayErrorMessage } from '../lib/errorMessage';
import { CreatePostRequest, CreateThreadRequest } from '../types';

interface PostFormProps {
  boardId?: string;
  threadId?: string;
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isNewThread = !!boardId;
  const hasTripcode = name.includes('#');
  const usesSage = email.toLowerCase().includes('sage');
  const charCount = content.trim().length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert(t('error.required'));
      return;
    }

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

  const handleInsertText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${prefix}${selected}${suffix}${after}`;
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const ToolbarBtn = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded flex items-center justify-center p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">

        {/* Title Area */}
        {isNewThread && (
          <div className="border-b border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-950 px-5 pt-4 pb-3">
            <input
              type="text"
              className="w-full bg-transparent text-xl font-bold text-stone-900 placeholder-stone-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
              placeholder={t('thread.title')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        )}

        {/* Metadata Area (Name, Email) - Styled minimally */}
        <div className="flex flex-wrap items-center gap-4 border-b border-stone-200 bg-stone-50/50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">{t('thread.name')}</span>
            <input
              type="text"
              className="w-32 bg-transparent text-sm text-stone-900 placeholder-stone-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
              placeholder={t('meta.anonymous')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="h-4 w-px bg-stone-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">{t('thread.email')}</span>
            <input
              type="text"
              className="w-32 bg-transparent text-sm text-stone-900 placeholder-stone-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
              placeholder="sage"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Status Badges */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {hasTripcode && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Tripcode
              </span>
            )}
            {usesSage && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                Sage
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-0.5 border-b border-stone-200 bg-stone-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
          <ToolbarBtn icon={Bold} onClick={() => handleInsertText('**', '**')} title="Bold" />
          <ToolbarBtn icon={Italic} onClick={() => handleInsertText('*', '*')} title="Italic" />
          <ToolbarBtn icon={LinkIcon} onClick={() => handleInsertText('[', '](url)')} title="Link" />
          <ToolbarBtn icon={Quote} onClick={() => handleInsertText('> ')} title="Quote" />
          <ToolbarBtn icon={Code} onClick={() => handleInsertText('`', '`')} title="Code" />
          <ToolbarBtn icon={List} onClick={() => handleInsertText('- ')} title="List" />
        </div>

        {/* Editor & Preview Split */}
        <div className="grid min-h-[300px] divide-y divide-stone-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-slate-800">
          {/* Editor */}
          <div className="flex flex-col bg-white dark:bg-slate-950">
            <textarea
              ref={textareaRef}
              data-post-form-textarea="true"
              className="flex-1 resize-none bg-transparent p-4 text-sm font-mono leading-relaxed text-stone-900 placeholder-stone-400 outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
              placeholder={t('thread.content')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col bg-stone-50/30 dark:bg-slate-900/20">
            {content.trim() ? (
              <div className="flex-1 overflow-y-auto p-4 max-h-[400px] lg:max-h-none">
                <PostContent content={content} />
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div className="flex flex-col items-center gap-3 text-stone-400 dark:text-slate-500">
                  <div className="rounded-full bg-stone-100 p-3 dark:bg-slate-800">
                    <Eye className="h-6 w-6" />
                  </div>
                  <p className="max-w-[200px] text-sm leading-relaxed">
                    {t('composer.previewEmpty')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {submitError && (
          <div className="border-t border-stone-200 p-4 dark:border-slate-800">
            <InlineErrorNotice
              title={t('error.submitFailedTitle')}
              message={submitError}
            />
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-slate-400">
            <span>
              {t('composer.characterCount')} <span className="font-semibold text-stone-700 dark:text-slate-300">{charCount}</span>
            </span>
            <div className="hidden items-center gap-1 sm:flex">
              <Info className="h-4 w-4" />
              <span>{t('composer.hintQuote')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-sm font-medium text-stone-600 transition hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {t('thread.return')}
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-[#0f6c8d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b5672] disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              <SendHorizontal className="h-4 w-4" />
              {isSubmitting ? t('meta.loading') : isNewThread ? t('thread.new') : t('thread.submit')}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
