'use client';

import { useTranslation } from 'react-i18next';

import { useThreadPreference } from '../../lib/client/threadPreferences';

export function ThreadFollowButton({ threadId }: { threadId: string }) {
  const { t } = useTranslation();
  const followed = useThreadPreference('followed', threadId);

  return (
    <button
      type="button"
      onClick={followed.toggle}
      className={followed.enabled ? 'themed-secondary-action ml-auto rounded-md px-3 py-1.5' : 'themed-primary-action ml-auto rounded-md px-3 py-1.5'}
    >
      {followed.enabled ? t('meta.following') : t('meta.follow')}
    </button>
  );
}
