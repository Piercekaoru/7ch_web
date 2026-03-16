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
    <div className="bg-[#f0f0f0] min-h-[calc(100vh-3.5rem)] py-12 px-4 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="bg-white p-6 sm:p-10 border border-gray-200 shadow-sm rounded-sm">
          <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {t('servicePause.title')}
            </h1>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 h-6">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              {t('servicePause.badge')}
            </span>
          </div>

          <div className="space-y-4 text-[15px] leading-relaxed text-gray-700 mb-8">
            <p className="font-medium text-gray-900">{t('servicePause.lead')}</p>
            <p>{t('servicePause.body')}</p>
            <div className="text-sm bg-[#fff8e1] p-3 rounded border border-[#ffe082] text-[#8d6e63]">
              <span className="font-bold block mb-1">{t('servicePause.noteTitle')}</span>
              {t('servicePause.noteBody')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <div className="text-xs font-bold text-gray-500 mb-1">{t('servicePause.recoveryLabel')}</div>
              <div className="text-lg font-bold text-[#0056b3]">{nextRecoveryDate}</div>
              <div className="text-xs text-gray-500 mt-1">{t('servicePause.recoveryBody')}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <div className="text-xs font-bold text-gray-500 mb-1">{t('servicePause.windowLabel')}</div>
              <div className="text-lg font-bold text-gray-700">{t('servicePause.windowValue')}</div>
              <div className="text-xs text-gray-500 mt-1">{t('servicePause.windowBody')}</div>
            </div>
          </div>

          {retryPath !== '/' && (
            <div className="mb-8 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
              <span className="font-bold mr-2">{t('servicePause.returnTitle')}</span>
              <code className="text-xs break-all bg-white px-1 py-0.5 rounded border border-blue-200">{retryPath}</code>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 flex gap-3 flex-wrap">
            <button
              onClick={() => window.location.assign(retryPath)}
              className="bg-[#2da0b3] hover:bg-[#238a9b] text-white px-6 py-2 rounded-sm text-sm font-bold transition-colors shadow-sm"
            >
              {t('servicePause.retry')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-2 rounded-sm text-sm font-bold transition-colors shadow-sm"
            >
              {t('servicePause.home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
