'use client';

import { useTranslation } from 'react-i18next';

import { useThreadPreference } from '../../lib/client/threadPreferences';

const getSubscribeCopy = (language?: string) => {
  const isJapanese = language?.startsWith('ja');
  return isJapanese
    ? {
        subscribe: '購読',
        subscribed: '購読中',
        subscribeAria: 'このスレッドを購読する',
        subscribedAria: 'このスレッドの購読を解除する',
      }
    : {
        subscribe: '订阅',
        subscribed: '已订阅',
        subscribeAria: '订阅这个帖子',
        subscribedAria: '取消订阅这个帖子',
      };
};

export function ThreadFollowButton({ threadId }: { threadId: string }) {
  const { i18n } = useTranslation();
  const followed = useThreadPreference('followed', threadId);
  const copy = getSubscribeCopy(i18n.language);

  return (
    <button
      type="button"
      aria-pressed={followed.enabled}
      aria-label={followed.enabled ? copy.subscribedAria : copy.subscribeAria}
      onClick={followed.toggle}
      className={followed.enabled ? 'themed-secondary-action ml-auto rounded-md px-3 py-1.5' : 'themed-primary-action ml-auto rounded-md px-3 py-1.5'}
    >
      {followed.enabled ? copy.subscribed : copy.subscribe}
    </button>
  );
}
