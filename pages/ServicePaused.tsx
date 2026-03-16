import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNextRecoveryDate } from '../lib/servicePause';

const formatDateForLocale = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const getRetryPath = (search: string) => {
  const params = new URLSearchParams(search);
  const from = params.get('from');
  return from && from.startsWith('/') ? from : '/';
};

export const ServicePaused: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const retryPath = getRetryPath(location.search);
  const nextRecoveryDate = formatDateForLocale(
    getNextRecoveryDate(),
    i18n.language === 'ja-JP' ? 'ja-JP' : 'zh-CN'
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] justify-center bg-[#f0f0f0] px-4 py-12 dark:bg-background">
      <div className="w-full max-w-3xl">
        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-10">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700 sm:flex-row sm:items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-2xl">
              {t('servicePause.title')}
            </h1>
            <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-800/40">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              {t('servicePause.badge')}
            </span>
          </div>

          <div className="mb-8 space-y-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('servicePause.lead')}</p>
            <p>{t('servicePause.body')}</p>
            <div className="rounded border border-[#ffe082] bg-[#fff8e1] p-3 text-sm text-[#8d6e63] dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <span className="mb-1 block font-bold">{t('servicePause.noteTitle')}</span>
              {t('servicePause.noteBody')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
              <div className="mb-1 text-xs font-bold text-gray-500 dark:text-gray-400">{t('servicePause.recoveryLabel')}</div>
              <div className="text-lg font-bold text-[#0056b3] dark:text-sky-300">{nextRecoveryDate}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('servicePause.recoveryBody')}</div>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
              <div className="mb-1 text-xs font-bold text-gray-500 dark:text-gray-400">{t('servicePause.windowLabel')}</div>
              <div className="text-lg font-bold text-gray-700 dark:text-gray-100">{t('servicePause.windowValue')}</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('servicePause.windowBody')}</div>
            </div>
          </div>

          {retryPath !== '/' && (
            <div className="mb-8 rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
              <span className="mr-2 font-bold">{t('servicePause.returnTitle')}</span>
              <code className="break-all rounded border border-blue-200 bg-white px-1 py-0.5 text-xs dark:border-sky-800 dark:bg-gray-900 dark:text-gray-100">{retryPath}</code>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <button
              onClick={() => window.location.assign(retryPath)}
              className="bg-[#2da0b3] hover:bg-[#238a9b] text-white px-6 py-2 rounded-sm text-sm font-bold transition-colors shadow-sm"
            >
              {t('servicePause.retry')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-sm border border-gray-300 bg-white px-6 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              {t('servicePause.home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
