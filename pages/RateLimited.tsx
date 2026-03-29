import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSafeInternalPathFromSearch } from '../lib/safeNavigation';
import { parseRetryAfterFromSearch } from '../lib/rateLimit';

const formatRetryAfter = (retryAfterSeconds: number | null, language: string) => {
  if (!retryAfterSeconds) return null;

  if (retryAfterSeconds < 60) {
    return language === 'ja-JP' ? `${retryAfterSeconds}秒ほど` : `约 ${retryAfterSeconds} 秒`;
  }

  if (retryAfterSeconds < 3600) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return language === 'ja-JP' ? `${minutes}分ほど` : `约 ${minutes} 分钟`;
  }

  const hours = Math.ceil(retryAfterSeconds / 3600);
  return language === 'ja-JP' ? `${hours}時間ほど` : `约 ${hours} 小时`;
};

export const RateLimited: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const retryPath = getSafeInternalPathFromSearch(location.search);
  const retryAfterSeconds = parseRetryAfterFromSearch(location.search);
  const waitValue = formatRetryAfter(retryAfterSeconds, i18n.language) ?? t('rateLimit.waitValueFallback');

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] justify-center bg-[#f0f0f0] px-4 py-12 dark:bg-background">
      <div className="flex w-full max-w-5xl flex-col items-start gap-6 md:flex-row">
        <div className="w-full flex-1 rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-10">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700 sm:flex-row sm:items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-2xl">
              {t('rateLimit.title')}
            </h1>
            <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800/40">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {t('rateLimit.badge')}
            </span>
          </div>

          <div className="mb-8 space-y-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('rateLimit.lead')}</p>
            <p>{t('rateLimit.body')}</p>
            <div className="rounded border border-sky-100 bg-sky-50 p-3 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
              <span className="mb-1 block font-bold">{t('rateLimit.noteTitle')}</span>
              {t('rateLimit.noteBody')}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
              <div className="mb-1 text-xs font-bold text-gray-500 dark:text-gray-400">{t('rateLimit.waitLabel')}</div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{waitValue}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('rateLimit.waitBody')}</div>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
              <div className="mb-1 text-xs font-bold text-gray-500 dark:text-gray-400">{t('rateLimit.causeLabel')}</div>
              <div className="text-lg font-bold text-gray-700 dark:text-gray-100">{t('rateLimit.causeValue')}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('rateLimit.causeBody')}</div>
            </div>
          </div>

          {retryPath !== '/' && (
            <div className="mb-8 rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
              <span className="mr-2 font-bold">{t('rateLimit.returnTitle')}</span>
              <code className="break-all rounded border border-blue-200 bg-white px-1 py-0.5 text-xs dark:border-sky-800 dark:bg-gray-900 dark:text-gray-100">{retryPath}</code>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <button
              onClick={() => window.location.assign(retryPath)}
              className="rounded-sm bg-[#2da0b3] px-6 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#238a9b]"
            >
              {t('rateLimit.retry')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-sm border border-gray-300 bg-white px-6 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              {t('rateLimit.home')}
            </button>
          </div>
        </div>

        <div className="sticky top-6 flex w-full shrink-0 flex-col gap-3 md:w-80">
          <h2 className="px-1 text-lg font-bold text-gray-800 dark:text-gray-100">
            {t('rateLimit.availableServices')}
          </h2>
          <div className="flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <Link to="/" className="block border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800">
              {t('nav.boards')}
            </Link>
            <Link to="/changelog" className="block border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800">
              Changelog
            </Link>
            <Link to="/help" className="block border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800">
              {t('footer.help')}
            </Link>
            <Link to="/QA" className="block border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800">
              {t('footer.QA')}
            </Link>
            <Link to="/docs" className="block border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800">
              {t('footer.tech')}
            </Link>
            <Link to="/privacy" className="block border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="block px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
