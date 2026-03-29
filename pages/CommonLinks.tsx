import React from 'react';
import { ArrowLeft, ExternalLink, Lock, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { commonLinks, getCommonLinkById } from '../data/commonLinks';
import { formatLocalizedCalendarDate } from '../lib/date';

interface CommonLinksBoardProps {
  onBack: () => void;
  search: string;
}

interface CommonLinkDetailProps {
  onBack: () => void;
}

export const CommonLinksBoard: React.FC<CommonLinksBoardProps> = ({ onBack, search }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const filteredLinks = search.trim()
    ? commonLinks.filter((item) => {
        const keyword = search.trim().toLowerCase();
        const text = [
          item.id,
          item.title,
          t(item.descriptionKey),
          ...item.tagKeys.map((tagKey) => t(tagKey)),
        ].join(' ').toLowerCase();
        return text.includes(keyword);
      })
    : commonLinks;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f0f0f0] pb-10 dark:bg-background">
      <div className="mx-auto max-w-4xl px-2 py-6 sm:px-4">
        <div className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-700 dark:text-gray-100">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm font-normal text-[#0056b3] hover:underline dark:text-sky-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('commonLinks.back')}
          </button>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span>/{commonLinks[0]?.boardId ?? 'links'}/</span>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span>{t('board.links.name')}</span>
        </div>

        <section className="mb-6 rounded-sm border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/40">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-sky-900 dark:text-sky-100">
            <Lock className="h-4 w-4" />
            {t('commonLinks.readOnlyTitle')}
          </div>
          <p className="text-sm leading-relaxed text-sky-800 dark:text-sky-200">
            {t('commonLinks.readOnlyBody')}
          </p>
        </section>

        <div className="space-y-4">
          {filteredLinks.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/board/${item.boardId}/thread/${item.id}`)}
              className="cursor-pointer rounded-sm border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800/70"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>{formatLocalizedCalendarDate(new Date(item.updatedAt), i18n.language)}</span>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-700 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                  {t('commonLinks.staticBadge')}
                </span>
                {item.tagKeys.map((tagKey) => (
                  <span
                    key={tagKey}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {t(tagKey)}
                  </span>
                ))}
              </div>

              <div className="mb-2 text-lg font-bold text-[#0056b3] dark:text-sky-300">
                {item.title}
              </div>

              <div className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t(item.descriptionKey)}
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 text-[#2da0b3] dark:text-cyan-300">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('commonLinks.openSite')}
                </span>
                {item.repoHref && (
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    {t('commonLinks.viewSource')}
                  </span>
                )}
                <span className="ml-auto text-[#0056b3] dark:text-sky-300">
                  {t('commonLinks.viewDetail')}
                </span>
              </div>
            </div>
          ))}

          {filteredLinks.length === 0 && (
            <div className="rounded border border-gray-200 bg-white p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              {t('commonLinks.empty')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommonLinkDetail: React.FC<CommonLinkDetailProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const { linkId } = useParams();

  const item = linkId ? getCommonLinkById(linkId) : null;

  if (!item) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#f0f0f0] pb-10 dark:bg-background">
        <div className="mx-auto max-w-4xl px-2 py-6 sm:px-4">
          <div className="rounded border border-gray-200 bg-white p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {t('commonLinks.notFound')}
          </div>
        </div>
      </div>
    );
  }

  const featureCards = item.featureKeyPrefixes.map((prefix) => ({
    title: t(`${prefix}.title`),
    body: t(`${prefix}.body`),
  }));

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f0f0f0] pb-10 dark:bg-background">
      <div className="mx-auto max-w-4xl px-2 py-6 sm:px-4">
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button onClick={onBack} className="text-[#0056b3] hover:underline dark:text-sky-300">
            &lt; {t('board.links.name')}
          </button>
          <span>/ {item.title} /</span>
        </div>

        <div className="mb-4 rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            <span>{formatLocalizedCalendarDate(new Date(item.updatedAt), i18n.language)}</span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-700 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
              {t('commonLinks.staticBadge')}
            </span>
            {item.tagKeys.map((tagKey) => (
              <span
                key={tagKey}
                className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {t(tagKey)}
              </span>
            ))}
          </div>

          <h1 className="mb-3 text-2xl font-bold text-[#333] dark:text-gray-100">{item.title}</h1>
          <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
            {t(item.descriptionKey)}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-[#2da0b3] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#238a9b]"
            >
              {t('commonLinks.openSite')}
              <ExternalLink className="h-4 w-4" />
            </a>
            {item.repoHref && (
                <a
                  href={item.repoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                {t('commonLinks.viewSource')}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">{feature.title}</div>
              <div className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">{feature.body}</div>
            </div>
          ))}

          <div className="rounded-sm border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
            <div className="mb-1 text-sm font-bold text-amber-900 dark:text-amber-100">
              {t(item.bestForTitleKey)}
            </div>
            <p className="text-[15px] leading-relaxed text-amber-800 dark:text-amber-200">
              {t(item.bestForBodyKey)}
            </p>
          </div>

          <div className="rounded-sm border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">
              {t('commonLinks.disclaimerTitle')}
            </div>
            <div className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
              {t('commonLinks.disclaimerBody')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
