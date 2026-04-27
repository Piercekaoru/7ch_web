'use client';

import type React from 'react';
import { useTranslation } from 'react-i18next';

import { useThreadPreference } from '../../lib/client/threadPreferences';

interface ThreadCardShellProps {
  children: React.ReactNode;
  threadId: string;
  title: string;
}

export function ThreadCardShell({ children, threadId, title }: ThreadCardShellProps) {
  const { t } = useTranslation();
  const hidden = useThreadPreference('hidden', threadId);
  const followed = useThreadPreference('followed', threadId);

  if (hidden.enabled) {
    return (
      <div className="themed-card-muted flex items-center justify-between gap-3 p-3 text-xs">
        <span className="font-bold">{t('meta.hidden_thread')}：{title.slice(0, 40)}</span>
        <button type="button" onClick={hidden.toggle} className="themed-inline-action">
          [{t('meta.show')}]
        </button>
      </div>
    );
  }

  return (
    <article className="themed-card themed-card-featured relative p-5 sm:p-6">
      {children}
      <div className="mt-4 flex flex-wrap justify-end gap-2 text-xs font-bold">
        <button type="button" onClick={hidden.toggle} className="themed-secondary-action rounded-md px-3 py-1.5">
          {t('meta.hide')}
        </button>
        <button
          type="button"
          onClick={followed.toggle}
          className={followed.enabled ? 'themed-secondary-action rounded-md px-3 py-1.5' : 'themed-primary-action rounded-md px-3 py-1.5'}
        >
          {followed.enabled ? t('meta.following') : t('meta.follow')}
        </button>
      </div>
    </article>
  );
}
