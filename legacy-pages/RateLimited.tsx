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
    <div className="themed-page flex min-h-[calc(100vh-3.5rem)] justify-center px-4 py-12">
      <div className="flex w-full max-w-5xl flex-col items-start gap-6 md:flex-row">
        <div className="themed-static-main w-full flex-1 p-6 sm:p-10">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
            <h1 className="themed-heading text-xl sm:text-2xl">
              {t('rateLimit.title')}
            </h1>
            <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800/40">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {t('rateLimit.badge')}
            </span>
          </div>

          <div className="mb-8 space-y-4 text-[15px] leading-relaxed text-foreground">
            <p className="font-medium text-foreground">{t('rateLimit.lead')}</p>
            <p>{t('rateLimit.body')}</p>
            <div className="themed-callout-info p-3 text-sm">
              <span className="mb-1 block font-bold">{t('rateLimit.noteTitle')}</span>
              {t('rateLimit.noteBody')}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="themed-metric-card p-4">
              <div className="themed-kicker mb-1">{t('rateLimit.waitLabel')}</div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{waitValue}</div>
              <div className="themed-meta mt-1 text-xs">{t('rateLimit.waitBody')}</div>
            </div>
            <div className="themed-metric-card p-4">
              <div className="themed-kicker mb-1">{t('rateLimit.causeLabel')}</div>
              <div className="text-lg font-bold text-foreground">{t('rateLimit.causeValue')}</div>
              <div className="themed-meta mt-1 text-xs">{t('rateLimit.causeBody')}</div>
            </div>
          </div>

          {retryPath !== '/' && (
            <div className="themed-callout-info mb-8 p-3 text-sm">
              <span className="mr-2 font-bold">{t('rateLimit.returnTitle')}</span>
              <code className="themed-code-inline break-all px-1 py-0.5 text-xs">{retryPath}</code>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <button
              onClick={() => window.location.assign(retryPath)}
              className="themed-primary-action rounded-xl px-6 py-2 text-sm font-bold transition-colors"
            >
              {t('rateLimit.retry')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="themed-secondary-action rounded-xl px-6 py-2 text-sm font-bold transition-colors"
            >
              {t('rateLimit.home')}
            </button>
          </div>
        </div>

        <div className="sticky top-6 flex w-full shrink-0 flex-col gap-3 md:w-80">
          <h2 className="themed-heading-sm px-1 text-lg">
            {t('rateLimit.availableServices')}
          </h2>
          <div className="themed-static-sidebar flex flex-col overflow-hidden">
            <Link to="/" className="block border-b border-border px-4 py-3 text-sm font-medium themed-nav-link transition-colors hover:bg-secondary">
              {t('nav.boards')}
            </Link>
            <Link to="/changelog" className="block border-b border-border px-4 py-3 text-sm font-medium themed-nav-link transition-colors hover:bg-secondary">
              Changelog
            </Link>
            <Link to="/help" className="block border-b border-border px-4 py-3 text-sm font-medium themed-nav-link transition-colors hover:bg-secondary">
              {t('footer.help')}
            </Link>
            <Link to="/QA" className="block border-b border-border px-4 py-3 text-sm font-medium themed-nav-link transition-colors hover:bg-secondary">
              {t('footer.QA')}
            </Link>
            <Link to="/docs" className="block border-b border-border px-4 py-3 text-sm font-medium themed-nav-link transition-colors hover:bg-secondary">
              {t('footer.tech')}
            </Link>
            <Link to="/privacy" className="block border-b border-border px-4 py-3 text-sm font-medium themed-nav-link transition-colors hover:bg-secondary">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="block px-4 py-3 text-sm font-medium themed-nav-link transition-colors hover:bg-secondary">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
