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
import {
  buildJobMetaFromDraft,
  createEmptyJobMetaDraft,
  isBaitoBoard,
  type JobMetaDraft,
  validateJobMetaDraft,
} from '../lib/jobMeta';

interface PostFormProps {
  boardId?: string;
  threadId?: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const ToolbarBtn = ({
  icon: Icon,
  onClick,
  title,
}: {
  icon: any;
  onClick: () => void;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="rounded flex items-center justify-center p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
  >
    <Icon className="h-4 w-4" />
  </button>
);

const JobField: React.FC<{
  label: string;
  children: React.ReactNode;
  optional?: boolean;
  optionalLabel: string;
}> = ({ label, children, optional = false, optionalLabel }) => (
  <label className="flex flex-col gap-1.5 text-sm">
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-slate-400">
      <span>{label}</span>
      {optional && (
        <span className="rounded-full border border-stone-300 px-2 py-0.5 text-[10px] normal-case text-stone-500 dark:border-slate-700 dark:text-slate-400">
          {optionalLabel}
        </span>
      )}
    </span>
    {children}
  </label>
);

export const PostForm: React.FC<PostFormProps> = ({ boardId, threadId, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [jobMetaDraft, setJobMetaDraft] = useState<JobMetaDraft>(() => createEmptyJobMetaDraft());

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isNewThread = !!boardId;
  const isBaitoThreadForm = isNewThread && isBaitoBoard(boardId);
  const hasTripcode = name.includes('#');
  const usesSage = email.toLowerCase().includes('sage');
  const charCount = content.trim().length;

  const transportationOptions = ['yes', 'partial', 'no'] as const;
  const yesNoOptions = ['yes', 'no'] as const;
  const yesNoUnknownOptions = ['yes', 'no', 'unknown'] as const;
  const japaneseRequirementOptions = ['n1', 'n2', 'n3', 'simple_conversation', 'unrestricted'] as const;
  const contactTypeOptions = ['phone', 'email', 'line', 'wechat', 'url', 'other'] as const;

  const updateJobMeta = <K extends keyof JobMetaDraft>(key: K, value: JobMetaDraft[K]) => {
    setJobMetaDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!content.trim()) {
      setSubmitError(t('error.required'));
      return;
    }

    if (isBaitoThreadForm) {
      const validationError = validateJobMetaDraft(jobMetaDraft, t);
      if (validationError) {
        setSubmitError(validationError);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isNewThread) {
        const payload: CreateThreadRequest = {
          boardId: boardId!,
          title: title.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          content: content.trim(),
          jobMeta: isBaitoThreadForm ? buildJobMetaFromDraft(jobMetaDraft) : undefined,
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

  const jobInputClassName = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
  const jobSelectClassName = `${jobInputClassName} appearance-none`;

  return (
    <div className="flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">

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

        {isBaitoThreadForm && (
          <div className="border-b border-stone-200 bg-stone-50/40 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-stone-900 dark:text-slate-100">{t('job.form.sectionTitle')}</div>
                <div className="text-xs text-stone-500 dark:text-slate-400">{t('job.form.sectionBody')}</div>
              </div>
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                {t('job.form.requiredBadge')}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <JobField label={t('job.fields.region')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.region}
                  onChange={(e) => updateJobMeta('region', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.nearestStation')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.nearestStation}
                  onChange={(e) => updateJobMeta('nearestStation', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.hourlyWageMinJpy')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={jobInputClassName}
                  value={jobMetaDraft.hourlyWageMinJpy}
                  onChange={(e) => updateJobMeta('hourlyWageMinJpy', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.hourlyWageMaxJpy')} optional optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={jobInputClassName}
                  value={jobMetaDraft.hourlyWageMaxJpy}
                  onChange={(e) => updateJobMeta('hourlyWageMaxJpy', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.hourlyWageNote')} optional optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.hourlyWageNote}
                  onChange={(e) => updateJobMeta('hourlyWageNote', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.monthlyWageMinJpy')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={jobInputClassName}
                  value={jobMetaDraft.monthlyWageMinJpy}
                  onChange={(e) => updateJobMeta('monthlyWageMinJpy', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.monthlyWageMaxJpy')} optional optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={jobInputClassName}
                  value={jobMetaDraft.monthlyWageMaxJpy}
                  onChange={(e) => updateJobMeta('monthlyWageMaxJpy', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.monthlyWageNote')} optional optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.monthlyWageNote}
                  onChange={(e) => updateJobMeta('monthlyWageNote', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.transportationCovered')} optionalLabel={t('job.form.optional')}>
                <select
                  className={jobSelectClassName}
                  value={jobMetaDraft.transportationCovered}
                  onChange={(e) => updateJobMeta('transportationCovered', e.target.value as JobMetaDraft['transportationCovered'])}
                >
                  <option value="">{t('job.form.selectPlaceholder')}</option>
                  {transportationOptions.map((option) => (
                    <option key={option} value={option}>{t(`job.options.transportationCovered.${option}`)}</option>
                  ))}
                </select>
              </JobField>

              <JobField label={t('job.fields.internationalStudentsAccepted')} optionalLabel={t('job.form.optional')}>
                <select
                  className={jobSelectClassName}
                  value={jobMetaDraft.internationalStudentsAccepted}
                  onChange={(e) => updateJobMeta('internationalStudentsAccepted', e.target.value as JobMetaDraft['internationalStudentsAccepted'])}
                >
                  <option value="">{t('job.form.selectPlaceholder')}</option>
                  {yesNoOptions.map((option) => (
                    <option key={option} value={option}>{t(`job.options.yesNo.${option}`)}</option>
                  ))}
                </select>
              </JobField>

              <JobField label={t('job.fields.noExperienceAccepted')} optionalLabel={t('job.form.optional')}>
                <select
                  className={jobSelectClassName}
                  value={jobMetaDraft.noExperienceAccepted}
                  onChange={(e) => updateJobMeta('noExperienceAccepted', e.target.value as JobMetaDraft['noExperienceAccepted'])}
                >
                  <option value="">{t('job.form.selectPlaceholder')}</option>
                  {yesNoOptions.map((option) => (
                    <option key={option} value={option}>{t(`job.options.yesNo.${option}`)}</option>
                  ))}
                </select>
              </JobField>

              <JobField label={t('job.fields.japaneseRequirement')} optionalLabel={t('job.form.optional')}>
                <select
                  className={jobSelectClassName}
                  value={jobMetaDraft.japaneseRequirement}
                  onChange={(e) => updateJobMeta('japaneseRequirement', e.target.value as JobMetaDraft['japaneseRequirement'])}
                >
                  <option value="">{t('job.form.selectPlaceholder')}</option>
                  {japaneseRequirementOptions.map((option) => (
                    <option key={option} value={option}>{t(`job.options.japaneseRequirement.${option}`)}</option>
                  ))}
                </select>
              </JobField>

              <JobField label={t('job.fields.visaRequirement')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.visaRequirement}
                  onChange={(e) => updateJobMeta('visaRequirement', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.shiftStyle')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.shiftStyle}
                  onChange={(e) => updateJobMeta('shiftStyle', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.housingProvided')} optionalLabel={t('job.form.optional')}>
                <select
                  className={jobSelectClassName}
                  value={jobMetaDraft.housingProvided}
                  onChange={(e) => updateJobMeta('housingProvided', e.target.value as JobMetaDraft['housingProvided'])}
                >
                  <option value="">{t('job.form.selectPlaceholder')}</option>
                  {yesNoOptions.map((option) => (
                    <option key={option} value={option}>{t(`job.options.yesNo.${option}`)}</option>
                  ))}
                </select>
              </JobField>

              <JobField label={t('job.fields.housingSubsidy')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.housingSubsidy}
                  onChange={(e) => updateJobMeta('housingSubsidy', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.hasChineseStaff')} optionalLabel={t('job.form.optional')}>
                <select
                  className={jobSelectClassName}
                  value={jobMetaDraft.hasChineseStaff}
                  onChange={(e) => updateJobMeta('hasChineseStaff', e.target.value as JobMetaDraft['hasChineseStaff'])}
                >
                  <option value="">{t('job.form.selectPlaceholder')}</option>
                  {yesNoUnknownOptions.map((option) => (
                    <option key={option} value={option}>{t(`job.options.yesNoUnknown.${option}`)}</option>
                  ))}
                </select>
              </JobField>

              <JobField label={t('job.fields.businessType')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.businessType}
                  onChange={(e) => updateJobMeta('businessType', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.companySize')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.companySize}
                  onChange={(e) => updateJobMeta('companySize', e.target.value)}
                />
              </JobField>

              <JobField label={t('job.fields.contactType')} optionalLabel={t('job.form.optional')}>
                <select
                  className={jobSelectClassName}
                  value={jobMetaDraft.contactType}
                  onChange={(e) => updateJobMeta('contactType', e.target.value as JobMetaDraft['contactType'])}
                >
                  <option value="">{t('job.form.selectPlaceholder')}</option>
                  {contactTypeOptions.map((option) => (
                    <option key={option} value={option}>{t(`job.options.contactType.${option}`)}</option>
                  ))}
                </select>
              </JobField>

              <JobField label={t('job.fields.contactValue')} optionalLabel={t('job.form.optional')}>
                <input
                  type="text"
                  className={jobInputClassName}
                  value={jobMetaDraft.contactValue}
                  onChange={(e) => updateJobMeta('contactValue', e.target.value)}
                />
              </JobField>
            </div>
          </div>
        )}

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
