import type { Metadata } from 'next';

import { SubscriptionConverter, type SubscriptionConverterLabels } from '../../../features/tools/SubscriptionConverter.client';
import { tServer } from '../../../lib/i18n/dictionaries';
import { getServerLocale } from '../../../lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = tServer('page.subscribe.title', locale);
  const description = tServer('page.subscribe.metaDescription', locale);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

const labelKeys = [
  'page.subscribe.title',
  'page.subscribe.subtitle',
  'page.subscribe.sourceLabel',
  'page.subscribe.sourcePlaceholder',
  'page.subscribe.sourceHelp',
  'page.subscribe.sourceFormat',
  'page.subscribe.targetFormat',
  'page.subscribe.convert',
  'page.subscribe.converting',
  'page.subscribe.createLink',
  'page.subscribe.creatingLink',
  'page.subscribe.resultTitle',
  'page.subscribe.warningsTitle',
  'page.subscribe.copy',
  'page.subscribe.copied',
  'page.subscribe.download',
  'page.subscribe.linkTitle',
  'page.subscribe.linkHelp',
  'page.subscribe.emptyTitle',
  'page.subscribe.emptyBody',
  'page.subscribe.invalidUrl',
  'page.subscribe.genericError',
  'page.subscribe.metaPrefix',
] as const;

const labelMap: Record<typeof labelKeys[number], keyof SubscriptionConverterLabels> = {
  'page.subscribe.title': 'title',
  'page.subscribe.subtitle': 'subtitle',
  'page.subscribe.sourceLabel': 'sourceLabel',
  'page.subscribe.sourcePlaceholder': 'sourcePlaceholder',
  'page.subscribe.sourceHelp': 'sourceHelp',
  'page.subscribe.sourceFormat': 'sourceFormat',
  'page.subscribe.targetFormat': 'targetFormat',
  'page.subscribe.convert': 'convert',
  'page.subscribe.converting': 'converting',
  'page.subscribe.createLink': 'createLink',
  'page.subscribe.creatingLink': 'creatingLink',
  'page.subscribe.resultTitle': 'resultTitle',
  'page.subscribe.warningsTitle': 'warningsTitle',
  'page.subscribe.copy': 'copy',
  'page.subscribe.copied': 'copied',
  'page.subscribe.download': 'download',
  'page.subscribe.linkTitle': 'linkTitle',
  'page.subscribe.linkHelp': 'linkHelp',
  'page.subscribe.emptyTitle': 'emptyTitle',
  'page.subscribe.emptyBody': 'emptyBody',
  'page.subscribe.invalidUrl': 'invalidUrl',
  'page.subscribe.genericError': 'genericError',
  'page.subscribe.metaPrefix': 'metaPrefix',
};

export default async function ConvertPage() {
  const locale = await getServerLocale();
  const labels = labelKeys.reduce((acc, key) => {
    acc[labelMap[key]] = tServer(key, locale);
    return acc;
  }, {} as SubscriptionConverterLabels);

  return (
    <div className="themed-page">
      <SubscriptionConverter labels={labels} />
    </div>
  );
}
