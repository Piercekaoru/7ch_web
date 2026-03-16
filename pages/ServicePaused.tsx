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
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f8f5ee_0%,#f2f2ef_44%,#e9edf1_100%)] min-h-[calc(100vh-3.5rem)]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-8rem] top-12 h-52 w-52 rounded-full bg-[#b8d8df] blur-3xl" />
        <div className="absolute right-[-4rem] top-32 h-56 w-56 rounded-full bg-[#f3cf9c] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-44 w-[28rem] -translate-x-1/2 rounded-full bg-[#d3dde8] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#9bb4c7] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c85a54]" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-[#4a6075]">
            {t('servicePause.badge')}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <section className="overflow-hidden rounded-3xl border border-[#d7d7d2] bg-white/90 shadow-[0_24px_60px_rgba(76,92,112,0.12)] backdrop-blur">
            <div className="border-b border-dashed border-[#d8d4cb] bg-[#f7f1e7] px-6 py-5 sm:px-8">
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#7e6c57]">
                Monthly Availability Notice
              </div>
            </div>

            <div className="px-6 py-7 sm:px-8 sm:py-9">
              <h1 className="max-w-2xl text-3xl font-bold leading-tight text-[#26374a] sm:text-4xl">
                {t('servicePause.title')}
              </h1>

              <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#475569] sm:text-base">
                <p>{t('servicePause.lead')}</p>
                <p>{t('servicePause.body')}</p>
              </div>

              {retryPath !== '/' && (
                <div className="mt-6 rounded-2xl border border-[#d8e0e7] bg-[#f7fafc] px-4 py-3 text-sm text-[#506172]">
                  <div className="font-medium text-[#334155]">{t('servicePause.returnTitle')}</div>
                  <div className="mt-1 break-all font-mono text-[12px] text-[#64748b]">{retryPath}</div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.location.assign(retryPath)}
                  className="rounded-full bg-[#234b67] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1c3d53]"
                >
                  {t('servicePause.retry')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="rounded-full border border-[#cbd5df] bg-white px-5 py-2.5 text-sm font-bold text-[#3a4d5f] transition-colors hover:bg-[#f7fafc]"
                >
                  {t('servicePause.home')}
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#d7d7d2] bg-white/90 p-6 shadow-[0_18px_40px_rgba(76,92,112,0.1)] backdrop-blur">
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#7c8ea1]">
                {t('servicePause.recoveryLabel')}
              </div>
              <div className="mt-4 text-3xl font-bold text-[#234b67]">{nextRecoveryDate}</div>
              <p className="mt-3 text-sm leading-6 text-[#526273]">{t('servicePause.recoveryBody')}</p>
            </div>

            <div className="rounded-3xl border border-[#d7d7d2] bg-[#f8fafb] p-6 shadow-[0_18px_40px_rgba(76,92,112,0.08)]">
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#7c8ea1]">
                {t('servicePause.windowLabel')}
              </div>
              <div className="mt-4 text-2xl font-bold text-[#2b475e]">{t('servicePause.windowValue')}</div>
              <p className="mt-3 text-sm leading-6 text-[#526273]">{t('servicePause.windowBody')}</p>
            </div>

            <div className="rounded-3xl border border-dashed border-[#d8cfbe] bg-[#fcf8ef] p-6">
              <div className="font-bold text-[#6d5f4b]">{t('servicePause.noteTitle')}</div>
              <p className="mt-2 text-sm leading-6 text-[#6c6257]">{t('servicePause.noteBody')}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
